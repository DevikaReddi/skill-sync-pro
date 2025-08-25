# 🎯 SkillSync Pro

<div align="center">

![Backend CI](https://github.com/DevikaReddi/skill-sync-pro/workflows/Backend%20CI/badge.svg)
![Frontend CI](https://github.com/DevikaReddi/skill-sync-pro/workflows/Frontend%20CI/badge.svg)
![Deploy](https://github.com/DevikaReddi/skill-sync-pro/workflows/Deploy%20to%20Production/badge.svg)
[![codecov](https://codecov.io/gh/DevikaReddi/skill-sync-pro/branch/main/graph/badge.svg)](https://codecov.io/gh/DevikaReddi/skill-sync-pro)

**AI-Powered Resume & Job Description Analyzer**

[Live Demo](https://skill-sync-pro.vercel.app) | [API Docs](https://skillsync-pro-api.onrender.com/docs) | [Report Bug](https://github.com/DevikaReddi/skill-sync-pro/issues)

</div>

## 📋 Overview

SkillSync Pro is a full-stack web application that bridges the gap between job seekers' resumes and employer requirements using advanced NLP analysis.

## ✨ Features

- 🔍 **Dynamic Skill Gap Analysis** - Extract and compare skills using NLP
- 🤖 **AI-Powered Recommendations** - Get relevant skill suggestions
- 📊 **Match Percentage** - See how well you match the job requirements
- 🎨 **Modern UI** - Clean, responsive interface built with React and Tailwind CSS
- ⚡ **Fast API** - High-performance backend with FastAPI
- 🚀 **CI/CD Pipeline** - Automated testing and deployment

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.11** - Programming language
- **Pydantic** - Data validation using Python type annotations
- **pytest** - Testing framework
- **Docker** - Containerization

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Vitest** - Testing framework

### DevOps
- **GitHub Actions** - CI/CD pipeline
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **Docker** - Containerization

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (optional)

### Local Development

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development
uvicorn app.main:app --reload
Backend will be available at http://localhost:8000
Frontend Setup
bashcd frontend
npm install
npm run dev
Frontend will be available at http://localhost:5173
Using Docker
bashdocker-compose up
🧪 Testing
Backend Tests
bashcd backend
pytest
Frontend Tests
bashcd frontend
npm run test
📦 API Endpoints
EndpointMethodDescription/GETAPI information/healthGETHealth check/docsGETSwagger documentation/api/v1/analysis/analyzePOSTAnalyze resume against job description/api/v1/analysis/statusGETCheck analysis service status
🔄 CI/CD Pipeline
Every push to main triggers:

Backend CI - Linting, type checking, unit tests
Frontend CI - Linting, type checking, unit tests, build verification
Auto-deployment - Deploy to Render (backend) and Vercel (frontend)

📈 Project Status

 Day 1: Project setup and deployment
 Day 2: CI/CD pipeline and testing infrastructure
 Day 3: Core data models and basic UI
 Day 4: NLP setup and skill extraction
 Day 5: AI skill recommendations
 Day 6-15: Additional features and polish

📝 License
MIT License - see LICENSE file for details
👤 Author
Devika Reddi

GitHub: @DevikaReddi
LinkedIn: Devika Reddi

🙏 Acknowledgments

FastAPI for the amazing framework
React team for the powerful UI library
All contributors and testers


<div align="center">
Made with ❤️ and ☕
</div>
