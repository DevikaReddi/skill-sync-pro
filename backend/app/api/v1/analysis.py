"""Analysis endpoints for resume and job description matching."""
from fastapi import APIRouter, HTTPException, status
from app.models.analysis import ResumeAnalysisRequest, AnalysisResponse
from app.services.analyzer import ResumeAnalyzer
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/analysis",
    tags=["analysis"],
    responses={404: {"description": "Not found"}},
)

# Initialize analyzer
analyzer = ResumeAnalyzer()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    """
    Analyze resume against job description.
    
    This endpoint performs skill extraction and matching between
    a resume and job description, returning detailed analysis results.
    """
    try:
        logger.info(f"Analyzing resume request received")
        result = await analyzer.analyze(request)
        logger.info(f"Analysis completed successfully")
        return result
    except Exception as e:
        logger.error(f"Analysis endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/status")
async def get_analysis_status():
    """Check if analysis service is operational."""
    return {"status": "operational", "version": "1.0.0"}
