import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def sample_resume():
    """Sample resume text for testing."""
    return """
    John Doe
    Software Engineer
    
    Skills: Python, JavaScript, React, FastAPI, Docker, PostgreSQL, AWS
    
    Experience:
    - Developed REST APIs using FastAPI and Python
    - Built responsive web applications with React
    - Deployed applications on AWS using Docker
    """


@pytest.fixture
def sample_job_description():
    """Sample job description for testing."""
    return """
    We are looking for a Full Stack Developer with experience in:
    - Python and FastAPI for backend development
    - React and TypeScript for frontend
    - Docker and Kubernetes for containerization
    - AWS or GCP for cloud deployment
    - PostgreSQL or MongoDB for databases
    - Git for version control
    """
