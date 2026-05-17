from fastapi import APIRouter, Depends
from app.auth.jwt import get_current_user
from app.core.supabase import supabase_admin

router = APIRouter()

@router.get("/summary")
async def get_system_summary(user: dict = Depends(get_current_user)):
    # Total schools
    schools = supabase_admin.table("schools").select("id", count="exact").execute()
    # Total clinics
    clinics = supabase_admin.table("clinics").select("id", count="exact").execute()
    # Active alerts
    alerts = supabase_admin.table("risk_alerts").select("id", count="exact").eq("is_resolved", False).execute()
    
    return {
        "total_schools": schools.count,
        "total_clinics": clinics.count,
        "active_alerts": alerts.count,
        "children_protected_estimate": (schools.count or 0) * 500, # Mock logic
        "intervention_success_rate": "94%"
    }

@router.get("/risk-trends")
async def get_risk_trends(user: dict = Depends(get_current_user)):
    # Fetch recent predictions and aggregate
    res = supabase_admin.table("disease_predictions").select("disease_type, risk_level, timestamp").order("timestamp", desc=True).limit(100).execute()
    return res.data
