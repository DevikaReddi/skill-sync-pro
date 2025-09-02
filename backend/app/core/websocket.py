"""WebSocket connection manager."""
import json
from typing import Dict, Set
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manage WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[int, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str, user_id: int = None):
        """Accept and store a new connection."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(client_id)
        
        logger.info(f"Client {client_id} connected (user: {user_id})")
    
    def disconnect(self, client_id: str, user_id: int = None):
        """Remove a connection."""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        
        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(client_id)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        logger.info(f"Client {client_id} disconnected")
    
    async def send_personal_message(self, message: str, client_id: str):
        """Send message to specific client."""
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_text(message)
    
    async def send_user_message(self, message: str, user_id: int):
        """Send message to all connections of a user."""
        if user_id in self.user_connections:
            for client_id in self.user_connections[user_id]:
                await self.send_personal_message(message, client_id)
    
    async def broadcast(self, message: str, exclude: str = None):
        """Broadcast message to all connected clients."""
        for client_id, connection in self.active_connections.items():
            if client_id != exclude:
                await connection.send_text(message)

# Global connection manager instance
manager = ConnectionManager()
