import os
import sys
import time
from supabase import create_client, Client

# Add backend root to path to reuse config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

# Initialize supabase client with service role key for full bypass and administrative actions
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

DEMO_USERS = [
    {
        "email": "gov@khgafrica.org",
        "password": "Password123!",
        "full_name": "Dr. Adeola Okafor",
        "role": "government_admin",
        "region": "Lagos Region"
    },
    {
        "email": "ngo@khgafrica.org",
        "password": "Password123!",
        "full_name": "Samuel Mensah",
        "role": "ngo_admin",
        "region": "Sub-Saharan Africa"
    },
    {
        "email": "school@khgafrica.org",
        "password": "Password123!",
        "full_name": "John Chukwuma",
        "role": "school_admin",
        "region": "Epe Division"
    },
    {
        "email": "clinic@khgafrica.org",
        "password": "Password123!",
        "full_name": "Fatima Bello",
        "role": "clinic_staff",
        "region": "Ikorodu District"
    },
    {
        "email": "worker@khgafrica.org",
        "password": "Password123!",
        "full_name": "Janet Kiprop",
        "role": "community_health_worker",
        "region": "Nairobi West"
    },
    {
        "email": "emergency@khgafrica.org",
        "password": "Password123!",
        "full_name": "Obi Nwosu",
        "role": "emergency_officer",
        "region": "National Command"
    }
]

def seed_users():
    print("Initializing User Seeding...")
    for user_info in DEMO_USERS:
        email = user_info["email"]
        password = user_info["password"]
        full_name = user_info["full_name"]
        role = user_info["role"]
        
        print(f"\nChecking existence of {email} ({role})...")
        
        try:
            # Check if user already exists in profiles
            res_profile = supabase_admin.table("profiles").select("id").eq("email", email).execute()
            
            if res_profile.data and len(res_profile.data) > 0:
                user_id = res_profile.data[0]["id"]
                print(f"User {email} already exists with ID: {user_id}. Updating profile role...")
                # Enforce database profile has correct role
                supabase_admin.table("profiles").update({
                    "full_name": full_name,
                    "role": role,
                }).eq("id", user_id).execute()
            else:
                print(f"Creating new auth user: {email}...")
                # Use admin auth API to create user without OTP/verification required
                res_create = supabase_admin.auth.admin.create_user({
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": {
                        "full_name": full_name,
                        "role": role
                    }
                })
                
                new_user_id = res_create.user.id
                print(f"Successfully created user {email} with ID: {new_user_id}")
                
                # Double-check/Force insert into public.profiles if trigger failed
                time.sleep(1.5)
                
                res_profile_check = supabase_admin.table("profiles").select("id").eq("id", new_user_id).execute()
                if not res_profile_check.data or len(res_profile_check.data) == 0:
                    print("Auth trigger did not run immediately. Manually inserting profile record...")
                    supabase_admin.table("profiles").insert({
                        "id": new_user_id,
                        "email": email,
                        "full_name": full_name,
                        "role": role
                    }).execute()
                else:
                    # Update name/role in profile
                    supabase_admin.table("profiles").update({
                        "full_name": full_name,
                        "role": role
                    }).eq("id", new_user_id).execute()
        except Exception as e:
            print(f"Failed to process user {email}: {e}")

    print("\nUser seeding process finished!")

if __name__ == "__main__":
    seed_users()
