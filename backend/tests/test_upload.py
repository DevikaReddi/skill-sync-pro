"""Tests for file upload functionality."""
import pytest
from fastapi import status
import io

def test_pdf_parser():
    """Test PDF parsing functionality."""
    from app.services.pdf_parser import PDFParser
    
    parser = PDFParser()
    
    # Test text extraction
    sample_text = "John Doe\nSoftware Engineer\nSkills: Python, JavaScript"
    validation = parser.validate_resume_content(sample_text)
    
    assert validation["is_valid"] == True
    assert validation["confidence"] > 0

def test_upload_endpoint_validation(client):
    """Test upload endpoint validation."""
    # Test with invalid file type
    response = client.post(
        "/api/v1/upload/resume",
        files={"file": ("test.exe", b"content", "application/exe")}
    )
    assert response.status_code == status.HTTP_415_UNSUPPORTED_MEDIA_TYPE

def test_template_generation():
    """Test resume template generation."""
    from app.services.resume_templates import TemplateManager
    
    manager = TemplateManager()
    
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "skills": ["Python", "JavaScript"],
        "summary": "Test summary"
    }
    
    # Test HTML generation
    html = manager.generate_resume("modern", data, "html")
    assert "Test User" in html
    assert "test@example.com" in html
    
    # Test text generation
    text = manager.generate_resume("ats", data, "text")
    assert "TEST USER" in text
