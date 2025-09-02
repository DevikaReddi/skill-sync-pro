"""Application monitoring and metrics."""
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.user import User, AnalysisHistory
import logging

logger = logging.getLogger(__name__)

class MonitoringService:
    """Service for application monitoring and metrics."""
    
    @staticmethod
    def get_system_metrics(db: Session) -> Dict[str, Any]:
        """Get system-wide metrics."""
        
        # User metrics
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        new_users_today = db.query(User).filter(
            func.date(User.created_at) == datetime.now().date()
        ).count()
        
        # Analysis metrics
        total_analyses = db.query(AnalysisHistory).count()
        analyses_today = db.query(AnalysisHistory).filter(
            func.date(AnalysisHistory.created_at) == datetime.now().date()
        ).count()
        
        # Average metrics
        avg_match = db.query(func.avg(AnalysisHistory.match_percentage)).scalar() or 0
        
        # Performance metrics
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_analyses = db.query(
            func.date(AnalysisHistory.created_at).label("date"),
            func.count(AnalysisHistory.id).label("count")
        ).filter(
            AnalysisHistory.created_at >= thirty_days_ago
        ).group_by(
            func.date(AnalysisHistory.created_at)
        ).all()
        
        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "new_today": new_users_today
            },
            "analyses": {
                "total": total_analyses,
                "today": analyses_today,
                "average_match": round(avg_match, 1)
            },
            "activity": {
                "daily_analyses": [
                    {"date": str(r.date), "count": r.count}
                    for r in recent_analyses
                ]
            }
        }
    
    @staticmethod
    def get_user_metrics(user_id: int, db: Session) -> Dict[str, Any]:
        """Get metrics for a specific user."""
        
        # Total analyses
        total = db.query(AnalysisHistory).filter(
            AnalysisHistory.user_id == user_id
        ).count()
        
        # Recent activity
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent = db.query(AnalysisHistory).filter(
            and_(
                AnalysisHistory.user_id == user_id,
                AnalysisHistory.created_at >= seven_days_ago
            )
        ).count()
        
        # Best match
        best = db.query(func.max(AnalysisHistory.match_percentage)).filter(
            AnalysisHistory.user_id == user_id
        ).scalar() or 0
        
        # Average match
        avg = db.query(func.avg(AnalysisHistory.match_percentage)).filter(
            AnalysisHistory.user_id == user_id
        ).scalar() or 0
        
        return {
            "total_analyses": total,
            "recent_analyses": recent,
            "best_match": round(best, 1),
            "average_match": round(avg, 1)
        }
    
    @staticmethod
    def log_event(event_type: str, data: Dict[str, Any]):
        """Log an application event."""
        logger.info(f"Event: {event_type} - {data}")
