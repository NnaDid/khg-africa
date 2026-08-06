from typing import List, Dict, Any
from fastapi import WebSocket
import asyncio


class ConnectionManager:
    """
    Thread-safe WebSocket connection manager.
    Handles connect, disconnect, personal messages, and broadcasts.
    Uses a copy of the connection list during broadcast to avoid
    concurrent modification errors when disconnecting stale sockets.
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            self.disconnect(websocket)

    async def broadcast(self, message: dict):
        """
        Broadcast a JSON message to all connected clients.
        Iterates over a snapshot copy to safely handle disconnects
        that occur during the broadcast loop.
        """
        # Work on a snapshot to avoid modification during iteration
        connections_snapshot = list(self.active_connections)
        stale = []

        for connection in connections_snapshot:
            try:
                await connection.send_json(message)
            except Exception:
                # Mark stale connections for removal
                stale.append(connection)

        # Remove all stale connections after the broadcast loop
        for connection in stale:
            self.disconnect(connection)

    async def broadcast_to_location(self, message: dict, location_id: str):
        """
        Placeholder for location-scoped broadcasts.
        Currently broadcasts to all clients; can be extended with
        per-connection metadata to filter by location.
        """
        await self.broadcast(message)

    def connection_count(self) -> int:
        return len(self.active_connections)


manager = ConnectionManager()
