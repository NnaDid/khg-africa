import traceback
from supabase import create_client

url = "https://hccumfazhtocuntmuuyw.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY3VtZmF6aHRvY3VudG11dXl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk1NjcyNywiZXhwIjoyMDk0NTMyNzI3fQ.vIeFx8FucTIzbym3YR61S93f7DkLyPICXvhwsKZHFQ4"

supabase = create_client(url, key)

try:
    print("Attempting to create test user...")
    res = supabase.auth.admin.create_user({
        "email": "test_agent_99@khgafrica.org",
        "password": "Password123!",
        "email_confirm": True,
        "user_metadata": {
            "full_name": "Test Agent",
            "role": "community_health_worker"
        }
    })
    print("Success:", res.user.id)
except Exception as e:
    print("Error class:", e.__class__.__name__)
    print("Error message:", str(e))
    traceback.print_exc()
