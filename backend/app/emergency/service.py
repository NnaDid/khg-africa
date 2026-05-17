from app.core.supabase import supabase_admin

class EmergencyService:
    @staticmethod
    async def deploy_team(alert_id: str, team_name: str, action: str, lat: float, lng: float):
        """
        Deploys an emergency response team to a location.
        """
        res = supabase_admin.table("emergency_interventions").insert({
            "alert_id": alert_id,
            "team_name": team_name,
            "action_taken": action,
            "status": "DEPLOYED",
            "gps_coords": f"POINT({lng} {lat})"
        }).execute()
        return res.data

    @staticmethod
    async def update_intervention_status(intervention_id: str, status: str):
        res = supabase_admin.table("emergency_interventions").update({
            "status": status
        }).eq("id", intervention_id).execute()
        return res.data

emergency_service = EmergencyService()
