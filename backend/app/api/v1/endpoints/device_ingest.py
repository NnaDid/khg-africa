from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from app.auth.jwt import get_current_user
from app.core.supabase import supabase_admin
from app.ai_engine.logic import AIEngine
from app.alerts.service import alert_service
from app.websocket.manager import manager

router = APIRouter()

MASTER_DEVICE_API_KEY = "khg-smart-box-master-key-2024"
DEFAULT_FALLBACK_LOCATION_UUID = "00000000-0000-0000-0000-000000000101"


def is_valid_uuid(val: str) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False


class SmartBoxPayload(BaseModel):
    """
    Payload schema matching the KHG Smart Box sensor output.
    """
    device_id: str
    temperature: float
    humidity: float
    air_quality: int
    uv_index: int
    rainfall: float
    overcrowding_index: int
    flood_risk: float
    battery_voltage: Optional[float] = None
    solar_voltage: Optional[float] = None
    firmware_version: Optional[str] = None
    signal_strength: Optional[int] = None


@router.post("/ingest")
async def ingest_sensor_data(
    payload: SmartBoxPayload,
    x_device_api_key: str = Header(None, alias="X-Device-API-Key"),
):
    """
    Ingest endpoint for physical and simulated KHG Smart Box hardware.
    """
    if not x_device_api_key:
        raise HTTPException(status_code=401, detail="X-Device-API-Key header required")

    is_master = x_device_api_key == MASTER_DEVICE_API_KEY
    if not is_master:
        device_check = supabase_admin.table("sensor_devices") \
            .select("id") \
            .eq("id", payload.device_id) \
            .execute()
        if not device_check.data:
            raise HTTPException(status_code=403, detail="Unknown device ID")

    # Fetch device metadata
    location_id = DEFAULT_FALLBACK_LOCATION_UUID
    location_type = "community"
    device_name = "Smart Box"

    try:
        device_res = supabase_admin.table("sensor_devices") \
            .select("id, location_id, location_type, name") \
            .eq("id", payload.device_id) \
            .execute()

        if device_res.data:
            device = device_res.data[0]
            loc_val = device.get("location_id")
            if is_valid_uuid(loc_val):
                location_id = loc_val
            location_type = device.get("location_type", "community")
            device_name = device.get("name", "Smart Box")
    except Exception:
        pass

    timestamp = datetime.utcnow().isoformat()
    db_device_id = payload.device_id if is_valid_uuid(payload.device_id) else "00000000-0000-0000-0000-000000000001"

    reading = {
        "device_id": db_device_id,
        "temperature": payload.temperature,
        "humidity": payload.humidity,
        "air_quality": payload.air_quality,
        "uv_index": payload.uv_index,
        "rainfall": payload.rainfall,
        "overcrowding_index": payload.overcrowding_index,
        "flood_risk": payload.flood_risk,
        "timestamp": timestamp,
    }

    # Persist reading
    try:
        supabase_admin.table("sensor_readings").insert(reading).execute()
        supabase_admin.table("sensor_devices").update({
            "last_seen": timestamp
        }).eq("id", db_device_id).execute()
    except Exception:
        pass

    # AI Pipeline
    predictions = AIEngine.predict_risks(reading)
    safety = AIEngine.calculate_safety_score(predictions)

    try:
        supabase_admin.table("safety_scores").insert({
            "location_id": location_id,
            "score": safety["score"],
            "level": safety["level"],
            "predictions": predictions,
            "timestamp": timestamp,
        }).execute()

        for disease, pred in predictions.items():
            supabase_admin.table("disease_predictions").insert({
                "location_id": location_id,
                "disease_type": disease,
                "risk_score": pred["score"],
                "risk_level": pred["level"],
                "recommendation": pred["recommendation"],
                "timestamp": timestamp,
            }).execute()
    except Exception:
        pass

    # Process alerts
    try:
        await alert_service.process_risk_predictions(location_id, location_type, predictions)
    except Exception:
        pass

    # WebSocket broadcast
    await manager.broadcast({
        "type": "SENSOR_UPDATE",
        "data": {
            **reading,
            "device_name": device_name,
            "location_id": location_id,
            "location_type": location_type,
            "safety_score": safety["score"],
            "safety_level": safety["level"],
            "predictions": predictions,
        }
    })

    return {
        "status": "ingested",
        "device_id": payload.device_id,
        "location_id": location_id,
        "safety": safety,
        "predictions": predictions,
        "timestamp": timestamp,
        "ws_clients_notified": manager.connection_count(),
    }
