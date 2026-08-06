from fastapi import APIRouter, Depends
from app.auth.jwt import get_current_user
from app.core.supabase import supabase_admin
from app.simulation.engine import simulation_engine

router = APIRouter()


@router.get("/live")
async def get_live_simulation(user: dict = Depends(get_current_user)):
    """
    Returns the most recent sensor readings across all devices.
    Used by the admin dashboard to hydrate charts on initial load.
    """
    # Fetch the last 20 readings across all devices
    res = supabase_admin.table("sensor_readings") \
        .select("*, sensor_devices(name, location_id, location_type)") \
        .order("timestamp", desc=True) \
        .limit(20) \
        .execute()

    return {
        "status": "active" if simulation_engine.is_running else "stopped",
        "cycle_count": simulation_engine._cycle_count,
        "readings": res.data,
        "ws_clients": simulation_engine and 0,
    }


@router.get("/status")
async def get_simulation_status(user: dict = Depends(get_current_user)):
    """Returns the current simulation engine status."""
    from app.websocket.manager import manager

    return {
        "is_running": simulation_engine.is_running,
        "cycle_count": simulation_engine._cycle_count,
        "ws_connections": manager.connection_count(),
    }


@router.post("/trigger")
async def trigger_single_cycle(user: dict = Depends(get_current_user)):
    """
    Manually triggers a single simulation cycle.
    Useful for demo/testing purposes.
    """
    await simulation_engine.generate_sensor_data()
    return {"status": "cycle_triggered", "cycle_count": simulation_engine._cycle_count}
