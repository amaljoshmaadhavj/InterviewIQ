# InterviewIQ Backend Testing Guide

## Overview
This guide explains how to test the InterviewIQ API using **Swagger UI** at `http://localhost:8000/docs`.

The system demonstrates the full interview pipeline:
1. **Resume Upload** → Gemini 2.0 Flash analyzes resume (1 API call)
2. **Interview Start** → LLaMA 3.3 generates first question (1 API call)
3. **Interview Chat** → LLaMA 3.3 evaluates answers (1 API call per response)

**Total: Max 3 API calls per complete 5-question interview**

---

## Prerequisites

1. **Backend running**: `python main.py` on `http://localhost:8000`
2. **Environment variables set**: `.env` file with `OPENROUTER_API_KEY`
3. **Sample PDF resume**: Create or use a test resume PDF

---

## Step-by-Step Testing via Swagger UI

### Step 1: Access Swagger UI

Open browser to **http://localhost:8000/docs**

You'll see all endpoints organized by tags:
- ✅ **Health Check**
- 📤 **Resume Upload & Analysis**
- 🎤 **Interview Management**
- 📊 **Reporting**

---

### Step 2: Health Check (Sanity Test)

**Endpoint**: `GET /health`

1. Click on "**Health Check**" section
2. Click "**GET /health**"
3. Click blue "**Try it out**" button
4. Click "**Execute**"

**Expected Response (200)**:
```json
{
  "status": "healthy",
  "service": "InterviewIQ Backend",
  "version": "1.0.0"
}
```

✅ If you see this, the backend is working!

---

### Step 3: Upload & Analyze Resume (Gemini Call #1)

**Endpoint**: `POST /upload`

**What happens**:
- File is parsed with PyMuPDF
- Text is sent to **Gemini 2.0 Flash** (free tier)
- Returns structured resume data: skills, projects, experience level, domains

#### Steps:

1. Click "**Resume Upload & Analysis**" section
2. Click "**POST /upload**"
3. Click blue "**Try it out**" button
4. Click "**Choose File**" and select a **PDF resume**
   - Example resume structure:
     ```
     JOHN DOE
     
     SKILLS
     Python, FastAPI, PostgreSQL, Docker, AWS, React
     
     EXPERIENCE
     Senior Backend Engineer at TechCorp (2020-2023)
     - Built microservices handling 1M+ requests/day
     - Led team of 5 engineers
     
     PROJECTS
     - InterviewIQ: AI-powered interview platform
     - MicroDB: In-memory database
     
     EDUCATION
     B.Tech Computer Science, IIT Delhi (2020)
     ```
5. Click "**Execute**"

**Expected Response (200)**:
```json
{
  "status": "success",
  "resume_data": {
    "skills": [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Docker",
      "AWS",
      "React"
    ],
    "experience_level": "senior",
    "domains": [
      "Backend",
      "DevOps",
      "Cloud"
    ],
    "projects": [
      "InterviewIQ: AI-powered interview platform",
      "MicroDB: In-memory database"
    ],
    "summary": "Senior Backend Engineer with 3+ years experience building scalable microservices and leading engineering teams.",
    "raw_response": "[actual GPT response]"
  },
  "file_name": "YourResume.pdf",
  "sections_found": [
    "Experience",
    "Skills",
    "Projects",
    "Education"
  ]
}
```

✅ Key validations:
- ✓ `experience_level` is correctly classified (junior/mid/senior)
- ✓ `skills` array contains detected technical skills
- ✓ `domains` shows relevant technical areas
- ✓ `projects` extracted from resume

**💾 Save the `resume_data` object** - you'll need it in the next step!

---

### Step 4: Start Interview (LLaMA Call #1)

**Endpoint**: `POST /interview/start`

**What happens**:
- Creates a new interview session in SQLite
- Sends resume context to **LLaMA 3.3 70B** (free tier)
- LLaMA generates first adaptive interview question
- Returns `session_id` for subsequent calls

#### Steps:

1. Go to "**Interview Management**" section
2. Click "**POST /interview/start**"
3. Click blue "**Try it out**" button
4. In the **Request body**, paste this JSON:

```json
{
  "role": "Senior Backend Engineer",
  "resume_data": {
    "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "React"],
    "experience_level": "senior",
    "domains": ["Backend", "DevOps", "Cloud"],
    "projects": ["InterviewIQ", "MicroDB"],
    "summary": "Senior Backend Engineer with 3+ years experience"
  }
}
```

5. Click "**Execute**"

**Expected Response (200)**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "Senior Backend Engineer",
  "first_question": "Looking at your experience building microservices at TechCorp, can you describe the most complex scaling challenge you faced? What was the bottleneck, and how did you resolve it?",
  "experience_level": "senior"
}
```

✅ Check:
- ✓ `first_question` is **contextual** to their role (mentions microservices)
- ✓ `session_id` is a valid UUID
- ✓ Question is **open-ended** (not yes/no)

**💾 Save the `session_id`** - you'll need it for all chat calls!

---

### Step 5: Answer Question (LLaMA Call #2 - Evaluation)

**Endpoint**: `POST /interview/chat`

**What happens**:
- Stores user's answer in SQLite
- Sends Q&A pair to **LLaMA 3.3 70B** for evaluation
- Returns score (0-10) + strengths/weaknesses/feedback
- Generates next question (if interview not complete)

#### Steps:

1. Go to "**Interview Management**" section
2. Click "**POST /interview/chat**"
3. Click blue "**Try it out**" button
4. In the **Request body**, paste:

```json
{
  "session_id": "<PASTE_YOUR_SESSION_ID>",
  "answer": "The biggest scaling challenge was our PostgreSQL database becoming a bottleneck when traffic hit 100K requests/second. We implemented read replicas and a distributed cache layer using Redis, which reduced p99 latency from 800ms to 50ms. We also migrated time-series data to TimescaleDB for better compression."
}
```

Replace `<PASTE_YOUR_SESSION_ID>` with the ID from Step 4.

5. Click "**Execute**"

**Expected Response (200)**:
```json
{
  "evaluation": {
    "score": 9,
    "clarity": 5,
    "depth": 5,
    "relevance": 5,
    "strengths": [
      "Clear explanation of the problem and solution",
      "Demonstrated knowledge of specific technologies (Redis, TimescaleDB)",
      "Explained measurable impact (p99 latency reduction)"
    ],
    "weaknesses": [
      "Could have mentioned testing/monitoring strategy",
      "No discussion of cost implications"
    ],
    "feedback": "Excellent answer! You identified the bottleneck, implemented a pragmatic solution, and measured the results. Your technical depth is impressive. Consider discussing observability and cost next time."
  },
  "question_number": 1,
  "is_complete": false,
  "next_question": "Can you walk us through a time when you had to debug a production incident that was difficult to reproduce? What was your approach?"
}
```

✅ Validations:
- ✓ `score` is 0-10 (higher for better answers)
- ✓ `strengths` and `weaknesses` are specific and actionable
- ✓ `next_question` is follow-up (different from first question)
- ✓ `is_complete` is `false` (interview continues)

---

### Step 6: Continue Interview (Answer #2, #3, #4)

Repeat **Step 5** with different answers:

**Question 2** (from previous response):
```json
{
  "session_id": "<YOUR_SESSION_ID>",
  "answer": "We had a MySQL deadlock that only happened under specific load conditions. We used binary search with our load testing to isolate it. Created detailed logs and ran the transaction sequence in isolation. Turned out we had circular lock dependencies on two tables during concurrent updates. We fixed it by changing the order of table locks and adding transaction retries with exponential backoff."
}
```

**Question 3** (wait for the system to generate):
```json
{
  "session_id": "<YOUR_SESSION_ID>",
  "answer": "I use Docker for local development, which matches production exactly. I version everything in git, use GitHub Actions for CI/CD, deploy to Kubernetes for orchestration, and use Datadog for monitoring. Every deploy is immutable - if there's an issue, we rollback the Docker image version, never patch in production."
}
```

**Question 4** (wait for the system to generate):
```json
{
  "session_id": "<YOUR_SESSION_ID>",
  "answer": "Testing is critical. I write unit tests for business logic (~80% coverage), integration tests for API contracts, and performance tests for critical paths. We run these automatically on every PR. For deployment, we use blue-green deploys with canary validation on 5% of traffic first, collecting metrics before rolling to 100%."
}
```

**Question 5** (wait for the system to generate):
```json
{
  "session_id": "<YOUR_SESSION_ID>",
  "answer": "The biggest mistake was scaling too early. We built fancy distributed systems before we needed them, and it slowed down development. Now I follow this: get it working, measure, then optimize. I also learned the importance of documentation - technical decisions should be recorded with the rationale so future team members understand why we made choices."
}
```

#### After Question 5:

When `is_complete` is `true`:
```json
{
  "evaluation": { /* final evaluation */ },
  "question_number": 5,
  "is_complete": true,
  "next_question": null
}
```

✅ Interview is now complete!

---

### Step 7: Get Final Report

**Endpoint**: `GET /interview/report/{session_id}`

1. Go to "**Reporting**" section
2. Click "**GET /interview/report/{session_id}**"
3. Click blue "**Try it out**"
4. In the `session_id` field, paste your session ID
5. Click "**Execute**"

**Expected Response (200)**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "Senior Backend Engineer",
  "average_score": 8.4,
  "recommendation": "HIRE - Good technical fit with some areas to develop",
  "strengths": [
    "Strong system design thinking",
    "Hands-on debugging skills",
    "DevOps and containerization knowledge",
    "Good testing practices mindset",
    "Learns from mistakes"
  ],
  "weaknesses": [
    "Limited security discussion",
    "Could emphasize collaborative aspects more",
    "Monitoring strategy could be more detailed"
  ],
  "api_calls_used": 3
}
```

✅ Key metrics:
- ✓ `average_score`: 8.4/10 (aggregated from Q1-Q5)
- ✓ `recommendation`: Matches score (8.4 → "HIRE")
- ✓ `api_calls_used`: 3 total (Gemini: 1, LLaMA: 2)

**Breakdown**:
- Score ≥ 8.0: "STRONG HIRE - Excellent fit for the role"
- Score 6.0-7.9: "HIRE - Good technical fit with some areas to develop"
- Score 4.0-5.9: "MAYBE - Needs improvement in key areas"
- Score < 4.0: "NO HIRE - Significant gaps in required skills"

---

### Step 8: View Interview History (Optional)

**Endpoint**: `GET /interviews`

1. Click "**Reporting**"
2. Click "**GET /interviews**"
3. Click blue "**Try it out**"
4. Click "**Execute**"

**Response**:
```json
{
  "interviews": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "Senior Backend Engineer",
      "created_at": "2024-03-24T14:32:15.123456",
      "score": 8.4,
      "experience_level": "senior"
    },
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440001",
      "role": "Frontend Engineer",
      "created_at": "2024-03-24T13:45:22.654321",
      "score": 7.2,
      "experience_level": "mid"
    }
  ]
}
```

✅ Dashboard-ready data!

---

## Database Validation

To confirm data is stored correctly in SQLite:

```bash
# From backend directory
python -c "
from database import engine
from models import Interview, Message
from sqlalchemy.orm import Session

with Session(engine) as db:
    interviews = db.query(Interview).all()
    print(f'Total interviews: {len(interviews)}')
    
    for interview in interviews[:1]:
        print(f'\\nInterview: {interview.session_id}')
        print(f'Role: {interview.role}')
        print(f'Experience: {interview.experience_level}')
        messages = db.query(Message).filter(Message.interview_id == interview.id).all()
        print(f'Messages: {len(messages)}')
        for msg in messages:
            print(f'  - {msg.sender}: {msg.message_type} ({len(msg.content)} chars)')
"
```

---

## Expected API Metrics

After running Step 6 (completing 5 questions):

| Metric | Value | Note |
|--------|-------|------|
| **Total API Calls** | 3 | 1 Gemini + 2 LLaMA |
| **Resume Analysis** | ~10 sec | Gemini Flash (fast) |
| **Question Gen** | ~20 sec | LLaMA full pipeline |
| **Evaluation** | ~15 sec | LLaMA scoring |
| **Model Context** | Senior Interviewer | From context.md |
| **Max Questions** | 5 | From config.py |

---

## CORS Configuration (Frontend Ready)

The API is configured to accept requests from:

✅ `http://localhost:3000` (Next.js dev server)
✅ `http://localhost:3001` (Alternative port)

The frontend (Next.js) will be built in Phase 6 and will run on `localhost:3000`.

Example frontend call:
```javascript
const response = await fetch("http://localhost:8000/upload", {
  method: "POST",
  body: formData, // contains PDF file
});
```

---

## Common Errors & Solutions

### Error: "OPENROUTER_API_KEY not found"

**Solution**: Check `.env` file has:
```
OPENROUTER_API_KEY=your_actual_key_here
```

Restart backend after updating.

### Error: "Only PDF files are accepted"

**Solution**: Ensure you're uploading a `.pdf` file, not `.doc` or `.docx`.

### Error: "Interview not found"

**Solution**: Copy the exact `session_id` from `/interview/start` response. Don't manually edit it.

### Error: 500 - "Chat processing failed"

**Solution**: 
1. Verify `session_id` is correct
2. Check backend logs for API errors
3. Ensure you completed `/interview/start` first

---

## Performance Expectations

| Operation | Time | Notes |
|-----------|------|-------|
| Resume Upload + Analysis | ~10s | Includes PDF parsing + Gemini call |
| Interview Start | ~20s | LLaMA question generation |
| Chat Response | ~30s | LLaMA evaluation + next question |
| Full 5Q Interview | ~2min | 3 API calls total |

---

## What's Being Tested

✅ **Resume Parsing**: PyMuPDF correctly extracts text from PDF
✅ **Gemini Integration**: Structures resume into JSON (skills, domains, etc.)
✅ **LLaMA Integration**: Generates contextual questions and evaluations
✅ **Database**: SQLite stores interviews, messages, and evaluations
✅ **API Validation**: Pydantic models validate all inputs/outputs
✅ **CORS**: Frontend will be able to call backend from `localhost:3000`
✅ **Senior Interviewer Persona**: Questions and evaluations match the "Senior Technical Interviewer" tone

---

## Next Steps

1. ✅ Backend API complete (Phase 3 & 4)
2. ✅ Database setup (Phase 5)
3. 🔄 **Phase 6**: Frontend (Next.js) with resume upload UI + chat interface
4. 🔄 **Phase 7**: Dashboard showing interview history and scores
5. 🔄 **Phase 8**: Optimization and performance tuning

---

## Summary

The entire pipeline works end-to-end:
1. Upload resume → Gemini analyzes (1 API call)
2. Start interview → LLaMA generates questions (1 API call)
3. Chat with AI → LLaMA evaluates answers (1 API call max)
4. Get report → Combined scores and recommendations
5. View history → Dashboard data ready

**Total: 3 API calls for a complete 5-question interview** ✅
