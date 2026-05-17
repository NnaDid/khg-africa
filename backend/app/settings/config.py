from app.core.supabase import supabase_admin

class SystemSettings:
    @staticmethod
    def get_setting(key: str, default: any = None):
        res = supabase_admin.table("system_settings").select("value").eq("key", key).single().execute()
        if res.data:
            return res.data["value"]
        return default

    @staticmethod
    def set_setting(key: str, value: any):
        supabase_admin.table("system_settings").upsert({"key": key, "value": value}).execute()

# Example settings
RISK_THRESHOLD_HIGH = 70
RISK_THRESHOLD_CRITICAL = 90
SIMULATION_INTERVAL = 10 # seconds
