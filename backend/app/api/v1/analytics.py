"""Analytics API endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.services.analytics import AnalyticsService

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["analytics"],
)

@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user analytics dashboard."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_user_dashboard(current_user.id)

@router.get("/trends")
async def get_skill_trends(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get skill trend analysis."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_skill_trends(current_user.id, days)

@router.get("/export")
async def export_analytics(
    format: str = Query("json", regex="^(json|csv)$"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Export analytics data."""
    analytics_service = AnalyticsService(db)
    data = analytics_service.get_user_dashboard(current_user.id)
    
    if format == "csv":
        # Convert to CSV format
        import csv
        import io
        from fastapi.responses import StreamingResponse
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Analyses", data["total_analyses"]])
        writer.writerow(["Recent Count (30 days)", data["recent_count"]])
        writer.writerow(["Average Match %", data["average_match"]])
        writer.writerow(["Best Match %", data["best_match"]])
        writer.writerow(["Improvement %", data["improvement"]])
        
        # Top skills
        writer.writerow([])
        writer.writerow(["Top Matching Skills"])
        writer.writerow(["Skill", "Count"])
        for skill in data["top_matching_skills"]:
            writer.writerow([skill["name"], skill["count"]])
        
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=analytics.csv"}
        )
    
    return data

@router.get("/performance")
async def get_performance_metrics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get performance metrics and insights."""
    from app.models.user import AnalysisHistory
    from sqlalchemy import func
    
    # Get performance metrics
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    # Query for time-based metrics
    analyses = db.query(
        func.date(AnalysisHistory.created_at).label("date"),
        func.count(AnalysisHistory.id).label("count"),
        func.avg(AnalysisHistory.match_percentage).label("avg_match")
    ).filter(
        AnalysisHistory.user_id == current_user.id,
        AnalysisHistory.created_at >= thirty_days_ago
    ).group_by(
        func.date(AnalysisHistory.created_at)
    ).all()
    
    # Format data for charts
    daily_activity = [
        {
            "date": str(a.date),
            "count": a.count,
            "avg_match": round(float(a.avg_match), 1) if a.avg_match else 0
        }
        for a in analyses
    ]
    
    # Calculate streaks
    dates = [a.date for a in analyses]
    current_streak = 0
    max_streak = 0
    
    if dates:
        dates.sort()
        streak = 1
        for i in range(1, len(dates)):
            if (dates[i] - dates[i-1]).days == 1:
                streak += 1
                max_streak = max(max_streak, streak)
            else:
                streak = 1
        
        # Check if current streak
        if dates[-1] == datetime.now().date() or dates[-1] == (datetime.now() - timedelta(days=1)).date():
            current_streak = streak
    
    return {
        "daily_activity": daily_activity,
        "current_streak": current_streak,
        "max_streak": max_streak,
        "total_days_active": len(set(dates))
    }
