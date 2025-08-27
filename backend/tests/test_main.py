import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_root_endpoint(self):
        """Test root endpoint returns correct response."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Welcome to SkillSync Pro API"
        assert "status" in data
        assert data["status"] == "operational"
        assert "timestamp" in data
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}
    
    def test_api_v1_test(self):
        """Test API v1 test endpoint."""
        response = client.get("/api/v1/test")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "API v1 is working!"
        assert data["endpoint"] == "test"

class TestCORS:
    """Test CORS configuration."""
    
    def test_cors_headers_on_get_request(self):
        """Test that CORS headers are properly set on GET requests."""
        response = client.get(
            "/health",
            headers={"Origin": "http://localhost:5173"}
        )
        assert response.status_code == 200
    
    def test_cors_preflight_request(self):
        """Test CORS preflight request handling."""
        response = client.options(
            "/api/v1/analysis/analyze",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        assert response.status_code in [200, 405]

class TestErrorHandling:
    """Test error handling."""
    
    def test_404_error(self):
        """Test 404 error for non-existent endpoint."""
        response = client.get("/non-existent-endpoint")
        assert response.status_code == 404
        assert "detail" in response.json()

class TestAnalysisEndpoints:
    """Test analysis endpoints."""
    
    def test_analysis_status(self):
        """Test analysis status endpoint."""
        response = client.get("/api/v1/analysis/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        assert "version" in data
    
    def test_analyze_endpoint_with_valid_data(self):
        """Test analyze endpoint with valid data."""
        test_data = {
            "resume_text": "John Doe, Software Engineer with 5 years of experience in Python, React, and Docker. Skilled in building scalable web applications.",
            "job_description": "Looking for a Full Stack Developer with experience in Python, React, and cloud technologies."
        }
        response = client.post("/api/v1/analysis/analyze", json=test_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "match_percentage" in data
        assert "skill_analysis" in data
        assert "recommendations" in data
    
    def test_analyze_endpoint_with_invalid_data(self):
        """Test analyze endpoint with invalid data (too short)."""
        test_data = {
            "resume_text": "Too short",
            "job_description": "Also short"
        }
        response = client.post("/api/v1/analysis/analyze", json=test_data)
        assert response.status_code == 422  # Validation error
