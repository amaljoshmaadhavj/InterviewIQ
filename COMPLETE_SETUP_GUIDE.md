# InterviewIQ - Complete End-to-End Setup & Deployment Guide

## 🎯 Project Overview

**InterviewIQ** is an AI-powered interview practice platform consisting of:

- **Backend**: FastAPI with OpenRouter AI integration (Gemini + LLaMA)
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and Framer Motion
- **Database**: SQLite with SQLAlchemy ORM
- **AI Models**: 
  - Gemini 2.0 Flash (Resume Analysis)
  - LLaMA 3.3 70B (Question Generation & Evaluation)

---

## 🔧 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
│              (Next.js Frontend on :3000)               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/Axios
                       │ (CORS enabled)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Backend                        │
│                 (Uvicorn on :8000)                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │         OpenRouter API Client                   │  │
│  │ ┌─────────────────────────────────────────────┐ │  │
│  │ │ Gemini 2.0 Flash  │  LLaMA 3.3 70B        │ │  │
│  │ │ (Resume Analysis) │  (Q Gen & Evaluation) │ │  │
│  │ └─────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────┘  │
│                        │                                │
│  ┌────────────────────┴────────────────────────────┐  │
│  │  FastAPI Routes (6 Endpoints)                  │  │
│  │  ├─ /health                                    │  │
│  │  ├─ /upload (Resume analysis)                 │  │
│  │  ├─ /interview/start (Session + Q1)           │  │
│  │  ├─ /interview/chat (Answer + evaluation)    │  │
│  │  ├─ /interview/report (Report generation)    │  │
│  │  └─ /interviews (History)                     │  │
│  └─────────────────────┬──────────────────────────┘  │
│                        │                               │
│                        ▼                               │
│  ┌─────────────────────────────────────────────────┐  │
│  │        SQLite Database (interviews.db)          │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │ Interview | Message | InterviewReport │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

### Required

- **Python**: 3.9+ (for backend)
- **Node.js**: 18.0.0+ (for frontend)
- **npm**: 9.0.0+
- **OpenRouter API Key**: Free tier available at https://openrouter.ai/

### Optional

- **Git**: For cloning/version control
- **VS Code**: Recommended editor
- **Postman**: For API testing

---

## 🚀 Full System Setup (Step-by-Step)

### Step 1: Backend Setup

#### 1a. Configure OpenRouter API Key

```bash
# Get your free API key from https://openrouter.ai/
# Set environment variable (Windows PowerShell)
$env:OPENROUTER_API_KEY = "your-api-key-here"

# Or set in backend/.env file
echo "OPENROUTER_API_KEY=your-api-key-here" > backend/.env
```

#### 1b. Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 1c. Verify Backend Installation

```bash
# Check dependencies installed
pip list | grep -E "fastapi|uvicorn|sqlalchemy|requests"

# Expected output should show:
# - fastapi==0.109.0+
# - uvicorn==0.27.0+
# - sqlalchemy==2.0.0+
# - requests==2.32.0+
# - python-dotenv==1.0.0+
```

#### 1d. Start Backend Server

```bash
# From backend directory (with venv activated)
python main.py

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete

# Backend is ready when you see ✅ All systems initialized
```

#### 1e. Verify Backend Health

```bash
# In a new terminal/tab
curl http://localhost:8000/health

# Expected response:
# {"status":"operational","timestamp":"2024-..."}
```

---

### Step 2: Frontend Setup

#### 2a. Install Frontend Dependencies

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install Node packages
npm install

# Wait for completion (first install may take 2-3 minutes)
```

#### 2b. Configure Environment

```bash
# Check .env.local file
cat .env.local

# Should contain:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# If not, create it:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

#### 2c. Verify Frontend Setup

```bash
# Type check TypeScript
npm run type-check

# Expected: "No errors found"

# Check build (optional)
npm run build
```

#### 2d. Start Frontend Development Server

```bash
# From frontend directory
npm run dev

# Expected output:
# ▲ Next.js 15.0.0
# - Local: http://localhost:3000
# - Ready in 3.2s
```

---

### Step 3: Complete System Testing

#### 3a. Open Both Services

**Terminal 1 (Backend):**
```bash
cd backend
# Make sure virtual environment is activated
python main.py
# Should show: Running on http://0.0.0.0:8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Should show: Ready on http://localhost:3000
```

#### 3b. Test in Browser

1. **Open Frontend**: https://localhost:3000
   - Should see landing page with hero section
   - "Upload your resume" section visible

2. **Test Upload**:
   - Find a sample PDF (any file works for testing)
   - Drag and drop into upload zone
   - Should show "Neural Analyzing..." animation
   - Should redirect to role selection page

3. **Test Role Selection**:
   - See 8 role cards
   - Select any role (e.g., "Backend Engineer")
   - Click "Start Interview"
   - Should redirect to chat page with first question

4. **Test Interview Chat**:
   - See first question from LLaMA
   - Type a sample answer
   - Click Send button
   - Should show evaluation with score and feedback
   - Next question should appear

5. **Test Report**:
   - After 5 questions complete
   - Click "View Report"
   - Should show overall score and breakdown

---

## 📊 Testing All API Endpoints

### Using curl (Command Line)

```bash
# 1. Health Check
curl http://localhost:8000/health

# 2. Upload Resume (create dummy PDF first)
curl -X POST \
  -F "file=@resume.pdf" \
  http://localhost:8000/upload

# 3. Start Interview
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Backend Engineer",
    "resume_data": {
      "skills": ["Python", "FastAPI"],
      "experience": "5 years"
    }
  }' \
  http://localhost:8000/interview/start

# 4. Submit Answer (use session_id from step 3)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "SESSION_ID",
    "answer": "I would use design patterns..."
  }' \
  http://localhost:8000/interview/chat

# 5. Get Report
curl http://localhost:8000/interview/report/SESSION_ID

# 6. Get History
curl http://localhost:8000/interviews
```

### Using Swagger UI (Recommended)

1. Open browser: http://localhost:8000/docs
2. All endpoints listed with documentation
3. Click "Try it out" to test
4. Provides pre-filled request/response examples

---

## 🎯 Complete User Flow Walkthrough

### Scenario: New User Interview

**Step 1: Landing Page**
- User opens http://localhost:3000
- Sees hero section: "Master Technical Interviews"
- Sees features and benefits
- Scrolls to upload section

**Step 2: Resume Upload**
- Drags PDF resume to upload zone
- Progress animation shows
- Backend analyzes with Gemini (extracts skills)
- Auto-redirects to role selection

**Step 3: Role Selection**
- User sees 8 role cards
- Selects "Backend Engineer"
- Clicks "Start Interview"
- Backend creates session
- LLaMA generates first question
- Auto-redirects to interview page

**Step 4: Interview Chat (5 Questions)**
- User sees: "Q1: Tell me about your experience with databases..."
- Types answer in textarea
- Presses Enter or clicks Send
- Backend evaluates with LLaMA
- Shows score (0-10) + feedback
- Shows next question
- Repeats for questions 2-5

**Step 5: Interview Report**
- After Q5, completion button shows
- User clicks "View Report"
- Sees overall score (0-50)
- Sees 5-question breakdown:
  - Question text
  - Score /10
  - Clarity/Depth/Relevance breakdown
  - Strengths (✓)
  - Areas to improve (⚠)
- Can click "New Interview" to restart

**Step 6: Interview History**
- User clicks "History" in navbar
- Sees past interviews with:
  - Role
  - Score
  - Date
  - Performance bar
- Can click any to view full report

---

## 🔒 Configuration Files Reference

### Backend Configuration (`backend/config.py`)

```python
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Models
RESUME_ANALYZER_MODEL = "google/gemini-2.0-flash:free"
QUESTION_MODEL = "meta-llama/llama-3.3-70b-instruct:free"
EVALUATION_MODEL = "meta-llama/llama-3.3-70b-instruct:free"

# Database
DATABASE_URL = "sqlite:///interviews.db"

# Interview Settings
QUESTIONS_PER_INTERVIEW = 5
MAX_API_CALLS_PER_SESSION = 15
```

### Frontend Configuration (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "No module named 'fastapi'"

**Symptom**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
cd backend
python -m venv venv
# Activate venv, then:
pip install -r requirements.txt
```

### Issue 2: "Connection refused: localhost:8000"

**Symptom**: Frontend can't connect to backend

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `.env.local` has correct API URL
3. Check CORS headers in backend/main.py
4. Both services should be on same machine

### Issue 3: "OPENROUTER_API_KEY not set"

**Symptom**: Backend fails on resume upload

**Solution**:
```bash
# Set environment variable
$env:OPENROUTER_API_KEY = "your-key-from-openrouter.ai"

# Or add to backend/.env file
OPENROUTER_API_KEY=your-key-here
```

### Issue 4: "Port 3000 already in use"

**Symptom**: Frontend won't start

**Solution**:
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process or use different port
# For different port:
npm run dev -- -p 3001
```

### Issue 5: "Axios 404 on /upload endpoint"

**Symptom**: File upload fails with 404

**Solution**:
1. Verify backend is running
2. Check endpoint path is `/upload` (not `/upload-resume`)
3. Verify file is PDF format
4. Check file size (<10MB)

---

## 📈 Performance Optimization

### Backend

```python
# Use connection pooling
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool  # For SQLite
)

# Cache resume analyses (optional)
@cache(expire=3600)
def analyze_resume(resume: ResumeData):
    ...
```

### Frontend

```bash
# Build optimization
npm run build

# Check bundle size
npm run build -- --analyze

# Production server performs autocompression
npm start
```

---

## 🚢 Deployment Guide

### Deployment Options

#### Option 1: Vercel + Railway (Recommended)

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel
# Follow prompts, select Next.js
```

**Backend (Railway):**
```bash
# Railway.app supports Python/FastAPI
# Connect your GitHub repo
# Set environment variables:
# - OPENROUTER_API_KEY
# - DATABASE_URL (optional, defaults to SQLite)
```

#### Option 2: Docker Compose

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
    volumes:
      - ./backend/interviews.db:/app/interviews.db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000
```

**Deploy:**
```bash
docker-compose up -d
# Access at http://localhost:3000
```

#### Option 3: Manual VPS Deployment

**On your VPS:**
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py  # or use gunicorn/supervisor

# Frontend
cd frontend
npm install
npm run build
npm start  # or use pm2

# Use Nginx as reverse proxy for both
```

---

## 📊 Monitoring & Debugging

### Backend Logs

```bash
# Enable debug logging
# In backend/main.py:
logging.basicConfig(level=logging.DEBUG)

# Check logs
tail -f backend/app.log  # On macOS/Linux
Get-Content -Tail 50 -Wait backend/app.log  # Windows
```

### Frontend Debugging

```bash
# VS Code DevTools: F12
# Check:
# - Network tab (API calls)
# - Console tab (errors)
# - Storage tab (session data)

# Terminal logging during dev:
npm run dev  # Shows build errors in real-time
```

### API Testing

```bash
# Test all endpoints systematically
# See "Testing All API Endpoints" section above

# Performance testing
curl -w "@curl_format.txt" http://localhost:8000/health
```

---

## ✅ Final Verification Checklist

- [ ] Backend running on http://0.0.0.0:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Swagger UI accessible at http://localhost:8000/docs
- [ ] Health check returns `{"status":"operational"}`
- [ ] Can upload PDF file
- [ ] Can select interview role
- [ ] Can submit interview answer
- [ ] Can view interview report
- [ ] Can view interview history
- [ ] CORS enabled (no blocked requests)
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser

---

## 📚 Project Documentation

- **Backend**: See `backend/README.md`
- **Frontend**: See `frontend/FRONTEND_COMPLETE.md`
- **API Reference**: http://localhost:8000/docs (Swagger)

---

## 🎓 Next Steps

1. **Verify setup works end-to-end** (see checklist above)
2. **Add your own resume** and take practice interview
3. **Customize roles** in `frontend/src/components/RoleSelector.tsx`
4. **Deploy to production** using Vercel/Railway
5. **Monitor usage** and gather feedback
6. **Iterate** on AI prompts for better evaluations

---

## 📞 Support

**Common Resources:**
- FastAPI Docs: https://fastapi.tiangolo.com/
- Next.js Docs: https://nextjs.org/docs
- OpenRouter Docs: https://openrouter.ai/docs
- Tailwind CSS: https://tailwindcss.com/docs

**Debugging Approach:**
1. Check browser console (F12)
2. Check backend terminal logs
3. Use Swagger UI to test API
4. Verify environment variables
5. Check CORS headers in Network tab

---

**Version**: 1.0.0 Complete  
**Status**: ✅ Phase 3, 4, 5 & 6 Complete  
**Last Updated**: 2024

---

## 🎉 You're All Set!

Your InterviewIQ platform is ready for:
- ✅ Development
- ✅ Testing
- ✅ Deployment
- ✅ User interviews

Start with `python main.py` in backend and `npm run dev` in frontend!
