"""Collaborative session management."""
from typing import Any, Dict, Set, Optional
from datetime import datetime, timedelta
import uuid
import json
from app.core.websocket import manager
import logging

logger = logging.getLogger(__name__)

class CollaborationSession:
    """Represents a collaborative analysis session."""
    
    def __init__(self, session_id: str, owner_id: int):
        self.session_id = session_id
        self.owner_id = owner_id
        self.participants: Set[int] = {owner_id}
        self.resume_text = ""
        self.job_description = ""
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.analysis_result = None
        self.is_active = True
    
    def add_participant(self, user_id: int):
        """Add a participant to the session."""
        self.participants.add(user_id)
        self.last_activity = datetime.now()
    
    def remove_participant(self, user_id: int):
        """Remove a participant from the session."""
        self.participants.discard(user_id)
        self.last_activity = datetime.now()
    
    def update_content(self, field: str, content: str, user_id: int):
        """Update session content."""
        if field == "resume":
            self.resume_text = content
        elif field == "job_description":
            self.job_description = content
        self.last_activity = datetime.now()
        return True
    
    def to_dict(self):
        """Convert session to dictionary."""
        return {
            "session_id": self.session_id,
            "owner_id": self.owner_id,
            "participants": list(self.participants),
            "created_at": self.created_at.isoformat(),
            "last_activity": self.last_activity.isoformat(),
            "is_active": self.is_active,
            "has_resume": bool(self.resume_text),
            "has_job_description": bool(self.job_description)
        }

class CollaborationManager:
    """Manage collaborative sessions."""
    
    def __init__(self):
        self.sessions: Dict[str, CollaborationSession] = {}
        self.user_sessions: Dict[int, Set[str]] = {}
    
    def create_session(self, owner_id: int) -> CollaborationSession:
        """Create a new collaborative session."""
        session_id = str(uuid.uuid4())
        session = CollaborationSession(session_id, owner_id)
        
        self.sessions[session_id] = session
        
        if owner_id not in self.user_sessions:
            self.user_sessions[owner_id] = set()
        self.user_sessions[owner_id].add(session_id)
        
        logger.info(f"Created collaborative session {session_id} for user {owner_id}")
        return session
    
    def get_session(self, session_id: str) -> Optional[CollaborationSession]:
        """Get a session by ID."""
        return self.sessions.get(session_id)
    
    def join_session(self, session_id: str, user_id: int) -> bool:
        """Join an existing session."""
        session = self.get_session(session_id)
        if not session or not session.is_active:
            return False
        
        session.add_participant(user_id)
        
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = set()
        self.user_sessions[user_id].add(session_id)
        
        logger.info(f"User {user_id} joined session {session_id}")
        return True
    
    def leave_session(self, session_id: str, user_id: int):
        """Leave a session."""
        session = self.get_session(session_id)
        if session:
            session.remove_participant(user_id)
            
            if user_id in self.user_sessions:
                self.user_sessions[user_id].discard(session_id)
            
            # Close session if no participants
            if not session.participants:
                self.close_session(session_id)
    
    def close_session(self, session_id: str):
        """Close a session."""
        session = self.get_session(session_id)
        if session:
            session.is_active = False
            
            # Remove from all user sessions
            for user_id in session.participants:
                if user_id in self.user_sessions:
                    self.user_sessions[user_id].discard(session_id)
            
            logger.info(f"Closed session {session_id}")
    
    async def broadcast_to_session(self, session_id: str, message: Dict[str, Any], exclude_user: Optional[int] = None):
        """Broadcast a message to all session participants."""
        session = self.get_session(session_id)
        if not session:
            return
        
        for user_id in session.participants:
            if user_id != exclude_user:
                await manager.send_user_message(
                    json.dumps(message),
                    user_id
                )
    
    def cleanup_inactive_sessions(self, timeout_hours: int = 24):
        """Clean up inactive sessions."""
        cutoff_time = datetime.now() - timedelta(hours=timeout_hours)
        sessions_to_close = []
        
        for session_id, session in self.sessions.items():
            if session.last_activity < cutoff_time:
                sessions_to_close.append(session_id)
        
        for session_id in sessions_to_close:
            self.close_session(session_id)
            del self.sessions[session_id]
        
        return len(sessions_to_close)

# Global collaboration manager
collaboration_manager = CollaborationManager()
