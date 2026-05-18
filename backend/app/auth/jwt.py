from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings
from app.core.supabase import supabase_admin

security = HTTPBearer()

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Supabase uses JWTs. We can verify them using the JWT secret if available,
        # or by calling the Supabase Auth API to get the user.
        # Here we use the secret for efficiency if provided, else we'd use supabase.auth.get_user(token)
        payload = jwt.decode(
            token.credentials, 
            settings.SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            audience="authenticated"
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        # Optional: Check roles in profiles table
        # profile = supabase_admin.table("profiles").select("*").eq("id", user_id).single().execute()
        # payload["profile"] = profile.data
        
        return payload
    except JWTError:
        # Fallback: Verify via Supabase API if secret verification fails
        try:
            res = supabase_admin.auth.get_user(token.credentials)
            if res.user:
                return {"sub": res.user.id, "email": res.user.email, "user": res.user}
        except Exception:
            pass
        raise credentials_exception

def check_role(required_roles: list):
    async def role_checker(user: dict = Depends(get_current_user)):
        user_id = user.get("sub")
        # Fetch profile to check role
        profile = supabase_admin.table("profiles").select("role").eq("id", user_id).single().execute()
        if not profile.data or profile.data.get("role") not in required_roles:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return user
    return role_checker
