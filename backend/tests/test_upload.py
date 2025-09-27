"""Tests for file upload functionality."""
import pytest
from fastapi import status
import io

def test_pdf_parser():
    """Test PDF parsing functionality with valid resume text."""
    from app.services.pdf_parser import PDFParser
    
    parser = PDFParser()
    
    # Test with a valid resume-like text
    sample_text = """John Doe
    Software Engineer
    john.doe@email.com
    123-456-7890
    
    EXPERIENCE
    Senior Software Developer at Tech Corp
    2020-Present
    - Developed web applications using Python and JavaScript
    - Led team of 5 developers
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of Technology, 2019
    
    SKILLS
    Python, JavaScript, React, Docker, AWS
    """
    
    validation = parser.validate_resume_content(sample_text)
    
    assert validation["is_valid"] == True
    assert validation["confidence"] >= 50
    assert len(validation["issues"]) == 0

def test_upload_endpoint_validation(client):
    """Test upload endpoint validation without authentication."""
    # The upload endpoint requires authentication
    response = client.post(
        "/api/v1/upload/resume",
        files={"file": ("test.exe", b"content", "application/x-msdownload")}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_upload_endpoint_with_auth(client, test_user, auth_headers):
    """Test upload endpoint validation with authentication."""
    # Test with invalid file type
    response = client.post(
        "/api/v1/upload/resume",
        files={"file": ("test.exe", b"content", "application/x-msdownload")},
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
    
    # Test with invalid PDF content - should return 422 not 500
    invalid_pdf_content = b"This is not a valid PDF"
    response = client.post(
        "/api/v1/upload/resume",
        files={"file": ("resume.pdf", invalid_pdf_content, "application/pdf")},
        headers=auth_headers
    )
    # Should return 422 for unprocessable entity, not 500
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "Could not extract text" in response.json()["detail"]
    
    # Test with valid text file
    text_content = b"""John Doe
    Software Engineer
    john.doe@example.com
    555-123-4567
    
    EXPERIENCE:
    Senior Developer at Tech Company (2020-Present)
    - Built scalable web applications using Python and React
    - Led a team of 5 developers
    - Implemented CI/CD pipelines
    
    EDUCATION:
    Bachelor of Science in Computer Science
    University of Technology, 2019
    
    SKILLS:
    Python, JavaScript, React, Docker, AWS, PostgreSQL
    """
    
    response = client.post(
        "/api/v1/upload/resume",
        files={"file": ("resume.txt", text_content, "text/plain")},
        headers=auth_headers
    )
    # Should successfully process text file
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] == True
    assert "text" in data
    assert "John Doe" in data["text"]
    assert data["character_count"] > 0

def test_template_generation():
    """Test resume template generation."""
    from app.services.resume_templates import TemplateManager
    
    manager = TemplateManager()
    
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "123-456-7890",
        "location": "Test City, TS",
        "skills": ["Python", "JavaScript"],
        "summary": "Test summary",
        "experience": [
            {
                "title": "Software Engineer",
                "company": "Test Company",
                "start_date": "2020",
                "end_date": "Present",
                "description": "Developed software"
            }
        ],
        "education": [
            {
                "degree": "Bachelor of Science",
                "school": "Test University",
                "graduation_date": "2019"
            }
        ]
    }
    
    # Test HTML generation for modern template
    html = manager.generate_resume("modern", data, "html")
    assert "Test User" in html
    assert "test@example.com" in html
    assert "Python" in html
    
    # Test text generation for ats template
    text = manager.generate_resume("ats", data, "text")
    assert "TEST USER" in text.upper()
    assert "test@example.com" in text
    assert "Python" in text