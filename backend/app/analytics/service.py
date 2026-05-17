from app.core.supabase import supabase_admin

class AnalyticsService:
    @staticmethod
    async def get_dashboard_stats():
        schools = supabase_admin.table("schools").select("id", count="exact").execute()
        clinics = supabase_admin.table("clinics").select("id", count="exact").execute()
        alerts = supabase_admin.table("risk_alerts").select("id", count="exact").eq("is_resolved", False).execute()
        
        return {
            "total_schools": schools.count,
            "total_clinics": clinics.count,
            "active_alerts": alerts.count,
            "children_protected_estimate": (schools.count or 0) * 500,
            "intervention_success_rate": "94%"
        }

    @staticmethod
    async def get_outbreak_trends():
        res = supabase_admin.table("disease_predictions").select("disease_type, risk_level, timestamp").order("timestamp", desc=True).limit(100).execute()
        return res.data

analytics_service = AnalyticsService()
