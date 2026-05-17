from app.core.supabase import supabase_admin
from app.sms.service import sms_service
from app.websocket.manager import manager
import asyncio

class AlertService:
    @staticmethod
    async def process_risk_predictions(location_id: str, location_type: str, predictions: dict):
        """
        Analyzes AI predictions and generates alerts if risks are high.
        """
        for disease, data in predictions.items():
            if data["level"] in ["HIGH", "CRITICAL"]:
                # 1. Create alert in database
                alert_msg = f"Alert: {disease.replace('_', ' ').capitalize()} risk is {data['level']}. Recommendation: {data['recommendation']}"
                alert_res = supabase_admin.table("risk_alerts").insert({
                    "type": f"{disease.upper()}_OUTBREAK",
                    "severity": data["level"],
                    "message": alert_msg,
                    "location_id": location_id,
                    "location_type": location_type
                }).execute()
                
                alert_id = alert_res.data[0]["id"]

                # 2. Broadcast via WebSocket
                await manager.broadcast({
                    "type": "NEW_ALERT",
                    "data": {
                        "id": alert_id,
                        "disease": disease,
                        "severity": data["level"],
                        "message": alert_msg,
                        "location_id": location_id
                    }
                })

                # 3. Send SMS to community health workers in that location
                # Fetch relevant users
                users = supabase_admin.table("profiles").select("email").eq("location_id", location_id).execute()
                # (In a real scenario, we'd have phone numbers in profiles)
                # for user in users.data:
                #    await sms_service.send_sms(user["phone"], alert_msg)

    @staticmethod
    async def resolve_alert(alert_id: str):
        supabase_admin.table("risk_alerts").update({"is_resolved": True}).eq("id", alert_id).execute()

alert_service = AlertService()
