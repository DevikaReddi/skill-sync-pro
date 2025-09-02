"""Collaboration API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from pydantic import BaseModel
from app.core.auth import get_current_active_user
from app.models.user import User
from app.services.collaboration import collaboration_manager
from app.services.notifications import NotificationService

router = APIRouter(
    prefix="/api/v1/collaboration",
    tags=["collaboration"],
)

class CreateSessionResponse(BaseModel):
    session_id: str
    share_link: str

class UpdateContentRequest(BaseModel):
    field: str  # "resume" or "job_description"
    content: str

@router.post("/session/create", response_model=CreateSessionResponse)
async def create_collaborative_session(
    current_user: User = Depends(get_current_active_user)
):
    """Create a new collaborative session."""
    session = collaboration_manager.create_session(current_user.id)
    
    # Generate shareable link
    share_link = f"/collaborate/{session.session_id}"
    
    return CreateSessionResponse(
        session_id=session.session_id,
        share_link=share_link
    )

@router.post("/session/{session_id}/join")
async def join_collaborative_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Join an existing collaborative session."""
    success = collaboration_manager.join_session(session_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or inactive"
        )
    
    session = collaboration_manager.get_session(session_id)
    
    # Notify other participants
    await collaboration_manager.broadcast_to_session(
        session_id,
        {
            "type": "user_joined",
            "user_id": current_user.id,
            "username": current_user.username
        },
        exclude_user=current_user.id
    )
    
    return {"message": "Joined session successfully", "session": session.to_dict()}

@router.post("/session/{session_id}/leave")
async def leave_collaborative_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Leave a collaborative session."""
    collaboration_manager.leave_session(session_id, current_user.id)
    
    # Notify other participants
    await collaboration_manager.broadcast_to_session(
        session_id,
        {
            "type": "user_left",
            "user_id": current_user.id,
            "username": current_user.username
        }
    )
    
    return {"message": "Left session successfully"}

@router.put("/session/{session_id}/content")
async def update_session_content(
    session_id: str,
    request: UpdateContentRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Update content in a collaborative session."""
    session = collaboration_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if current_user.id not in session.participants:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant in this session"
        )
    
    # Update content
    success = session.update_content(request.field, request.content, current_user.id)
    
    if success:
        # Broadcast update to other participants
        await collaboration_manager.broadcast_to_session(
            session_id,
            {
                "type": "content_updated",
                "field": request.field,
                "content": request.content,
                "updated_by": current_user.username
            },
            exclude_user=current_user.id
        )
    
    return {"message": "Content updated successfully"}

@router.get("/session/{session_id}")
async def get_session_info(
    session_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get session information."""
    session = collaboration_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if current_user.id not in session.participants:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant in this session"
        )
    
    return session.to_dict()

@router.get("/my-sessions")
async def get_my_sessions(
    current_user: User = Depends(get_current_active_user)
):
    """Get all sessions for current user."""
    user_session_ids = collaboration_manager.user_sessions.get(current_user.id, set())
    
    sessions = []
    for session_id in user_session_ids:
        session = collaboration_manager.get_session(session_id)
        if session and session.is_active:
            sessions.append(session.to_dict())
    
    return {"sessions": sessions}
