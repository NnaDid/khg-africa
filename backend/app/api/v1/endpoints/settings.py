from fastapi import APIRouter, Depends
from app.auth.jwt import get_current_user, check_role
from app.core.supabase import supabase_admin
from pydantic import BaseModel

router = APIRouter()

class SettingUpdate(BaseModel):
    key: str
    value: str

@router.get("/")
async def get_all_settings(user: dict = Depends(check_role(["super_admin"]))):
    res = supabase_admin.table("system_settings").select("*").execute()
    return res.data

@router.post("/")
async def update_setting(data: SettingUpdate, user: dict = Depends(check_role(["super_admin"]))):
    res = supabase_admin.table("system_settings").upsert({
        "key": data.key,
        "value": data.value
    }).execute()
    return res.data

@router.get("/sms-logs")
async def get_sms_logs(user: dict = Depends(check_role(["super_admin", "government_admin"]))):
    res = supabase_admin.table("sms_logs").select("*").order("created_at", desc=True).limit(100).execute()
    return res.data

@router.get("/audit-logs")
async def get_audit_logs(user: dict = Depends(check_role(["super_admin"]))):
    # This assumes an audit_logs table exists
    res = supabase_admin.table("audit_logs").select("*").order("created_at", desc=True).limit(100).execute()
    return res.data
