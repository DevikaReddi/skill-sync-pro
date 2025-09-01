"""Analysis history endpoints."""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User, AnalysisHistory
import json

router = APIRouter(
    prefix="/api/v1/history",
    tags=["history"],
)

class SaveAnalysisRequest(BaseModel):
    title: Optional[str] = None
    resume_text: str
    job_description: str
    match_percentage: float
    skill_analysis: dict
    recommendations: List[str]

class AnalysisHistoryResponse(BaseModel):
    id: int
    title: Optional[str]
    match_percentage: float
    created_at: datetime
    skill_analysis: dict
    recommendations: List[str]
    resume_text: str
    job_description: str
    
    class Config:
        from_attributes = True

@router.post("/save", response_model=AnalysisHistoryResponse)
async def save_analysis(
    analysis: SaveAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save an analysis to history."""
    # Generate title if not provided
    if not analysis.title:
        analysis.title = f"Analysis - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    
    # Create history entry
    db_history = AnalysisHistory(
        user_id=current_user.id,
        title=analysis.title,
        resume_text=analysis.resume_text,
        job_description=analysis.job_description,
        match_percentage=analysis.match_percentage,
        skill_analysis=analysis.skill_analysis,
        recommendations=analysis.recommendations
    )
    
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    
    return db_history

@router.get("/list", response_model=List[AnalysisHistoryResponse])
async def get_analysis_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's analysis history."""
    histories = db.query(AnalysisHistory)\
        .filter(AnalysisHistory.user_id == current_user.id)\
        .order_by(AnalysisHistory.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return histories

@router.get("/{history_id}", response_model=AnalysisHistoryResponse)
async def get_analysis_detail(
    history_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific analysis from history."""
    history = db.query(AnalysisHistory)\
        .filter(
            AnalysisHistory.id == history_id,
            AnalysisHistory.user_id == current_user.id
        ).first()
    
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    return history

@router.delete("/{history_id}")
async def delete_analysis(
    history_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an analysis from history."""
    history = db.query(AnalysisHistory)\
        .filter(
            AnalysisHistory.id == history_id,
            AnalysisHistory.user_id == current_user.id
        ).first()
    
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    db.delete(history)
    db.commit()
    
    return {"message": "Analysis deleted successfully"}

@router.get("/stats/overview")
async def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user statistics."""
    total_analyses = db.query(AnalysisHistory)\
        .filter(AnalysisHistory.user_id == current_user.id)\
        .count()
    
    if total_analyses == 0:
        return {
            "total_analyses": 0,
            "average_match": 0,
            "best_match": 0,
            "recent_analyses": []
        }
    
    # Get statistics
    from sqlalchemy import func
    stats = db.query(
        func.avg(AnalysisHistory.match_percentage).label("average"),
        func.max(AnalysisHistory.match_percentage).label("max")
    ).filter(AnalysisHistory.user_id == current_user.id).first()
    
    recent = db.query(AnalysisHistory)\
        .filter(AnalysisHistory.user_id == current_user.id)\
        .order_by(AnalysisHistory.created_at.desc())\
        .limit(5)\
        .all()
    
    return {
        "total_analyses": total_analyses,
        "average_match": round(stats.average or 0, 1),
        "best_match": round(stats.max or 0, 1),
        "recent_analyses": [
            {
                "id": r.id,
                "title": r.title,
                "match_percentage": r.match_percentage,
                "created_at": r.created_at
            }
            for r in recent
        ]
    }
