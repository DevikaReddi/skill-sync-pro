"""Test analysis endpoints."""
import pytest
from fastapi import status

def test_analyze_with_valid_data(client, sample_resume, sample_job_description):
    """Test analysis with valid data."""
    response = client.post(
        "/api/v1/analysis/analyze",
        json={
            "resume_text": sample_resume,
            "job_description": sample_job_description
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert "match_percentage" in data
    assert "skill_analysis" in data
    assert "recommendations" in data
    assert 0 <= data["match_percentage"] <= 100

def test_analyze_with_short_text(client):
    """Test analysis with text below minimum length."""
    response = client.post(
        "/api/v1/analysis/analyze",
        json={
            "resume_text": "Too short",
            "job_description": "Also too short"
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_analysis_status_endpoint(client):
    """Test analysis status endpoint."""
    response = client.get("/api/v1/analysis/status")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "operational"
    assert "version" in data

def test_save_analysis_history(client, test_user, auth_headers, sample_resume, sample_job_description):
    """Test saving analysis to history."""
    # First, perform analysis
    analysis_response = client.post(
        "/api/v1/analysis/analyze",
        json={
            "resume_text": sample_resume,
            "job_description": sample_job_description
        }
    )
    analysis_data = analysis_response.json()
    
    # Save to history
    response = client.post(
        "/api/v1/history/save",
        headers=auth_headers,
        json={
            "title": "Test Analysis",
            "resume_text": sample_resume,
            "job_description": sample_job_description,
            "match_percentage": analysis_data["match_percentage"],
            "skill_analysis": analysis_data["skill_analysis"],
            "recommendations": analysis_data["recommendations"]
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Test Analysis"
    assert "id" in data

def test_get_analysis_history(client, test_user, auth_headers):
    """Test getting analysis history."""
    response = client.get("/api/v1/history/list", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
