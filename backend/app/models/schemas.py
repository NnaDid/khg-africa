from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProfileBase(BaseModel):
    full_name: str
    role: str
    location_id: Optional[str] = None
    avatar_url: Optional[str] = None

class SensorReadingBase(BaseModel):
    device_id: str
    temperature: float
    humidity: float
    air_quality: int
    uv_index: int
    rainfall: float
    overcrowding_index: int
    flood_risk: float

class CommunityReportCreate(BaseModel):
    type: str
    description: str
    severity: str
    lat: float
    lng: float
    image_url: Optional[str] = None
    voice_note_url: Optional[str] = None

class RiskAlertBase(BaseModel):
    type: str
    severity: str
    message: str
    location_id: str
    location_type: str

class EmergencyInterventionCreate(BaseModel):
    alert_id: Optional[str] = None
    team_name: str
    action_taken: str
    lat: float
    lng: float
