from supabase import create_client

url = "https://hccumfazhtocuntmuuyw.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY3VtZmF6aHRvY3VudG11dXl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk1NjcyNywiZXhwIjoyMDk0NTMyNzI3fQ.vIeFx8FucTIzbym3YR61S93f7DkLyPICXvhwsKZHFQ4"

supabase = create_client(url, key)

res = supabase.auth.admin.list_users()
print("Auth Users:")
for u in res.users:
    print(f"- {u.email} (ID: {u.id})")
