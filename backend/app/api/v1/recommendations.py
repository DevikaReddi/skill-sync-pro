"""Recommendation endpoints for skill suggestions and learning paths."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict
from app.services.embeddings_service import EmbeddingsService

router = APIRouter(
    prefix="/api/v1/recommendations",
    tags=["recommendations"],
)

embeddings_service = EmbeddingsService()

class SkillRecommendationRequest(BaseModel):
    skills: List[str]
    top_n: int = 5

class SimilarSkillsRequest(BaseModel):
    skill: str
    limit: int = 5

class LearningPathRequest(BaseModel):
    target_skill: str
    current_skills: List[str]

@router.post("/similar-skills")
async def get_similar_skills(request: SimilarSkillsRequest):
    """Get similar skills for a given skill."""
    try:
        similar = embeddings_service.get_similar_skills(request.skill, request.limit)
        return {
            "skill": request.skill,
            "similar_skills": [
                {"name": s[0], "similarity_score": s[1]} 
                for s in similar
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/learning-path")
async def get_learning_path(request: LearningPathRequest):
    """Generate a personalized learning path."""
    try:
        # Get the learning path
        path = embeddings_service._generate_learning_path(request.target_skill)
        
        # Find related skills from current skills
        related_skills = []
        for current in request.current_skills:
            similar = embeddings_service.get_similar_skills(current, 2)
            for s in similar:
                if s[0].lower() == request.target_skill.lower():
                    related_skills.append(current)
                    break
        
        return {
            "target_skill": request.target_skill,
            "learning_path": path,
            "related_skills": related_skills,
            "estimated_time": "2-3 months",  # Simplified estimation
            "difficulty": "Intermediate"  # Simplified
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/market-demand")
async def analyze_market_demand(request: SkillRecommendationRequest):
    """Analyze market demand for skills."""
    try:
        demand = embeddings_service.analyze_skill_market_demand(request.skills)
        return {
            "skills_demand": demand,
            "high_demand": [s for s, d in demand.items() if d == "High"],
            "trending": ["cloud", "ai/ml", "kubernetes", "react", "python"]  # Simplified
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
