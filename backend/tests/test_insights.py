"""Tests for AI insights."""
import pytest
from app.services.ai_insights import AIInsightsEngine
from app.services.optimization import ResumeOptimizer

def test_insights_generation():
    """Test insights generation."""
    engine = AIInsightsEngine()
    
    insights = engine.generate_insights(
        resume_text="Software Engineer with Python, React experience",
        job_description="Looking for Full Stack Developer with Python, React",
        match_result={
            "match_percentage": 75,
            "skill_analysis": {
                "matching_skills": [{"name": "python"}, {"name": "react"}],
                "skill_gaps": [{"name": "docker"}]
            }
        }
    )
    
    assert "job_role" in insights
    assert "industry_comparison" in insights
    assert "optimization_potential" in insights

def test_resume_optimization():
    """Test resume optimization."""
    optimizer = ResumeOptimizer()
    
    suggestions = optimizer.optimize_resume(
        resume_text="I worked on Python projects",
        job_description="Need Python developer"
    )
    
    assert "keyword_optimization" in suggestions
    assert "action_verb_suggestions" in suggestions
    assert "overall_score" in suggestions
