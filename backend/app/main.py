from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.websocket.manager import manager
from app.simulation.engine import simulation_engine
from app.auth.jwt import get_current_user
import asyncio

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Start simulation engine in the background
    asyncio.create_task(simulation_engine.run_loop(interval=10))

@app.get("/")
def read_root():
    return {"message": "Welcome to KHG Africa API", "status": "active"}

# WebSocket endpoint
@app.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for any messages from client (optional)
            data = await websocket.receive_text()
            # Echo or process
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include routers
from app.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
