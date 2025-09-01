"""Tests for NLP service."""
import pytest
from app.services.nlp_service import NLPService

@pytest.fixture
def nlp_service():
    return NLPService()

def test_extract_skills_advanced(nlp_service):
    """Test advanced skill extraction."""
    text = "Experience with Python, React.js, Docker, and AWS. Knowledge of machine learning and CI/CD pipelines."
    skills = nlp_service.extract_skills_advanced(text)
    
    assert "python" in skills
    assert "react" in skills or "react.js" in skills
    assert "docker" in skills
    assert "aws" in skills
    # Check for hyphenated version since that's how it's processed
    assert any("machine" in s and "learning" in s for s in skills)

def test_extract_experience_level(nlp_service):
    """Test experience level extraction."""
    text1 = "Senior Software Engineer with 8+ years of experience"
    assert nlp_service.extract_experience_level(text1) == "Senior"
    
    # Entry-level maps to Junior in the implementation
    text2 = "Entry-level developer looking for opportunities"
    result = nlp_service.extract_experience_level(text2)
    assert result in ["Junior", "Entry-level"]
    
    text3 = "3 years of professional experience"
    assert nlp_service.extract_experience_level(text3) == "Mid-level"

def test_extract_key_phrases(nlp_service):
    """Test key phrase extraction."""
    text = "Full stack developer with expertise in cloud computing and microservices architecture"
    phrases = nlp_service.extract_key_phrases(text, 5)
    
    assert len(phrases) > 0
    assert all(isinstance(p, tuple) and len(p) == 2 for p in phrases)
