"""WebSocket endpoints for real-time features."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.core.websocket import manager
from app.core.auth import decode_token
import json
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ws",
    tags=["websocket"],
)

@router.websocket("/connect")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(None)
):
    """WebSocket connection endpoint."""
    client_id = str(uuid.uuid4())
    user_id = None
    
    # Decode token if provided
    if token:
        payload = decode_token(token)
        if payload:
            user_id = payload.get("sub")
    
    await manager.connect(websocket, client_id, user_id)
    
    try:
        # Send initial connection message
        await manager.send_personal_message(
            json.dumps({
                "type": "connection",
                "message": "Connected successfully",
                "client_id": client_id
            }),
            client_id
        )
        
        # Keep connection alive and handle messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await manager.send_personal_message(
                    json.dumps({"type": "pong"}),
                    client_id
                )
            
            elif message.get("type") == "analysis_update":
                # Broadcast analysis updates to user's other sessions
                if user_id:
                    await manager.send_user_message(
                        json.dumps({
                            "type": "analysis_update",
                            "data": message.get("data")
                        }),
                        user_id
                    )
            
            elif message.get("type") == "broadcast":
                # Broadcast to all connected clients
                await manager.broadcast(
                    json.dumps({
                        "type": "broadcast",
                        "from": client_id,
                        "message": message.get("message")
                    }),
                    exclude=client_id
                )
    
    except WebSocketDisconnect:
        manager.disconnect(client_id, user_id)
        if user_id:
            await manager.send_user_message(
                json.dumps({
                    "type": "user_disconnected",
                    "client_id": client_id
                }),
                user_id
            )
