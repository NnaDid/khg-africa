from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.websocket.manager import manager
from app.simulation.engine import simulation_engine
import asyncio

# Include routers (imported at top to avoid circular imports)
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="KHG Africa — Climate-Health Early Warning System API"
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Start background simulation engine on server boot."""
    asyncio.create_task(simulation_engine.run_loop(interval=10))


@app.get("/")
def read_root():
    return {"message": "Welcome to KHG Africa API", "status": "active", "version": settings.VERSION}


@app.get("/health")
def health_check():
    return {"status": "healthy", "simulation_running": simulation_engine.is_running}


# ─── WebSocket Realtime Endpoint ─────────────────────────────────────────────
@app.websocket("/ws")
@app.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    """
    Persistent WebSocket connection for realtime sensor + alert broadcasts.
    Clients (admin web, mobile app) connect here to receive:
      - { type: "SENSOR_UPDATE", data: {...} }
      - { type: "alert", data: {...} }
      - { type: "SAFETY_SCORE_UPDATE", data: {...} }
    """
    await manager.connect(websocket)
    try:
        # Send initial connection confirmation
        await manager.send_personal_message(
            {"type": "CONNECTED", "data": {"message": "KHG Africa realtime stream active"}},
            websocket
        )
        # Keep the connection alive — clients may send pings
        while True:
            try:
                # Wait for client messages (ping/pong), but don't block permanently
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
                # Echo pings back as pongs
                if data == '{"type":"ping"}' or data == "ping":
                    await websocket.send_json({"type": "pong"})
            except asyncio.TimeoutError:
                # No message from client in 60s — send a keepalive ping
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        manager.disconnect(websocket)


# Register API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
