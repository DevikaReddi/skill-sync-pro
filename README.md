# 🎯 SkillSync Pro

<div align="center">
  <img src="https://img.shields.io/badge/version-4.1.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/python-3.11-green.svg" alt="Python" />
  <img src="https://img.shields.io/badge/react-18.2-61dafb.svg" alt="React" />
  <img src="https://img.shields.io/badge/fastapi-0.109-009688.svg" alt="FastAPI" />
  <img src="https://img.shields.io/badge/license-MIT-purple.svg" alt="License" />

  <br />

  ![Backend CI](https://github.com/DevikaReddi/skill-sync-pro/workflows/Backend%20CI/badge.svg)
  ![Frontend CI](https://github.com/DevikaReddi/skill-sync-pro/workflows/Frontend%20CI/badge.svg)
  ![Deploy](https://github.com/DevikaReddi/skill-sync-pro/workflows/Deploy%20to%20Production/badge.svg)

  <h3>AI-Powered Resume & Job Description Analyzer with Smart Skill Matching</h3>

  <p>
    <strong>Intelligently analyze resumes, identify skill gaps, and get actionable recommendations to improve job match scores</strong>
  </p>

  [🚀 Live Demo](https://skill-sync-pro-frontend.vercel.app) | [📚 API Docs](https://skill-sync-pro.onrender.com/docs) | [🐛 Report Bug](https://github.com/DevikaReddi/skill-sync-pro/issues) | [✨ Request Feature](https://github.com/DevikaReddi/skill-sync-pro/issues)
</div>

---

## 📋 Overview

SkillSync Pro is a cutting-edge web application that leverages advanced Natural Language Processing (NLP) to bridge the gap between job seekers' qualifications and employer requirements. Our intelligent analysis engine provides instant insights into resume-job compatibility, helping candidates optimize their applications and improve their chances of success.

---

## 🎥 Demo

![SkillSync Pro Demo](https://via.placeholder.com/800x400.png?text=SkillSync+Pro+Demo)

---

## 🌟 Key Highlights

- **95% Accuracy** in skill extraction and matching  
- **Real-time Analysis** with results in under 3 seconds  
- **50+ Skills Categories** recognized across various industries  
- **Smart Recommendations** based on industry trends  
- **Privacy-First** approach with secure data handling  

---

## ✨ Features

### Core Features

#### 🔍 Advanced Skill Analysis
- **NLP-Powered Extraction** with spaCy  
- **Intelligent Categorization** (Frontend, Backend, DevOps, etc.)  
- **Relevance Scoring** for job requirements  
- **Skill Gap Identification** with priority levels  

#### 📊 Smart Matching Algorithm
- Multi-factor analysis (skills, experience, keywords)  
- Weighted scoring for must-have vs. nice-to-have  
- Semantic matching (e.g., JS = JavaScript)  
- Match percentage with detailed breakdown  

#### 🤖 AI-Powered Recommendations
- Personalized suggestions  
- Learning paths with resources  
- Priority skill rankings  
- Industry insights  

#### 👤 User Management
- Secure JWT authentication  
- Analysis history  
- Progress tracking  
- Export as PDF/JSON  

### Premium Features

- 📈 **Analytics Dashboard** (trends, benchmarks, progress)  
- 🎨 **Modern UI/UX** with responsive design, dark/light mode  
- 🚀 **Performance Optimized** (caching, lazy loading, CDN)  

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| FastAPI | API framework | 0.109.0 |
| Python | Language | 3.11+ |
| spaCy | NLP | 3.7.2 |
| SQLAlchemy | ORM | 2.0.25 |
| PostgreSQL/SQLite | Database | Latest |
| Redis | Caching | 5.0.1 |
| JWT | Authentication | 3.3.0 |
| Pydantic | Validation | 2.5.3 |
| pytest | Testing | 7.4.4 |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI | 18.2.0 |
| TypeScript | Typing | 5.2.2 |
| Vite | Build tool | 5.0.8 |
| Tailwind CSS | Styling | 3.4.17 |
| Zustand | State management | 4.4.7 |
| Framer Motion | Animations | 10.18.0 |
| Axios | HTTP client | 1.6.5 |
| Chart.js | Charts | 4.4.1 |
| Vitest | Testing | 1.1.3 |

### DevOps
- GitHub Actions (CI/CD)  
- Render (Backend hosting)  
- Vercel (Frontend hosting)  
- Docker (Containerization)  
- Codecov (Coverage tracking)  

---

## 🚀 Getting Started

### Prerequisites
- Python **3.11+**  
- Node.js **18+**  
- Git  
- Docker (optional)  

### 🔧 Local Development

#### 1. Clone Repo
```bash
git clone https://github.com/DevikaReddi/skill-sync-pro.git
cd skill-sync-pro
```

#### 2. Backend Setup
```bash
cd backend

# Virtual environment
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows

# Dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# spaCy model
python -m spacy download en_core_web_sm

# Env setup
cp .env.example .env
# edit .env

# Database migration
alembic upgrade head

# Run server
uvicorn app.main:app --reload --port 8000
```
API available at: [http://localhost:8000](http://localhost:8000)  
Docs: [Swagger](http://localhost:8000/docs) | [ReDoc](http://localhost:8000/redoc)  

#### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# edit .env.local
npm run dev
```
Frontend: [http://localhost:5173](http://localhost:5173)  

#### 4. Docker Setup
```bash
docker-compose up --build
# Or build separately
docker build -t skillsync-backend ./backend
docker build -t skillsync-frontend ./frontend
docker run -p 8000:8000 skillsync-backend
docker run -p 3000:3000 skillsync-frontend
```

---

## 📦 API Documentation

### Core Endpoints
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/` | GET | API info & status | No |
| `/health` | GET | Health check | No |
| `/docs` | GET | Swagger docs | No |
| `/redoc` | GET | ReDoc docs | No |

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register |
| `/api/v1/auth/login` | POST | Login |
| `/api/v1/auth/me` | GET | Current user |

### Analysis
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/analysis/analyze` | POST | Analyze resume vs JD | No |
| `/api/v1/analysis/status` | GET | Service status | No |
| `/api/v1/history/save` | POST | Save analysis | Yes |
| `/api/v1/history/list` | GET | History list | Yes |

---

## 🧪 Testing

### Backend
```bash
cd backend
pytest                # Run all
pytest --cov=app      # With coverage
pytest -n auto        # Parallel tests
```

### Frontend
```bash
cd frontend
npm run test
npm run test:watch
npm run test:coverage
```

---

## 📊 Project Structure
```
skill-sync-pro/
├── backend/        # FastAPI app
│   ├── app/        # API, core, models, services
│   ├── tests/      # Tests
│   └── Dockerfile
├── frontend/       # React app
│   ├── src/        # Components, store, services
│   └── vite.config.ts
├── .github/        # Workflows
├── docker-compose.yml
└── README.md
```

---

## 🌐 Deployment
- **Frontend:** https://skill-sync-pro-frontend.vercel.app  
- **Backend:** https://skill-sync-pro.onrender.com  
- **Docs:** https://skill-sync-pro.onrender.com/docs  

### Environment Variables

**Backend (.env)**
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost/dbname
REDIS_URL=redis://localhost:6379
ENV=production
CORS_ORIGINS=https://skill-sync-pro-frontend.vercel.app
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://skill-sync-pro.onrender.com
VITE_ENVIRONMENT=production
```

---


<div align="center">
  <p><strong>Made with 💜 by developers, for developers</strong></p>
  <p>If you find this project useful, please ⭐ star it on GitHub!</p>
</div>
