from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from app.auth.jwt import get_current_user
from app.core.supabase import supabase
import uuid

router = APIRouter()

@router.post("/")
async def create_report(
    type: str,
    description: str,
    severity: str,
    lat: float,
    lng: float,
    image: UploadFile = None,
    user: dict = Depends(get_current_user)
):
    # Handle image upload to Cloudinary or Supabase Storage (Simplified for now)
    image_url = None
    if image:
        # In a real app, upload to Cloudinary here
        image_url = f"https://placeholder.com/{uuid.uuid4()}.png"

    report_data = {
        "reporter_id": user["sub"],
        "type": type,
        "description": description,
        "severity": severity,
        "location": f"POINT({lng} {lat})",
        "image_url": image_url,
        "status": "PENDING"
    }
    
    res = supabase.table("community_reports").insert(report_data).execute()
    return res.data

@router.get("/")
async def get_reports(user: dict = Depends(get_current_user)):
    res = supabase.table("community_reports").select("*").execute()
    return res.data

@router.post("/sync")
async def sync_offline_reports(reports: List[dict], user: dict = Depends(get_current_user)):
    """
    Batch sync endpoint for offline-first mobile app.
    """
    for report in reports:
        report["reporter_id"] = user["sub"]
        # Convert lat/lng to PostGIS point if necessary
        if "lat" in report and "lng" in report:
            report["location"] = f"POINT({report['lng']} {report['lat']})"
            
    res = supabase.table("community_reports").insert(reports).execute()
    return {"status": "synced", "count": len(res.data)}
