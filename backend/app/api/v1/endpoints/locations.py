from fastapi import APIRouter, Depends, HTTPException
from app.auth.jwt import get_current_user, check_role
from app.core.supabase import supabase_admin
from pydantic import BaseModel

router = APIRouter()

class SchoolCreate(BaseModel):
    name: str
    address: str
    student_count: int
    lat: float
    lng: float

@router.get("/schools")
async def list_schools(user: dict = Depends(get_current_user)):
    res = supabase_admin.table("schools").select("*").execute()
    return res.data

@router.post("/schools", dependencies=[Depends(check_role(["super_admin", "ngo_admin"]))])
async def create_school(data: SchoolCreate):
    location = f"POINT({data.lng} {data.lat})"
    res = supabase_admin.table("schools").insert({
        "name": data.name,
        "address": data.address,
        "student_count": data.student_count,
        "location": location
    }).execute()
    return res.data

@router.get("/clinics")
async def list_clinics(user: dict = Depends(get_current_user)):
    res = supabase_admin.table("clinics").select("*").execute()
    return res.data

@router.get("/communities")
async def list_communities(user: dict = Depends(get_current_user)):
    res = supabase_admin.table("communities").select("*").execute()
    return res.data

@router.get("/safety-scores/{location_id}")
async def get_location_safety(location_id: str, user: dict = Depends(get_current_user)):
    res = supabase_admin.table("safety_scores").select("*").eq("location_id", location_id).order("timestamp", desc=True).limit(1).execute()
    return res.data[0] if res.data else None
