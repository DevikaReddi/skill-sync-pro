"""Advanced analysis endpoints."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict
from app.services.nlp_service import NLPService

router = APIRouter(
    prefix="/api/v1/advanced",
    tags=["advanced"],
)

nlp_service = NLPService()

class TextAnalysisRequest(BaseModel):
    text: str

class ExperienceLevelResponse(BaseModel):
    level: str
    confidence: float

class KeyPhrasesResponse(BaseModel):
    phrases: List[Dict[str, float]]

@router.post("/experience-level")
async def analyze_experience_level(request: TextAnalysisRequest) -> ExperienceLevelResponse:
    """Analyze and extract experience level from text."""
    try:
        level = nlp_service.extract_experience_level(request.text)
        confidence = 0.8 if level != "Not specified" else 0.3
        return ExperienceLevelResponse(level=level, confidence=confidence)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/key-phrases")
async def extract_key_phrases(request: TextAnalysisRequest) -> KeyPhrasesResponse:
    """Extract key phrases from text."""
    try:
        phrases = nlp_service.extract_key_phrases(request.text)
        result = [{"phrase": p[0], "score": p[1]} for p in phrases]
        return KeyPhrasesResponse(phrases=result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
