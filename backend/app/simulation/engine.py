import random
import asyncio
import uuid
from datetime import datetime
from app.core.supabase import supabase_admin
from app.ai_engine.logic import AIEngine
from app.alerts.service import alert_service
from app.websocket.manager import manager

# Default simulated devices if Supabase is offline or empty
# Note: location_id MUST be valid UUID format for PostgreSQL uuid column
FALLBACK_DEVICES = [
    {
        "id": "00000000-0000-0000-0000-000000000001",
        "location_id": "00000000-0000-0000-0000-000000000101",
        "location_type": "school",
        "name": "KHG Smart Box #1 (Nairobi West Primary)",
    },
    {
        "id": "00000000-0000-0000-0000-000000000002",
        "location_id": "00000000-0000-0000-0000-000000000102",
        "location_type": "clinic",
        "name": "KHG Smart Box #2 (Kibera Health Center)",
    },
]


def is_valid_uuid(val: str) -> bool:
    """Helper to check if a string is a valid UUID."""
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False


class SimulationEngine:
    """
    Background simulation engine that mimics the KHG Smart Box hardware.

    Every `interval` seconds it:
    1. Queries all registered sensor devices (or uses fallback devices if DB offline)
    2. Generates realistic sensor readings (matching smart box component specs)
    3. Inserts sensor_readings into Supabase (if connected)
    4. Runs AI risk predictions
    5. Writes disease_predictions and safety_scores to Supabase (if connected)
    6. Processes alerts for HIGH/CRITICAL predictions
    7. Broadcasts sensor update + safety score via WebSocket to all clients
    """

    def __init__(self):
        self.is_running = False
        self._cycle_count = 0

    async def generate_sensor_data(self):
        """Generates realistic IoT sensor data for all registered devices."""
        devices = []

        try:
            # Query active sensor devices from Supabase
            devices_res = (
                supabase_admin.table("sensor_devices")
                .select("id, location_id, location_type, name")
                .eq("status", "ACTIVE")
                .execute()
            )

            if devices_res.data:
                devices = devices_res.data
        except Exception:
            # DB connection / query error — use virtual fallback devices
            pass

        if not devices:
            devices = FALLBACK_DEVICES

        for device in devices:
            await self._process_device(device)

        self._cycle_count += 1

    async def _process_device(self, device: dict):
        """Process a single sensor device: generate data, predict, alert, broadcast."""
        device_id = device["id"]
        location_id = device["location_id"]
        location_type = device.get("location_type", "community")

        # Guarantee location_id is valid UUID format before sending to DB
        db_location_id = location_id if is_valid_uuid(location_id) else "00000000-0000-0000-0000-000000000101"
        db_device_id = device_id if is_valid_uuid(device_id) else "00000000-0000-0000-0000-000000000001"

        # ── 1. Generate realistic sensor reading ──────────────────────────────
        reading = {
            "device_id": db_device_id,
            "temperature": round(random.uniform(28.0, 45.0), 2),
            "humidity": round(random.uniform(40.0, 95.0), 2),
            "air_quality": random.randint(10, 300),
            "uv_index": random.randint(1, 12),
            "rainfall": round(random.uniform(0.0, 150.0), 2),
            "overcrowding_index": random.randint(0, 100),
            "flood_risk": round(random.uniform(0.0, 1.0), 2),
            "timestamp": datetime.utcnow().isoformat(),
        }

        # ── 2. Persist to DB (graceful skip if offline) ──────────────────────
        try:
            supabase_admin.table("sensor_readings").insert(reading).execute()
            supabase_admin.table("sensor_devices").update(
                {"last_seen": datetime.utcnow().isoformat()}
            ).eq("id", db_device_id).execute()
        except Exception:
            pass  # DB write optional — non-blocking for realtime stream

        # ── 3. Run AI predictions ─────────────────────────────────────────────
        predictions = AIEngine.predict_risks(reading)
        safety = AIEngine.calculate_safety_score(predictions)

        # ── 4. Persist safety scores & disease predictions ────────────────────
        try:
            supabase_admin.table("safety_scores").insert(
                {
                    "location_id": db_location_id,
                    "score": safety["score"],
                    "level": safety["level"],
                    "predictions": predictions,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            ).execute()

            for disease, pred in predictions.items():
                supabase_admin.table("disease_predictions").insert(
                    {
                        "location_id": db_location_id,
                        "disease_type": disease,
                        "risk_score": pred["score"],
                        "risk_level": pred["level"],
                        "recommendation": pred["recommendation"],
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                ).execute()
        except Exception:
            pass

        # ── 5. Process alerts for HIGH/CRITICAL risks ─────────────────────────
        try:
            await alert_service.process_risk_predictions(
                db_location_id, location_type, predictions
            )
        except Exception:
            pass

        # ── 6. Broadcast sensor reading + safety score via WebSocket ──────────
        try:
            await manager.broadcast(
                {
                    "type": "SENSOR_UPDATE",
                    "data": {
                        **reading,
                        "device_name": device.get("name", "Unknown Device"),
                        "location_id": db_location_id,
                        "location_type": location_type,
                        "safety_score": safety["score"],
                        "safety_level": safety["level"],
                        "predictions": predictions,
                    },
                }
            )
        except Exception as e:
            print(f"[SimulationEngine] WS broadcast error: {e}")

    async def run_loop(self, interval: int = 10):
        """Main simulation loop. Runs indefinitely, generating data every `interval` seconds."""
        self.is_running = True
        print(f"[SimulationEngine] Started. Interval: {interval}s")

        while self.is_running:
            await self.generate_sensor_data()
            await asyncio.sleep(interval)

    def stop(self):
        self.is_running = False


simulation_engine = SimulationEngine()
