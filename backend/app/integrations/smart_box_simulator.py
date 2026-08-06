"""
KHG Smart Box Hardware Simulator
=================================
Simulates the physical KHG Smart Box IoT device feeding sensor data
to the backend via the /api/v1/sensors/ingest endpoint.

Component specs (from smart_health_box_(2)_CONFIG.json):
  - Main MCU: ESP32-S3 (Wi-Fi + BLE)
  - Cellular: SIM7600G-H 4G/LTE modem
  - GPS: NEO-M9N GNSS module
  - Temperature/Humidity: DHT22 (±0.5°C, ±2-5%RH)
  - Air Quality: SDS011 PM2.5 + MH-Z19B CO2
  - UV Index: GUVA-S12SD
  - Rainfall: Tipping bucket 0.2mm/tip
  - Occupancy: HC-SR501 PIR + OV5640 camera
  - Flood: Capacitive water level sensor
  - Display: 0.96" OLED SSD1306
  - Power: 3x 18650 Li-ion (BMS) + 20W solar panel
  - Communication: LoRa SX1276 fallback

Usage:
  python -m app.integrations.smart_box_simulator
  python -m app.integrations.smart_box_simulator --scenario MALARIA_OUTBREAK
  python -m app.integrations.smart_box_simulator --interval 5 --devices 3
"""

import asyncio
import random
import time
import argparse
import httpx
from datetime import datetime
from typing import List, Dict, Optional

# ─── Configuration ────────────────────────────────────────────────────────────
DEFAULT_BACKEND_URL = "http://localhost:8000"
DEVICE_API_KEY = "khg-smart-box-master-key-2024"
DEFAULT_INTERVAL_SECONDS = 10

# ─── Scenario Definitions ─────────────────────────────────────────────────────
# Each scenario overrides the random ranges to simulate specific conditions
SCENARIOS = {
    "NORMAL": {
        "description": "Normal environmental conditions",
        "temperature": (28, 34),
        "humidity": (45, 70),
        "air_quality": (20, 80),
        "uv_index": (3, 7),
        "rainfall": (0, 5),
        "overcrowding_index": (20, 60),
        "flood_risk": (0.0, 0.2),
    },
    "MALARIA_OUTBREAK": {
        "description": "High rainfall + humidity — mosquito breeding conditions",
        "temperature": (30, 36),
        "humidity": (75, 95),
        "air_quality": (20, 60),
        "uv_index": (2, 5),
        "rainfall": (80, 150),
        "overcrowding_index": (60, 100),
        "flood_risk": (0.6, 0.95),
    },
    "HEATWAVE": {
        "description": "Extreme heat stress — high UV, temperatures > 40°C",
        "temperature": (40, 45),
        "humidity": (15, 35),
        "air_quality": (40, 120),
        "uv_index": (10, 12),
        "rainfall": (0, 0.5),
        "overcrowding_index": (30, 70),
        "flood_risk": (0.0, 0.05),
    },
    "FLOOD": {
        "description": "Severe flooding event — high rainfall and flood risk",
        "temperature": (25, 32),
        "humidity": (85, 100),
        "air_quality": (15, 50),
        "uv_index": (0, 3),
        "rainfall": (120, 150),
        "overcrowding_index": (50, 100),
        "flood_risk": (0.85, 1.0),
    },
    "AIR_POLLUTION": {
        "description": "High PM2.5 — respiratory illness risk",
        "temperature": (28, 38),
        "humidity": (40, 65),
        "air_quality": (200, 300),
        "uv_index": (3, 8),
        "rainfall": (0, 2),
        "overcrowding_index": (40, 80),
        "flood_risk": (0.0, 0.1),
    },
    "CHOLERA_RISK": {
        "description": "Post-flood contamination — cholera outbreak conditions",
        "temperature": (28, 35),
        "humidity": (70, 90),
        "air_quality": (30, 80),
        "uv_index": (4, 8),
        "rainfall": (60, 120),
        "overcrowding_index": (70, 100),
        "flood_risk": (0.7, 1.0),
    },
}


class SmartBoxDevice:
    """Simulates a single KHG Smart Box hardware device."""

    def __init__(
        self,
        device_id: str,
        name: str = "KHG Smart Box",
        scenario: str = "NORMAL",
        backend_url: str = DEFAULT_BACKEND_URL,
    ):
        self.device_id = device_id
        self.name = name
        self.scenario_name = scenario
        self.scenario = SCENARIOS.get(scenario, SCENARIOS["NORMAL"])
        self.backend_url = backend_url
        self.readings_sent = 0
        self.last_reading: Optional[Dict] = None

        # Simulated hardware state
        self.battery_voltage = round(random.uniform(3.7, 4.2), 2)
        self.solar_voltage = round(random.uniform(12.0, 20.0), 2)
        self.firmware_version = "v2.4.1-KHG"
        self.signal_strength = random.randint(-85, -50)  # dBm (4G/LoRa RSSI)

    def generate_reading(self) -> Dict:
        """Generate a realistic sensor reading based on the current scenario."""
        s = self.scenario

        def rand_float(range_tuple, decimals=2):
            return round(random.uniform(*range_tuple), decimals)

        def rand_int(range_tuple):
            return random.randint(int(range_tuple[0]), int(range_tuple[1]))

        # Add small natural drift/noise to simulate real sensors
        temp_noise = random.gauss(0, 0.3)
        humidity_noise = random.gauss(0, 1.0)

        reading = {
            "device_id": self.device_id,
            "temperature": max(0, round(rand_float(s["temperature"]) + temp_noise, 2)),
            "humidity": min(100, max(0, round(rand_float(s["humidity"]) + humidity_noise, 2))),
            "air_quality": max(0, rand_int(s["air_quality"])),
            "uv_index": max(0, rand_int(s["uv_index"])),
            "rainfall": max(0, rand_float(s["rainfall"])),
            "overcrowding_index": max(0, min(100, rand_int(s["overcrowding_index"]))),
            "flood_risk": max(0.0, min(1.0, rand_float(s["flood_risk"]))),
            # Hardware telemetry
            "battery_voltage": round(self.battery_voltage + random.gauss(0, 0.02), 2),
            "solar_voltage": round(self.solar_voltage + random.gauss(0, 0.5), 2),
            "firmware_version": self.firmware_version,
            "signal_strength": self.signal_strength + random.randint(-3, 3),
        }

        self.last_reading = reading
        return reading

    async def send_reading(self, client: httpx.AsyncClient) -> Dict:
        """POST a sensor reading to the backend ingest endpoint."""
        reading = self.generate_reading()
        timestamp = datetime.utcnow().isoformat()

        try:
            response = await client.post(
                f"{self.backend_url}/api/v1/sensors/ingest",
                json=reading,
                headers={
                    "X-Device-API-Key": DEVICE_API_KEY,
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )

            if response.status_code == 200:
                result = response.json()
                self.readings_sent += 1
                return {
                    "success": True,
                    "device": self.name,
                    "device_id": self.device_id,
                    "timestamp": timestamp,
                    "safety": result.get("safety", {}),
                    "ws_clients": result.get("ws_clients_notified", 0),
                    "reading": reading,
                }
            else:
                return {
                    "success": False,
                    "device": self.name,
                    "error": f"HTTP {response.status_code}: {response.text[:200]}",
                    "timestamp": timestamp,
                }

        except httpx.ConnectError:
            return {
                "success": False,
                "device": self.name,
                "error": "Connection refused — is the backend running?",
                "timestamp": timestamp,
            }
        except Exception as e:
            return {
                "success": False,
                "device": self.name,
                "error": str(e),
                "timestamp": timestamp,
            }


def _get_safety_color(safety_level: str) -> str:
    """ANSI color codes for terminal output."""
    colors = {
        "SAFE": "\033[92m",       # Green
        "MODERATE": "\033[93m",   # Yellow
        "HIGH RISK": "\033[91m",  # Red
        "CRITICAL": "\033[95m",   # Magenta
    }
    reset = "\033[0m"
    return f"{colors.get(safety_level, '')}{safety_level}{reset}"


async def run_simulator(
    device_ids: List[str],
    scenario: str = "NORMAL",
    interval: int = DEFAULT_INTERVAL_SECONDS,
    backend_url: str = DEFAULT_BACKEND_URL,
    cycles: Optional[int] = None,
):
    """
    Main simulator loop.
    Creates multiple smart box device instances and cycles through sending
    readings to the backend at the specified interval.
    """
    print("\n" + "="*70)
    print("  🌡️  KHG AFRICA — SMART BOX HARDWARE SIMULATOR")
    print("="*70)
    print(f"  Scenario    : {scenario} — {SCENARIOS.get(scenario, {}).get('description', '')}")
    print(f"  Devices     : {len(device_ids)}")
    print(f"  Interval    : {interval}s")
    print(f"  Backend URL : {backend_url}")
    print(f"  API Key     : {DEVICE_API_KEY[:20]}...")
    print("="*70 + "\n")

    # Create device instances
    devices = [
        SmartBoxDevice(
            device_id=did,
            name=f"KHG-BOX-{i+1:03d}",
            scenario=scenario,
            backend_url=backend_url,
        )
        for i, did in enumerate(device_ids)
    ]

    cycle = 0
    async with httpx.AsyncClient() as client:
        while cycles is None or cycle < cycles:
            cycle += 1
            print(f"[Cycle {cycle:04d}] {datetime.utcnow().strftime('%H:%M:%S')} — Sending readings from {len(devices)} device(s)...")

            # Send readings from all devices concurrently
            tasks = [device.send_reading(client) for device in devices]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in results:
                if isinstance(result, Exception):
                    print(f"  ❌ Exception: {result}")
                    continue

                if result["success"]:
                    safety = result.get("safety", {})
                    safety_level = safety.get("level", "?")
                    safety_score = safety.get("score", 0)
                    ws_count = result.get("ws_clients", 0)
                    r = result.get("reading", {})

                    print(
                        f"  ✅ {result['device']} | "
                        f"T:{r.get('temperature',0):.1f}°C "
                        f"H:{r.get('humidity',0):.0f}% "
                        f"AQI:{r.get('air_quality',0)} "
                        f"UV:{r.get('uv_index',0)} "
                        f"Rain:{r.get('rainfall',0):.1f}mm "
                        f"| Safety: {_get_safety_color(safety_level)} ({safety_score:.1f}%) "
                        f"| WS clients: {ws_count}"
                    )
                else:
                    print(f"  ❌ {result.get('device', 'Unknown')}: {result.get('error', 'Unknown error')}")

            print()

            if cycles is None or cycle < cycles:
                await asyncio.sleep(interval)

    print(f"\n[Simulator] Completed {cycle} cycles across {len(devices)} device(s).")
    for d in devices:
        print(f"  📦 {d.name}: {d.readings_sent} readings sent")


# ─── CLI Entry Point ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="KHG Smart Box Hardware Simulator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Scenarios:
{chr(10).join(f'  {k}: {v["description"]}' for k, v in SCENARIOS.items())}

Examples:
  python -m app.integrations.smart_box_simulator
  python -m app.integrations.smart_box_simulator --scenario MALARIA_OUTBREAK
  python -m app.integrations.smart_box_simulator --interval 5 --cycles 20
  python -m app.integrations.smart_box_simulator --device-ids uuid1 uuid2 uuid3
        """,
    )
    parser.add_argument("--scenario", default="NORMAL", choices=list(SCENARIOS.keys()),
                        help="Environmental scenario to simulate")
    parser.add_argument("--interval", type=int, default=DEFAULT_INTERVAL_SECONDS,
                        help="Seconds between sensor cycles (default: 10)")
    parser.add_argument("--cycles", type=int, default=None,
                        help="Number of cycles to run (default: infinite)")
    parser.add_argument("--backend-url", default=DEFAULT_BACKEND_URL,
                        help=f"Backend URL (default: {DEFAULT_BACKEND_URL})")
    parser.add_argument("--device-ids", nargs="+",
                        default=["00000000-0000-0000-0000-000000000001",
                                 "00000000-0000-0000-0000-000000000002"],
                        help="Device UUIDs to simulate (must exist in sensor_devices table)")

    args = parser.parse_args()

    asyncio.run(run_simulator(
        device_ids=args.device_ids,
        scenario=args.scenario,
        interval=args.interval,
        backend_url=args.backend_url,
        cycles=args.cycles,
    ))
