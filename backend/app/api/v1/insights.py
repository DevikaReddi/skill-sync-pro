"""AI insights API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.services.ai_insights import AIInsightsEngine
from app.services.optimization import ResumeOptimizer

router = APIRouter(
    prefix="/api/v1/insights",
    tags=["insights"],
)

class InsightsRequest(BaseModel):
    resume_text: str
    job_description: str
    match_result: dict

class OptimizationRequest(BaseModel):
    resume_text: str
    job_description: str

@router.post("/generate")
async def generate_insights(
    request: InsightsRequest,
    current_user: Optional[User] = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate AI-powered insights."""
    insights_engine = AIInsightsEngine()
    
    user_id = current_user.id if current_user else None
    
    insights = insights_engine.generate_insights(
        resume_text=request.resume_text,
        job_description=request.job_description,
        match_result=request.match_result,
        db=db if user_id else None,
        user_id=user_id
    )
    
    return {
        "success": True,
        "insights": insights
    }

@router.post("/optimize")
async def optimize_resume(
    request: OptimizationRequest,
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """Generate resume optimization suggestions."""
    optimizer = ResumeOptimizer()
    
    suggestions = optimizer.optimize_resume(
        resume_text=request.resume_text,
        job_description=request.job_description
    )
    
    return {
        "success": True,
        "optimization": suggestions
    }

@router.get("/industry-benchmarks/{role}")
async def get_industry_benchmarks(
    role: str,
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """Get industry benchmarks for a role."""
    insights_engine = AIInsightsEngine()
    
    benchmark = insights_engine.industry_benchmarks.get(role)
    
    if not benchmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No benchmarks available for role: {role}"
        )
    
    return {
        "role": role,
        "benchmark": benchmark
    }

@router.get("/available-roles")
async def get_available_roles():
    """Get list of roles with available benchmarks."""
    insights_engine = AIInsightsEngine()
    
    return {
        "roles": list(insights_engine.industry_benchmarks.keys())
    }
