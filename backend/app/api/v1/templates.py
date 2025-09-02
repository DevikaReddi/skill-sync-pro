"""Resume template API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, PlainTextResponse
from typing import Optional
from pydantic import BaseModel, Field
from app.core.auth import get_current_active_user
from app.models.user import User
from app.services.resume_templates import TemplateManager

router = APIRouter(
    prefix="/api/v1/templates",
    tags=["templates"],
)

class ResumeData(BaseModel):
    name: str = Field(..., example="John Doe")
    email: str = Field(..., example="john@example.com")
    phone: str = Field(..., example="123-456-7890")
    location: str = Field(..., example="New York, NY")
    summary: str = Field(..., example="Experienced software engineer...")
    skills: list = Field(default_factory=list)
    experience: list = Field(default_factory=list)
    education: list = Field(default_factory=list)

@router.get("/list")
async def list_templates():
    """List available resume templates."""
    manager = TemplateManager()
    return {
        "templates": manager.list_templates()
    }

@router.post("/generate/{template_name}")
async def generate_resume(
    template_name: str,
    data: ResumeData,
    format: str = "html",
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """Generate resume using specified template."""
    manager = TemplateManager()
    
    if template_name not in ["modern", "ats"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_name}' not found"
        )
    
    if format not in ["html", "text"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format must be 'html' or 'text'"
        )
    
    try:
        resume_content = manager.generate_resume(
            template_name,
            data.dict(),
            format
        )
        
        if format == "html":
            return HTMLResponse(content=resume_content)
        else:
            return PlainTextResponse(content=resume_content)
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating resume: {str(e)}"
        )

@router.post("/parse-to-template")
async def parse_to_template(
    resume_text: str,
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """Parse resume text and extract structured data for templates."""
    from app.services.nlp_service import NLPService
    
    nlp_service = NLPService()
    
    # Extract structured data from resume text
    skills = nlp_service.extract_skills_advanced(resume_text)
    
    # Basic parsing (this could be enhanced with more sophisticated NLP)
    lines = resume_text.split('\n')
    
    # Try to extract name (usually first non-empty line)
    name = next((line.strip() for line in lines if line.strip()), "Your Name")
    
    # Extract email
    import re
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, resume_text)
    email = email_match.group(0) if email_match else "email@example.com"
    
    # Extract phone
    phone_pattern = r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
    phone_match = re.search(phone_pattern, resume_text)
    phone = phone_match.group(0) if phone_match else "123-456-7890"
    
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "location": "City, State",
        "summary": resume_text[:200] + "...",
        "skills": skills[:10],
        "experience": [],
        "education": []
    }
