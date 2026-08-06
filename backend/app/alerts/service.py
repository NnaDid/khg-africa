import uuid
from app.core.supabase import supabase_admin
from app.websocket.manager import manager
from datetime import datetime

# Mapping from disease key to human-readable hazard type (used by mobile app alert store)
_HAZARD_TYPE_MAP = {
    "malaria": "malaria",
    "heat_stress": "heat_stress",
    "cholera": "cholera",
    "respiratory": "respiratory",
}

DEFAULT_FALLBACK_LOCATION_UUID = "00000000-0000-0000-0000-000000000101"


def is_valid_uuid(val: str) -> bool:
    """Helper to check if a string is a valid UUID."""
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False


class AlertService:

    @staticmethod
    async def process_risk_predictions(location_id: str, location_type: str, predictions: dict):
        """
        Analyzes AI predictions and generates risk alerts for HIGH/CRITICAL risks.

        For each qualifying risk:
        1. Creates an alert record in Supabase (risk_alerts table)
        2. Broadcasts via WebSocket with the correct payload shape that both
           the admin web and mobile app expect.
        """
        # Ensure location_id is valid UUID for Postgres UUID column
        db_location_id = location_id if is_valid_uuid(location_id) else DEFAULT_FALLBACK_LOCATION_UUID

        for disease, data in predictions.items():
            risk_level = data.get("level", "SAFE")

            if risk_level not in ["HIGH", "CRITICAL"]:
                continue

            alert_msg = (
                f"Alert: {disease.replace('_', ' ').capitalize()} risk is {risk_level}. "
                f"Recommendation: {data.get('recommendation', 'Monitor situation.')}"
            )
            title = f"{risk_level}: {disease.replace('_', ' ').capitalize()} Risk"

            # ── 1. Create alert in database ───────────────────────────────────
            alert_id = f"alert-{disease}-{db_location_id}"
            try:
                alert_res = supabase_admin.table("risk_alerts").insert({
                    "type": f"{disease.upper()}_OUTBREAK",
                    "severity": risk_level,
                    "message": alert_msg,
                    "location_id": db_location_id,
                    "location_type": location_type,
                }).execute()

                if alert_res.data:
                    alert_id = alert_res.data[0]["id"]
            except Exception as e:
                # Silently catch DB insert errors so WebSocket broadcast always fires
                pass

            # ── 2. Broadcast via WebSocket ────────────────────────────────────
            try:
                await manager.broadcast({
                    "type": "alert",  # ← lowercase matches wsClient.ts `data.type === "alert"`
                    "data": {
                        "id": str(alert_id),
                        "title": title,
                        "body": alert_msg,
                        "hazard_type": _HAZARD_TYPE_MAP.get(disease, disease),
                        "risk_level": risk_level.lower(),  # lowercase: "critical", "high"
                        "region": db_location_id,
                        "location_type": location_type,
                        "issued_at": datetime.utcnow().isoformat(),
                        "acknowledged": False,
                        "score": data.get("score", 0),
                        "recommendation": data.get("recommendation", ""),
                    }
                })
            except Exception as e:
                print(f"[AlertService] WS broadcast error: {e}")

    @staticmethod
    async def resolve_alert(alert_id: str):
        """Mark an alert as resolved in the database."""
        if not is_valid_uuid(alert_id):
            return
        try:
            supabase_admin.table("risk_alerts") \
                .update({"is_resolved": True}) \
                .eq("id", alert_id) \
                .execute()
        except Exception as e:
            print(f"[AlertService] Resolve error: {e}")


alert_service = AlertService()
