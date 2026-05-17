from fastapi import APIRouter, Depends
from app.auth.jwt import get_current_user
from app.core.supabase import supabase_admin
from app.alerts.service import alert_service

router = APIRouter()

@router.get("/")
async def get_alerts(user: dict = Depends(get_current_user)):
    res = supabase_admin.table("risk_alerts").select("*").order("created_at", desc=True).execute()
    return res.data

@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: str, user: dict = Depends(get_current_user)):
    await alert_service.resolve_alert(alert_id)
    return {"status": "resolved"}
