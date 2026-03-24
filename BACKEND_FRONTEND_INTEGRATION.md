# InterviewIQ - Backend/Frontend Integration Reference

## 🔗 API Contract & Integration Points

This document specifies the exact contract between frontend and backend, including request/response schemas.

---

## 📡 Endpoint Reference

### 1. GET `/health`

**Purpose**: Health check for backend connectivity

**Frontend Call:**
```typescript
const response = await api.health();
```

**Response:**
```json
{
  "status": "operational",
  "timestamp": "2024-01-15T10:30:00"
}
```

**Status Code**: 200

**Error Handling**: Network error indicates backend down

---

### 2. POST `/upload`

**Purpose**: Upload and analyze resume PDF

**Frontend Call:**
```typescript
const formData = new FormData();
formData.append('file', pdfFile);
const response = await api.uploadResume(formData);
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: PDF file (max 10MB)

**Response:**
```json
{
  "session_id": "uuid-string",
  "resume_data": {
    "skills": ["Python", "FastAPI", "React"],
    "experience": "5 years in backend development",
    "education": "B.Tech Computer Science",
    "summary": "Full analysis here..."
  }
}
```

**Status Code**: 200

**Errors**:
- 400: Invalid file format (not PDF)
- 413: File too large (>10MB)

**Backend Process:**
1. Validate PDF format
2. Extract text from PDF
3. Call Gemini API for analysis
4. Parse JSON response
5. Store in context

---

### 3. POST `/interview/start`

**Purpose**: Create new interview session and fetch first question

**Frontend Call:**
```typescript
const response = await api.startInterview({
  role: 'Backend Engineer',
  resume_data: state.resumeData,
});
```

**Request:**
```json
{
  "role": "Backend Engineer",
  "resume_data": {
    "skills": ["Python", "FastAPI"],
    "experience": "5 years",
    "education": "B.Tech",
    "summary": "..."
  }
}
```

**Response:**
```json
{
  "session_id": "unique-session-uuid",
  "first_question": "Tell me about your experience with database design...",
  "question_number": 1
}
```

**Status Code**: 201

**Backend Process:**
1. Create Interview record in DB
2. Generate session_id (UUID4)
3. Call LLaMA to generate Q1
4. Store Q1 in database
5. Return session_id + question

**Context State Updated:**
- `sessionId`: Set to new session_id
- `selectedRole`: Set to selected role
- `currentQuestion`: Set to first_question

---

### 4. POST `/interview/chat`

**Purpose**: Submit answer, get evaluation, and next question

**Frontend Call:**
```typescript
const response = await api.submitAnswer({
  session_id: state.sessionId,
  answer: 'My approach would be...',
});
```

**Request:**
```json
{
  "session_id": "session-uuid",
  "answer": "User's answer to current question"
}
```

**Response:**
```json
{
  "session_id": "session-uuid",
  "question_number": 1,
  "evaluation": {
    "score": 7,
    "feedback": "Good understanding of fundamentals...",
    "clarity": 4,
    "depth": 3,
    "relevance": 4,
    "strengths": [
      "Clear explanation of concept",
      "Provided concrete example"
    ],
    "weaknesses": [
      "Missing consideration of edge cases",
      "No mention of performance implications"
    ]
  },
  "is_complete": false,
  "next_question": "How would you handle concurrent requests...",
  "question_number": 2
}
```

**Status Code**: 200

**Backend Process:**
1. Fetch interview session from DB
2. Store user answer in Message table
3. Call LLaMA to evaluate (structured JSON parsing)
4. Calculate scores (clarity, depth, relevance)
5. Generate next question (or mark complete)
6. Store evaluation in database
7. Return evaluation + next question

**Context State Updated:**
- `chatHistory`: Append answer + evaluation + next question
- `currentQuestion`: Set to next_question
- Update score tracking for report

---

### 5. GET `/interview/report/{session_id}`

**Purpose**: Fetch complete interview report with all evaluations

**Frontend Call:**
```typescript
const report = await api.getReport(sessionId);
```

**Request URL**: `GET /interview/report/session-uuid`

**Response:**
```json
{
  "session_id": "session-uuid",
  "role": "Backend Engineer",
  "created_at": "2024-01-15T10:30:00",
  "overall_score": 34,
  "total_questions": 5,
  "recommendation": "Good performance. Continue practicing system design patterns.",
  "evaluations": [
    {
      "question": "Tell me about database design...",
      "answer": "User's answer",
      "score": 7,
      "feedback": "Good understanding...",
      "clarity": 4,
      "depth": 3,
      "relevance": 4,
      "strengths": ["Clear explanation"],
      "weaknesses": ["Missing edge cases"]
    },
    // ... 4 more evaluations
  ]
}
```

**Status Code**: 200

**Errors**:
- 404: Session not found

**Backend Process:**
1. Fetch Interview + Messages from DB
2. Aggregate evaluation scores
3. Generate recommendation based on avg score
4. Format response with all feedback
5. Return complete report

**Frontend Display:**
- Overall score: 34/50 (displayed with color coding)
- 5 question cards with score, feedback, metrics
- Recommendation text
- Strengths/weaknesses bullets

---

### 6. GET `/interviews`

**Purpose**: Fetch interview history (for history page)

**Frontend Call:**
```typescript
const history = await api.getInterviewHistory();
```

**Request URL**: `GET /interviews`

**Response:**
```json
[
  {
    "session_id": "session-uuid-1",
    "role": "Backend Engineer",
    "created_at": "2024-01-15T10:30:00",
    "score": 7
  },
  {
    "session_id": "session-uuid-2",
    "role": "Frontend Engineer",
    "created_at": "2024-01-14T14:20:00",
    "score": 8
  }
  // ... more interviews
]
```

**Status Code**: 200

**Backend Process:**
1. Query Interview table, order by created_at DESC
2. Limit to recent 20 interviews
3. Calculate average score per interview
4. Return list

**Frontend Display:**
- List of interview cards
- Role, score, date
- Click to view full report
- Performance bar (score/10)

---

## 📊 Database Schema

### Interview Table
```sql
CREATE TABLE interview (
  id INTEGER PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'  -- 'active', 'completed'
);
```

### Message Table
```sql
CREATE TABLE message (
  id INTEGER PRIMARY KEY,
  session_id TEXT FOREIGN KEY,
  question TEXT NOT NULL,
  answer TEXT,
  role TEXT NOT NULL,  -- 'question', 'answer', 'evaluation'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### InterviewReport Table
```sql
CREATE TABLE interview_report (
  id INTEGER PRIMARY KEY,
  session_id TEXT UNIQUE FOREIGN KEY,
  overall_score FLOAT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Data Flow Diagrams

### Resume Upload Flow
```
Frontend Upload
    ↓
PDF File + UploadZone.tsx
    ↓
api.uploadResume(file)
    ↓
Backend /upload POST
    ↓
PDF Parsing + Gemini Analysis
    ↓
ResumeData JSON
    ↓
Return to Frontend
    ↓
AppContext.setResumeData()
    ↓
Redirect /role-selection
```

### Interview Flow
```
RoleSelector Click
    ↓
api.startInterview(role, resume)
    ↓
Backend /interview/start POST
    ↓
Create Interview Record
    ↓
Generate Q1 via LLaMA
    ↓
Return session_id + Q1
    ↓
AppContext.setSessionId()
    ↓
Redirect /interview
    ↓
ChatInterface Display Q1
    ↓
User Types Answer
    ↓
api.submitAnswer(session_id, answer)
    ↓
Backend /interview/chat POST
    ↓
Evaluate Answer + Generate Q2
    ↓
Return Evaluation + Q2
    ↓
ChatInterface Display Feedback
    ↓
Repeat for Q3-Q5
    ↓
is_complete: true
    ↓
Show "View Report" Button
    ↓
api.getReport(session_id)
    ↓
Backend /interview/report GET
    ↓
Aggregate All Evaluations
    ↓
Display Report Page
```

---

## 🎯 Error Handling Contract

### Frontend Error Types
```typescript
interface APIError {
  message: string;
  status: number;
  type: 'network' | 'validation' | 'server' | 'unknown';
}
```

### Backend Error Responses

**400 - Bad Request**
```json
{
  "detail": "Invalid role provided"
}
```

**413 - Payload Too Large**
```json
{
  "detail": "File size exceeds 10MB limit"
}
```

**422 - Unprocessable Entity**
```json
{
  "detail": [
    {
      "loc": ["body", "role"],
      "msg": "Field required",
      "type": "value_error.missing"
    }
  ]
}
```

**500 - Server Error**
```json
{
  "detail": "Internal server error"
}
```

### Frontend Error Messages
- **Network Error**: "Unable to connect to server. Please check your internet connection."
- **Validation Error**: "Please check your input: {field} is invalid"
- **Server Error**: "Server error (500). Please try again later."
- **Unknown Error**: "An unexpected error occurred. Please refresh the page."

---

## ✅ Integration Checklist

### Pre-Integration
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] CORS enabled in backend
- [ ] Environment variables set (OPENROUTER_API_KEY)
- [ ] Database file created (interviews.db)

### Upload Functionality
- [ ] PDF upload works end-to-end
- [ ] Gemini analysis produces valid JSON
- [ ] ResumeData stored in context
- [ ] Auto-redirect to role selection

### Interview Start
- [ ] Role selection page shows all 8 roles
- [ ] Start Interview calls backend
- [ ] Session created in database
- [ ] First question generated
- [ ] ChatInterface displays question

### Interview Chat
- [ ] User can type answer
- [ ] Submit works (Enter key + button)
- [ ] Evaluation displays correctly
- [ ] Next question appears
- [ ] Message history tracks conversation

### Report Generation
- [ ] After 5 questions, completion detected
- [ ] Report page loads
- [ ] All 5 evaluations display
- [ ] Scores calculated correctly
- [ ] Recommendation generates

### History
- [ ] History page loads interviews
- [ ] Performance bars display
- [ ] Can click to view report
- [ ] Empty state shows when no data

---

## 🔐 Authentication & Security Notes

**Current Implementation:**
- No user authentication (stateless sessions)
- Sessions tracked via UUID4 in session_id
- No API key validation on frontend

**Future Enhancements:**
- Add user auth (JWT tokens)
- Store user scores history
- Rate limiting on API calls
- Input sanitization for all fields

---

## 📈 Performance Considerations

### Frontend
- Next.js automatically optimizes bundle size
- Framer Motion animations hardware-accelerated
- Lazy load components where possible

### Backend
- SQLite suitable for <1000 concurrent users
- Consider PostgreSQL for scale
- Cache Gemini analysis results
- Rate limit to 3 API calls per session

### Optimization Opportunities
- Frontend code splitting by route
- Backend query optimization
- Database indexing on session_id, created_at
- Redis caching layer
- CDN for static assets

---

## 🧪 Testing Integration Points

### Manual Testing

**Test 1: Full Happy Path**
1. Start both servers
2. Upload resume
3. Select role
4. Complete 5 questions
5. View report
6. Verify all data displays correctly

**Test 2: Error Handling**
1. Disconnect backend
2. Try upload (should show error)
3. Restart backend
4. Retry (should work)

**Test 3: Data Persistence**
1. Complete interview
2. Reload page
3. Go to /history
4. Should show completed interview

### API Testing (Postman)

Create collection with all 6 endpoints:
1. Test each endpoint individually
2. Test error scenarios (invalid role, missing fields)
3. Test large payloads
4. Verify response times

---

## 📝 Version History

**v1.0.0 - Complete Integration**
- ✅ All 6 endpoints implemented
- ✅ Frontend fully integrated
- ✅ Error handling complete
- ✅ Database persistence
- ✅ AI evaluation working

---

## 🔗 Related Documentation

- Backend: `backend/README.md`
- Frontend: `frontend/FRONTEND_COMPLETE.md`
- Setup Guide: `COMPLETE_SETUP_GUIDE.md`
- API Swagger: http://localhost:8000/docs

---

**Last Updated**: 2024  
**Maintainers**: InterviewIQ Team  
**Status**: ✅ Production Ready
