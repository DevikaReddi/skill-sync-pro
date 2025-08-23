"""Models for resume and job analysis."""
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ResumeAnalysisRequest(BaseModel):
    """Request model for resume analysis."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "resume_text": "John Doe\nSoftware Engineer\nSkills: Python, React, Docker",
                "job_description": "Looking for a Full Stack Developer with Python and React experience",
            }
        }
    )

    resume_text: str = Field(..., min_length=50, max_length=10000)
    job_description: str = Field(..., min_length=50, max_length=10000)

    @field_validator("resume_text", "job_description")
    @classmethod
    def validate_text_content(cls, v: str) -> str:
        """Ensure text has actual content, not just whitespace."""
        if not v.strip():
            raise ValueError("Text content cannot be empty or just whitespace")
        return v.strip()


class Skill(BaseModel):
    """Model for a single skill."""

    name: str
    category: Optional[str] = None
    relevance_score: Optional[float] = Field(None, ge=0, le=1)


class SkillAnalysis(BaseModel):
    """Model for skill analysis results."""

    matching_skills: List[Skill] = Field(default_factory=list)
    skill_gaps: List[Skill] = Field(default_factory=list)
    unique_skills: List[Skill] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    """Response model for analysis results."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "match_percentage": 75.5,
                "skill_analysis": {
                    "matching_skills": [{"name": "Python", "category": "Programming"}],
                    "skill_gaps": [{"name": "Docker", "category": "DevOps"}],
                    "unique_skills": [{"name": "Photoshop", "category": "Design"}],
                },
                "recommendations": ["Consider learning Docker for containerization"],
                "analysis_timestamp": "2024-01-20T10:30:00",
                "processing_time_ms": 250,
            }
        }
    )

    success: bool
    match_percentage: float = Field(..., ge=0, le=100)
    skill_analysis: SkillAnalysis
    recommendations: List[str] = Field(default_factory=list)
    analysis_timestamp: datetime = Field(default_factory=datetime.now)
    processing_time_ms: Optional[int] = None


class ErrorResponse(BaseModel):
    """Model for error responses."""

    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
