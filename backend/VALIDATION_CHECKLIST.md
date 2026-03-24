# Phase 3 & 4 Validation Checklist ✅

Use this checklist to verify that the Phase 3 (AI Engine) and Phase 4 (Backend APIs) implementation is complete and working correctly.

---

## 📋 Pre-Flight Checks

- [ ] Backend dependencies installed: `pip install -r requirements.txt`
- [ ] `.env` file created with `OPENROUTER_API_KEY`
- [ ] Backend running: `python main.py`
- [ ] No Python errors in console
- [ ] API responding to health check: `curl http://localhost:8000/health`

---

## 🧪 Phase 3: AI Engine (OpenRouter Integration)

### Resume Analysis (Gemini 2.0 Flash)

**File: engine.py - ResumeAnalyzer class**

- [ ] `analyze_resume()` method exists
- [ ] Uses `google/gemini-2.0-flash:free` model
- [ ] Temperature set to 0.3 (consistent structure)
- [ ] Returns JSON with:
  - [ ] `skills` array
  - [ ] `experience_level` (junior/mid/senior)
  - [ ] `domains` array
  - [ ] `projects` array
  - [ ] `summary` string

**Test**:
```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@resume.pdf" \
  | jq '.resume_data'
```

Expected output contains: `skills`, `experience_level`, `domains`, `projects`, `summary`

✅ **Pass**: All fields present and correctly classified

---

### Question Generation (LLaMA 3.3 70B)

**File: engine.py - InterviewEngine class**

- [ ] `generate_question()` method exists
- [ ] Uses `meta-llama/llama-3.3-70b-instruct:free` model
- [ ] Temperature set to 0.8 (for variety)
- [ ] Accepts:
  - [ ] `resume_data` dict
  - [ ] `role` string
  - [ ] `question_number` int
- [ ] System prompt includes:
  - [ ] "Senior technical interviewer with 10+ years experience"
  - [ ] Candidate context (skills, experience level, domains)
- [ ] Returns single contextual question string

**Test**:
```bash
curl -X POST http://localhost:8000/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Backend Engineer",
    "resume_data": {"skills": ["Python"], "experience_level": "senior", "domains": ["Backend"], "projects": [], "summary": "..."}
  }' \
  | jq '.first_question'
```

✅ **Pass**: Question is specific to role/skills, open-ended (not yes/no)

---

### Answer Evaluation (LLaMA 3.3 70B)

**File: engine.py - InterviewEngine class**

- [ ] `evaluate_answer()` method exists
- [ ] Uses `meta-llama/llama-3.3-70b-instruct:free` model
- [ ] Temperature set to 0.4 (fair evaluation)
- [ ] Returns JSON with:
  - [ ] `score` (0-10 integer)
  - [ ] `clarity` (1-5)
  - [ ] `depth` (1-5)
  - [ ] `relevance` (1-5)
  - [ ] `strengths` array
  - [ ] `weaknesses` array
  - [ ] `feedback` string

**Test**:
```bash
curl -X POST http://localhost:8000/interview/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "answer": "I have experience with scaling systems using caching and database optimization."
  }' \
  | jq '.evaluation'
```

✅ **Pass**: Score is 0-10, feedback is constructive and detailed

---

## 🚀 Phase 4: Backend APIs

### API Structure

**File: main.py**

- [ ] FastAPI app initialized
- [ ] CORS middleware added
- [ ] Database initialized on startup
- [ ] All endpoints have proper documentation

---

### CORS Configuration (for Next.js Frontend)

**File: main.py - CORSMiddleware**

- [ ] Allow origins include:
  - [ ] `http://localhost:3000` (primary Next.js dev port)
  - [ ] `http://localhost:3001` (alternative)
  - [ ] `http://127.0.0.1:3000`
  - [ ] `http://127.0.0.1:3001`
- [ ] Allow credentials: True
- [ ] Allow methods: GET, POST, PUT, DELETE, OPTIONS
- [ ] Allow headers: "*"

**Test from browser console** (at localhost:3000):
```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => console.log('✅', d))
  .catch(e => console.error('❌', e))
```

✅ **Pass**: No CORS errors in console

---

### Endpoint: GET /health

**File: main.py**

- [ ] Returns HTTP 200
- [ ] Response schema: `HealthCheckResponse`
- [ ] Returns:
  - [ ] `status`: "healthy"
  - [ ] `service`: "InterviewIQ Backend"
  - [ ] `version`: "1.0.0"

**Test**:
```bash
curl http://localhost:8000/health | jq .
```

---

### Endpoint: POST /upload

**File: main.py**

- [ ] Accepts multipart/form-data with PDF file
- [ ] Response schema: `ResumeAnalysisResponse`
- [ ] Returns:
  - [ ] `status`: "success"
  - [ ] `resume_data`: Full structured data
  - [ ] `file_name`: Original filename
  - [ ] `sections_found`: List of detected sections
- [ ] Validates file type (PDF only)
- [ ] Cleans up temporary files
- [ ] Calls ResumeAnalyzer

**Test**:
```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@resume.pdf" \
  | jq '.status, .resume_data.skills'
```

✅ **Pass**: 
- Status is "success"
- resume_data contains all required fields
- File is processed without errors

---

### Endpoint: POST /interview/start

**File: main.py**

- [ ] Accepts: `StartInterviewRequest(role, resume_data)`
- [ ] Response schema: `StartInterviewResponse`
- [ ] Creates Interview record in database
- [ ] Calls `InterviewEngine.generate_question()`
- [ ] Stores first question in database
- [ ] Returns:
  - [ ] `session_id`: Valid UUID
  - [ ] `role`: Passed role
  - [ ] `first_question`: Generated question
  - [ ] `experience_level`: From resume

**Test**:
```bash
curl -X POST http://localhost:8000/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Senior Backend Engineer",
    "resume_data": {
      "skills": ["Python", "FastAPI"],
      "experience_level": "senior",
      "domains": ["Backend"],
      "projects": ["Project1"],
      "summary": "Experienced engineer"
    }
  }' | jq '.session_id, .first_question'
```

✅ **Pass**:
- session_id is UUID format
- first_question is specific to role
- No API errors

---

### Endpoint: POST /interview/chat

**File: main.py**

- [ ] Accepts: `InterviewChatRequest(session_id, answer)`
- [ ] Response schema: `InterviewChatResponse`
- [ ] Stores user answer in database
- [ ] Calls `InterviewEngine.evaluate_answer()`
- [ ] Stores evaluation in database
- [ ] Generates next question (if not complete)
- [ ] Marks completion at question 5
- [ ] Returns:
  - [ ] `evaluation`: Full evaluation object
  - [ ] `question_number`: Current question count
  - [ ] `is_complete`: Boolean
  - [ ] `next_question`: String (or null if complete)

**Test** (run 5 times with different answers):
```bash
for i in {1..5}; do
  curl -X POST http://localhost:8000/interview/chat \
    -H "Content-Type: application/json" \
    -d "{\"session_id\": \"$SESSION_ID\", \"answer\": \"Answer $i\"}"
done
```

✅ **Pass**:
- First 4 responses have `is_complete: false` and `next_question`
- 5th response has `is_complete: true` and no `next_question`
- Each evaluation has score between 0-10

---

### Endpoint: GET /interview/report/{session_id}

**File: main.py**

- [ ] Accepts session_id as path parameter
- [ ] Response schema: `InterviewReportResponse`
- [ ] Returns:
  - [ ] `session_id`: Matching UUID
  - [ ] `role`: Role from interview
  - [ ] `average_score`: Calculated average (0-10)
  - [ ] `recommendation`: Based on score
    - [ ] ≥ 8.0: "STRONG HIRE"
    - [ ] 6.0-7.9: "HIRE"
    - [ ] 4.0-5.9: "MAYBE"
    - [ ] < 4.0: "NO HIRE"
  - [ ] `strengths`: Array of 1-5 items
  - [ ] `weaknesses`: Array of 1-5 items
  - [ ] `api_calls_used`: 3 (max)

**Test** (after completing 5-question interview):
```bash
curl http://localhost:8000/interview/report/$SESSION_ID | jq .
```

✅ **Pass**:
- Score is valid 0-10
- Recommendation matches score range
- Strengths and weaknesses are present

---

### Endpoint: GET /interviews

**File: main.py**

- [ ] Response schema: `InterviewHistoryResponse`
- [ ] Returns list of interviews
- [ ] Each interview has:
  - [ ] `session_id`
  - [ ] `role`
  - [ ] `created_at` (ISO format)
  - [ ] `score` (average)
  - [ ] `experience_level`

**Test**:
```bash
curl http://localhost:8000/interviews | jq '.interviews[0]'
```

✅ **Pass**: Returns array with interview records

---

## 📦 Type Safety & Validation

### Pydantic Schemas

**File: schemas.py**

- [ ] `HealthCheckResponse` defined
- [ ] `ResumeAnalysisResponse` defined
- [ ] `StartInterviewRequest` defined
- [ ] `StartInterviewResponse` defined
- [ ] `InterviewChatRequest` defined
- [ ] `InterviewChatResponse` defined
- [ ] `InterviewReportResponse` defined
- [ ] `InterviewHistoryResponse` defined
- [ ] `EvaluationData` defined
- [ ] All have Field descriptions
- [ ] All have proper type hints

**Test**: Open http://localhost:8000/docs
- [ ] All endpoints show request/response schemas
- [ ] All fields have descriptions
- [ ] JSON examples appear in dropdown

✅ **Pass**: Swagger UI shows complete schemas

---

## 🗄️ Database Persistence

### SQLite Storage

**Test query**:
```python
python -c "
from database import engine
from models import Interview, Message
from sqlalchemy.orm import Session

with Session(engine) as db:
    interviews = db.query(Interview).all()
    print(f'Interviews: {len(interviews)}')
    if interviews:
        i = interviews[0]
        messages = db.query(Message).filter(Message.interview_id == i.id).all()
        print(f'  - Session: {i.session_id}')
        print(f'  - Role: {i.role}')
        print(f'  - Messages: {len(messages)}')
"
```

✅ **Pass**:
- [ ] Interview records created and persisted
- [ ] Messages associated with interviews
- [ ] Data survives application restart

---

## 🎯 System Prompts & Persona

### Senior Technical Interviewer

**File: engine.py**

- [ ] generate_question() includes:
  - [ ] "senior technical interviewer with 10+ years of experience"
  - [ ] Candidate background context
  - [ ] "Ask one clear, challenging but fair interview question"
  - [ ] "Make it specific to their background and the role"
  - [ ] "Avoid yes/no questions"
  - [ ] "Focus on practical problem-solving or technical depth"

- [ ] evaluate_answer() includes:
  - [ ] "fair but critical" evaluation tone
  - [ ] Considers experience level
  - [ ] Provides constructive feedback

**Test**: Review generated questions and evaluations in Swagger UI
✅ **Pass**: Questions are role-specific, challenging, not robotic

---

## 🚦 Integration Test

Run a complete end-to-end interview:

```bash
# 1. Create sample resume PDF or use existing one
# 2. Start backend: python main.py
# 3. Run test:

python -c "
import requests
import json

BASE = 'http://localhost:8000'

# Upload
with open('resume.pdf', 'rb') as f:
    u = requests.post(f'{BASE}/upload', files={'file': f})
r = u.json()['resume_data']
print(f'✅ Upload: {r.get(\"experience_level\")}')

# Start
s = requests.post(f'{BASE}/interview/start', json={
    'role': 'Backend Engineer',
    'resume_data': r
}).json()
sid = s['session_id']
print(f'✅ Start: {sid[:8]}...')

# Chat x5
for i in range(5):
    c = requests.post(f'{BASE}/interview/chat', json={
        'session_id': sid,
        'answer': f'Great question! I have experience with {i}...'
    }).json()
    print(f'✅ Q{i+1}: Score={c[\"evaluation\"][\"score\"]}, Complete={c[\"is_complete\"]}')

# Report
rep = requests.get(f'{BASE}/interview/report/{sid}').json()
print(f'✅ Report: {rep[\"average_score\"]}/10 - {rep[\"recommendation\"]}')
"
```

✅ **Pass**: All 5 questions answered, report generated without errors

---

## 📊 Performance & Limits

- [ ] Resume analysis: < 15 seconds
- [ ] Question generation: < 25 seconds
- [ ] Chat response: < 40 seconds
- [ ] Full 5-question interview: < 2.5 minutes
- [ ] API calls per session: Exactly 3
  - [ ] 1 Gemini call (resume)
  - [ ] 1 LLaMA call (first question)
  - [ ] 1 LLaMA call (evaluations only, not extra question generation)

---

## 📝 Documentation

- [ ] README.md updated with Phase 3 & 4 status
- [ ] TESTING_GUIDE.md created with step-by-step walkthrough
- [ ] TESTING_SCRIPTS.md created with code examples
- [ ] CORS_SETUP.md created with frontend integration
- [ ] IMPLEMENTATION_SUMMARY.md created with detailed changes
- [ ] All documentation mentions models and system prompts

---

## ✅ Final Verification

Run this complete checklist:

```bash
# 1. Health check
curl http://localhost:8000/health | grep healthy && echo "✅ Health OK"

# 2. Upload works
curl -F "file=@resume.pdf" http://localhost:8000/upload | grep "success" && echo "✅ Upload OK"

# 3. Swagger UI accessible
curl -s http://localhost:8000/docs | grep openapi && echo "✅ Docs OK"

# 4. All endpoints documented
curl -s http://localhost:8000/openapi.json | grep '"paths"' && echo "✅ OpenAPI OK"

# 5. CORS configured
curl -i -X OPTIONS http://localhost:8000/health | grep "Access-Control" && echo "✅ CORS OK"
```

---

## 🎉 Success!

If all items are checked ✅, then:

✅ **Phase 3: AI Engine** - Complete
✅ **Phase 4: Backend APIs** - Complete
✅ **CORS for Frontend** - Configured
✅ **Database** - Persisting data
✅ **Type Safety** - Pydantic validated
✅ **Documentation** - Comprehensive

**Ready to move to Phase 6: Frontend Development** 🚀

---

## Troubleshooting Failed Checks

### API endpoints not responding
- Check backend is running: `python main.py`
- Check port 8000 is available: `lsof -i :8000`

### CORS errors
- Verify frontend will be on `localhost:3000`
- Check CORSMiddleware in main.py
- Restart backend if CORS config changed

### Schema validation errors
- Update endpoint to use proper Request/Response classes
- Import from schemas.py
- Verify field names match response data

### API call errors
- Check OpenRouter API key in .env
- Verify internet connection
- Check OpenRouter status page

---

Keep this checklist handy for verifying the implementation! ✅
