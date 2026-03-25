# InterviewIQ

> **AI-powered interview practice platform** - Master technical interviews with real-time feedback from AI interviewers.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-purple.svg)](https://openrouter.ai/)

---

## Features

-  **AI Interview Practice**: Practice with intelligent interviewers powered by advanced AI models
- **Resume Analysis**: Automatic resume parsing and skill extraction
- **Real-Time Feedback**: Get instant scores and detailed feedback on every answer
- **Performance Reports**: Comprehensive interview reports with breakdown analysis
- **Interview History**: Track your progress across multiple interviews
- **Professional UI**: Dark theme with smooth animations
- **Secure**: No authentication required for MVP (private deployments)
- **Responsive**: Works seamlessly on desktop and mobile

---

## Architecture

```
InterviewIQ/
├── Backend (FastAPI)          ← AI Engine + REST API
│   ├── OpenRouter Integration
│   ├── Gemini 2.0 Flash (Resume Analysis)
│   └── LLaMA 3.3 70B (Questions & Evaluation)
│
├── Frontend (Next.js)         ← User Interface
│   ├── Landing & Upload
│   ├── Interview Chat
│   ├── Report Generation
│   └── Interview History
│
└── Database (SQLite)          ← Data Persistence
    └── Interview Records
```

---

## Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Python**: 3.9 or higher
- **npm**: 9.0.0 or higher
- **OpenRouter API Key** (free): https://openrouter.ai/keys

### 1. Clone Repository

```bash
git clone <repository-url>
cd InterviewIQ
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENROUTER_API_KEY=your-api-key-here" > .env

# Start backend server
python main.py
```

Backend will be available at: **http://localhost:8000**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### 4. Access the App

1. Open http://localhost:3000 in your browser
2. Upload your resume (PDF)
3. Select an interview role
4. Start practicing!

---

## 📁 Project Structure

```
InterviewIQ/
├── backend/                      # FastAPI backend
│   ├── main.py                  # FastAPI application (6 endpoints)
│   ├── engine.py                # AI integration (OpenRouter, Gemini, LLaMA)
│   ├── parser.py                # PDF resume parsing
│   ├── models.py                # SQLAlchemy database models
│   ├── schemas.py               # Pydantic validation schemas
│   ├── config.py                # Configuration management
│   ├── database.py              # Database initialization
│   ├── requirements.txt         # Python dependencies
│   └── README.md                # Backend documentation
│
├── frontend/                     # Next.js frontend
│   ├── app/                     # App Router pages
│   │   ├── page.tsx             # Landing page
│   │   ├── role-selection/      # Role selection page
│   │   ├── interview/           # Interview chat page
│   │   │   └── report/          # Interview report page
│   │   ├── history/             # Interview history page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   │
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── UploadZone.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── RoleSelector.tsx
│   │   │   └── Navigation.tsx
│   │   │
│   │   ├── context/             # React Context
│   │   │   └── AppContext.tsx   # Global state management
│   │   │
│   │   ├── services/            # API services
│   │   │   └── api.ts           # Axios API client
│   │   │
│   │   └── utils/               # Utilities
│   │       ├── types.ts         # TypeScript types
│   │       ├── helpers.ts       # Helper functions
│   │       └── cn.ts            # Class name utility
│   │
│   ├── package.json             # Node dependencies
│   ├── tailwind.config.ts       # Tailwind CSS config
│   ├── next.config.ts           # Next.js config
│   ├── tsconfig.json            # TypeScript config
│   └── README.md                # Frontend documentation
│
├── IMPLEMENTATION_COMPLETE.md   # Project completion summary
├── COMPLETE_SETUP_GUIDE.md      # Full setup & deployment guide
├── BACKEND_FRONTEND_INTEGRATION.md # API contract reference
├── API_REFERENCE.md              # API endpoint reference
└── README.md                     # This file
```

---



## Tech Stack

### Backend
- **Framework**: FastAPI 0.109+
- **Server**: Uvicorn
- **Database**: SQLite with SQLAlchemy ORM
- **AI**: OpenRouter API integration
  - Gemini 2.0 Flash (Resume analysis)
  - LLaMA 3.3 70B (Question generation & evaluation)
- **Parsing**: PyPDF (PDF text extraction)

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 11.0
- **Icons**: Lucide React 0.334
- **HTTP Client**: Axios 1.6
- **State Management**: React Context API

### Deployment
- **Backend**: Railway, Heroku, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, AWS Amplify
- **Database**: SQLite (local), PostgreSQL (production)

---

## 📖 Usage Guide

### 1. Landing Page
- View platform features
- Upload resume (PDF format, max 10MB)
- Automatic analysis with AI

### 2. Role Selection
- Choose from 8 interview roles:
  - Frontend Engineer
  - Backend Engineer
  - Full Stack Developer
  - Data Scientist
  - DevOps Engineer
  - AI/ML Engineer
  - Senior Backend Engineer
  - Product Manager

### 3. Interview Chat
- Answer 5 interview questions
- Get real-time feedback with:
  - Score (0-10)
  - Clarity/Depth/Relevance breakdown
  - Strengths and weaknesses
- See next question after evaluation

### 4. Interview Report
- View overall score (0-50)
- See all 5 evaluation details
- Get AI recommendation
- Track improvement over time

### 5. Interview History
- View all past interviews
- Performance comparison
- Quick access to previous reports

---



## 🚀 Deployment

### Deploy Backend to Production

**Option 1: Railway** (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

**Option 2: Docker**
```bash
docker build -t interviewiq-backend .
docker run -p 8000:8000 -e OPENROUTER_API_KEY=your-key interviewiq-backend
```

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---



## Roadmap

### Phase 1 ✅ (Complete)
- Project setup and architecture
- Backend API implementation
- Frontend core components
- Database persistence

### Phase 2 (Upcoming)
- Video recording and replay
- Advanced analytics dashboard
- Interview templates library
- Multi-language support

### Phase 3 (Future)
- User authentication and profiles
- Peer review system
- Subscription model
- Mobile apps (iOS/Android)

---

## Getting Started Now!

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev

# Open http://localhost:3000
```

**Ready to practice your interviews? Let's go!**
