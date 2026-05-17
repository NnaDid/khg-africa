from app.core.supabase import supabase_admin
import uuid

def seed():
    print("Seeding schools...")
    schools = [
        {"name": "Lagos Primary School", "address": "123 Lagos St", "student_count": 450},
        {"name": "Nairobi Academy", "address": "456 Nairobi Rd", "student_count": 600},
        {"name": "Accra Public School", "address": "789 Accra Ave", "student_count": 300},
    ]
    res_schools = supabase_admin.table("schools").insert(schools).execute()
    school_ids = [s["id"] for s in res_schools.data]

    print("Seeding sensor devices...")
    devices = []
    for sid in school_ids:
        devices.append({"name": f"Weather Station - {sid[:8]}", "type": "WEATHER_STATION", "location_id": sid, "location_type": "school"})
        devices.append({"name": f"Air Quality - {sid[:8]}", "type": "AIR_QUALITY_SENSOR", "location_id": sid, "location_type": "school"})
    
    supabase_admin.table("sensor_devices").insert(devices).execute()
    print("Seed complete!")

if __name__ == "__main__":
    seed()
