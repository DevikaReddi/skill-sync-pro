from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(
    title="SkillSync Pro API",
    description="AI-Powered Resume & Job Description Analyzer",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to SkillSync Pro API",
        "status": "operational",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/test")
def test_endpoint():
    return {
        "message": "API v1 is working!",
        "endpoint": "test"
    }
