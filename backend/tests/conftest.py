import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app
from app.core.auth import get_password_hash
from app.models.user import User

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def test_user(client):
    """Create a test user."""
    db = TestingSessionLocal()
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=get_password_hash("testpass123"),
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

@pytest.fixture(scope="function")
def auth_headers(client):
    """Get authentication headers."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser", "password": "testpass123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def sample_resume():
    return """
    John Doe - Software Engineer
    Skills: Python, JavaScript, React, FastAPI, Docker, PostgreSQL, AWS
    Experience: 5 years developing web applications
    """

@pytest.fixture
def sample_job_description():
    return """
    Looking for Full Stack Developer
    Requirements: Python, React, Docker, AWS, PostgreSQL
    Experience: 3+ years required
    """
