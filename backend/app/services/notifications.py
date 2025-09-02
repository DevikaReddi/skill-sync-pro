"""Real-time notification service."""
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.websocket import manager
import json
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """Service for managing real-time notifications."""
    
    @staticmethod
    async def send_notification(
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ):
        """Send a notification to a user."""
        notification = {
            "type": "notification",
            "notification_type": notification_type,
            "title": title,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": data or {}
        }
        
        # Send via WebSocket if user is connected
        await manager.send_user_message(
            json.dumps(notification),
            user_id
        )
        
        logger.info(f"Sent notification to user {user_id}: {title}")
        return notification
    
    @staticmethod
    async def notify_analysis_complete(user_id: int, analysis_id: int, match_percentage: float):
        """Notify user when analysis is complete."""
        return await NotificationService.send_notification(
            user_id=user_id,
            notification_type="analysis_complete",
            title="Analysis Complete",
            message=f"Your resume analysis is ready! Match: {match_percentage:.1f}%",
            data={
                "analysis_id": analysis_id,
                "match_percentage": match_percentage
            }
        )
    
    @staticmethod
    async def notify_skill_trending(user_id: int, skill: str, trend: str):
        """Notify user about skill trends."""
        return await NotificationService.send_notification(
            user_id=user_id,
            notification_type="skill_trend",
            title="Skill Trend Alert",
            message=f"{skill} is {trend} in demand",
            data={
                "skill": skill,
                "trend": trend
            }
        )
    
    @staticmethod
    async def notify_milestone(user_id: int, milestone: str, value: Any):
        """Notify user about reaching a milestone."""
        return await NotificationService.send_notification(
            user_id=user_id,
            notification_type="milestone",
            title="Milestone Reached!",
            message=f"Congratulations! You've {milestone}",
            data={
                "milestone": milestone,
                "value": value
            }
        )
