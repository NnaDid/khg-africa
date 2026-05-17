from fastapi import APIRouter, Depends
from app.auth.jwt import get_current_user
from app.core.supabase import supabase_admin

router = APIRouter()

@router.get("/devices")
async def list_devices(user: dict = Depends(get_current_user)):
    res = supabase_admin.table("sensor_devices").select("*").execute()
    return res.data

@router.get("/readings/{device_id}")
async def get_device_readings(device_id: str, limit: int = 50, user: dict = Depends(get_current_user)):
    res = supabase_admin.table("sensor_readings").select("*").eq("device_id", device_id).order("timestamp", desc=True).limit(limit).execute()
    return res.data

@router.get("/predictions/{location_id}")
async def get_location_predictions(location_id: str, user: dict = Depends(get_current_user)):
    res = supabase_admin.table("disease_predictions").select("*").eq("location_id", location_id).order("timestamp", desc=True).limit(10).execute()
    return res.data
