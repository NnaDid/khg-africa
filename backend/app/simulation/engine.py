import random
import time
import asyncio
from datetime import datetime
from app.core.supabase import supabase_admin
from app.ai_engine.logic import AIEngine
from app.alerts.service import alert_service

class SimulationEngine:
    def __init__(self):
        self.is_running = False

    async def generate_sensor_data(self):
        """Generates fake IoT sensor data for schools and clinics."""
        # Get all sensor devices
        devices = supabase_admin.table("sensor_devices").select("id, location_id, location_type").execute()
        
        for device in devices.data:
            reading = {
                "device_id": device["id"],
                "temperature": round(random.uniform(28, 45), 2),
                "humidity": round(random.uniform(40, 95), 2),
                "air_quality": random.randint(10, 300),
                "uv_index": random.randint(1, 12),
                "rainfall": round(random.uniform(0, 150), 2),
                "overcrowding_index": random.randint(0, 100),
                "flood_risk": round(random.uniform(0, 1), 2),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Insert reading into Supabase
            supabase_admin.table("sensor_readings").insert(reading).execute()
            
            # Run AI prediction for this reading
            predictions = AIEngine.predict_risks(reading)
            safety = AIEngine.calculate_safety_score(predictions)
            
            # Update safety score for the location
            supabase_admin.table("safety_scores").insert({
                "location_id": device["location_id"],
                "score": safety["score"],
                "level": safety["level"],
                "predictions": predictions,
                "timestamp": datetime.utcnow().isoformat()
            }).execute()
            
            # Process alerts based on predictions
            await alert_service.process_risk_predictions(
                device["location_id"], 
                device["location_type"], 
                predictions
            )

    async def run_loop(self, interval: int = 10):
        self.is_running = True
        while self.is_running:
            await self.generate_sensor_data()
            await asyncio.sleep(interval)

simulation_engine = SimulationEngine()
