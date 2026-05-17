from fastapi import APIRouter, Depends, HTTPException
from app.auth.jwt import get_current_user, check_role
from app.core.supabase import supabase, supabase_admin
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    location_id: str = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user profile from Supabase profiles table."""
    user_id = user.get("sub")
    res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    return res.data

@router.post("/create-user", dependencies=[Depends(check_role(["super_admin", "government_admin"]))])
async def admin_create_user(data: UserCreate):
    """
    Admin-only endpoint to create new users via Supabase Admin API.
    Sends an invite email to the user.
    """
    try:
        # 1. Create user in auth.users
        res = supabase_admin.auth.admin.create_user({
            "email": data.email,
            "email_confirm": True,
            "user_metadata": {
                "full_name": data.full_name,
                "role": data.role
            }
        })
        
        # 2. Profile is automatically created by DB trigger, 
        # but we might want to update location_id
        if data.location_id:
            supabase_admin.table("profiles").update({
                "location_id": data.location_id
            }).eq("id", res.user.id).execute()
            
        return {"status": "user_created", "user_id": res.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reset-password")
async def request_password_reset(data: PasswordResetRequest):
    """Trigger Supabase password reset email flow."""
    res = supabase.auth.reset_password_for_email(data.email)
    return {"status": "reset_email_sent"}

@router.put("/profile")
async def update_profile(full_name: str = None, avatar_url: str = None, user: dict = Depends(get_current_user)):
    """Users can update their own basic profile info."""
    user_id = user.get("sub")
    update_data = {}
    if full_name: update_data["full_name"] = full_name
    if avatar_url: update_data["avatar_url"] = avatar_url
    
    if not update_data:
        return {"status": "no_changes"}
        
    res = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
    return res.data
