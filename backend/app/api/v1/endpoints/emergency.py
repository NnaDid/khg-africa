from fastapi import APIRouter, Depends
from app.auth.jwt import get_current_user
from app.emergency.service import emergency_service
from app.models.schemas import EmergencyInterventionCreate

router = APIRouter()

@router.post("/deploy")
async def deploy_team(data: EmergencyInterventionCreate, user: dict = Depends(get_current_user)):
    res = await emergency_service.deploy_team(
        data.alert_id, 
        data.team_name, 
        data.action_taken, 
        data.lat, 
        data.lng
    )
    return res

@router.get("/interventions")
async def get_interventions(user: dict = Depends(get_current_user)):
    from app.core.supabase import supabase_admin
    res = supabase_admin.table("emergency_interventions").select("*").execute()
    return res.data
