from fastapi import APIRouter
from app.api.v1.endpoints import (
    reports,
    analytics,
    alerts,
    emergency,
    auth,
    locations,
    sensors,
    settings,
    simulation,
    device_ingest,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(emergency.router, prefix="/emergency", tags=["Emergency"])
api_router.include_router(locations.router, prefix="/locations", tags=["Locations"])
api_router.include_router(sensors.router, prefix="/sensors", tags=["Sensors"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])
# Device ingest is under /sensors/ingest — merged into sensors prefix
api_router.include_router(device_ingest.router, prefix="/sensors", tags=["Device Ingest"])
