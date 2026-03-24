# CORS Configuration for Next.js Frontend

## Overview

The InterviewIQ backend is now configured to accept requests from the Next.js frontend running on `localhost:3000`.

## Current CORS Setup ✅

```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js frontend (dev)
        "http://localhost:3001",  # Alternative port
        "http://127.0.0.1:3000",  # Localhost IPv4
        "http://127.0.0.1:3001",  # Alternative IPv4
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

## Allowed Methods

✅ GET - Fetch data (reports, history)
✅ POST - Submit data (upload, chat, start interview)
✅ PUT - Update data (future)
✅ DELETE - Delete data (future)
✅ OPTIONS - CORS preflight

## Frontend Integration Example

### Example: Upload Resume from Next.js

```javascript
// app/page.js or any Next.js component
'use client'

import { useState } from 'react'

export default function UploadResume() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resumeData, setResumeData] = useState(null)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      // This will work because of CORS setup
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
        // credentials: 'include' not needed for this endpoint
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      setResumeData(data.resume_data)
      console.log('Resume analyzed:', data)

    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Resume'}
      </button>
      
      {resumeData && (
        <div>
          <h3>Resume Analyzed</h3>
          <p>Skills: {resumeData.skills.join(', ')}</p>
          <p>Experience: {resumeData.experience_level}</p>
          <p>Domains: {resumeData.domains.join(', ')}</p>
        </div>
      )}
    </form>
  )
}
```

### Example: Start Interview

```javascript
'use client'

import { useState } from 'react'

export default function StartInterview({ resumeData }) {
  const [sessionId, setSessionId] = useState(null)
  const [firstQuestion, setFirstQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // CORS headers are automatic for simple requests
        },
        body: JSON.stringify({
          role: 'Senior Backend Engineer',
          resume_data: resumeData,
        }),
      })

      const data = await response.json()
      setSessionId(data.session_id)
      setFirstQuestion(data.first_question)

    } catch (error) {
      console.error('Interview start error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleStart} disabled={loading}>
        {loading ? 'Starting...' : 'Start Interview'}
      </button>
      
      {firstQuestion && (
        <div>
          <h3>Question 1</h3>
          <p>{firstQuestion}</p>
          <p>Session ID: {sessionId}</p>
        </div>
      )}
    </div>
  )
}
```

### Example: Chat with Interview

```javascript
'use client'

import { useState } from 'react'

export default function InterviewChat({ sessionId }) {
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [nextQuestion, setNextQuestion] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmitAnswer = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/interview/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          answer: answer,
        }),
      })

      const data = await response.json()
      setEvaluation(data.evaluation)
      setNextQuestion(data.next_question || '')
      setIsComplete(data.is_complete)
      setAnswer('') // Clear input

    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Enter your answer..."
        rows={5}
      />
      
      <button onClick={handleSubmitAnswer} disabled={loading}>
        {loading ? 'Evaluating...' : 'Submit Answer'}
      </button>

      {evaluation && (
        <div>
          <h4>Score: {evaluation.score}/10</h4>
          <p><strong>Feedback:</strong> {evaluation.feedback}</p>
          <ul>
            <li><strong>Strengths:</strong> {evaluation.strengths.join(', ')}</li>
            <li><strong>Areas to improve:</strong> {evaluation.weaknesses.join(', ')}</li>
          </ul>
        </div>
      )}

      {!isComplete && nextQuestion && (
        <h3>{nextQuestion}</h3>
      )}

      {isComplete && (
        <p><strong>Interview Complete!</strong></p>
      )}
    </div>
  )
}
```

### Example: Get Final Report

```javascript
'use client'

import { useState, useEffect } from 'react'

export default function InterviewReport({ sessionId }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/interview/report/${sessionId}`
        )
        const data = await response.json()
        setReport(data)
      } catch (error) {
        console.error('Report error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [sessionId])

  if (loading) return <p>Loading report...</p>

  if (!report) return <p>No report found</p>

  return (
    <div>
      <h2>Interview Report</h2>
      
      <div className="score-card">
        <h3>{report.role}</h3>
        <p className="large-score">{report.average_score}/10</p>
        <p className={`recommendation ${report.recommendation.includes('STRONG') ? 'strong-hire' : ''}`}>
          {report.recommendation}
        </p>
      </div>

      <div>
        <h4>Strengths</h4>
        <ul>
          {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      <div>
        <h4>Areas to Improve</h4>
        <ul>
          {report.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>

      <p className="api-info">API calls used: {report.api_calls_used}/3</p>
    </div>
  )
}
```

## Testing CORS from Browser Console

Open browser DevTools (F12) and run:

```javascript
// Test if CORS is working
fetch('http://localhost:8000/health')
  .then(res => res.json())
  .then(data => console.log('✅ CORS working:', data))
  .catch(err => console.error('❌ CORS error:', err))
```

✅ Expected output:
```
✅ CORS working: {status: 'healthy', service: 'InterviewIQ Backend', version: '1.0.0'}
```

❌ If you see CORS errors, verify:
1. Backend is running on `http://localhost:8000`
2. Frontend is on `http://localhost:3000`
3. Restart backend after changing CORS config

## Deployment Considerations

For production deployment, update CORS to use actual domain:

```python
# production config
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://interviewiq.example.com",
        "https://www.interviewiq.example.com",
    ],
    # ... rest of config
)
```

## Troubleshooting CORS Issues

### Problem: CORS error in browser console

```
Access to XMLHttpRequest at 'http://localhost:8000/upload' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Solutions**:
1. ✅ Ensure backend is running: `python main.py`
2. ✅ Verify frontend is on `localhost:3000` (not 3001 or different port)
3. ✅ Check backend CORS config includes `localhost:3000`
4. ✅ Restart backend after config changes

### Problem: 404 endpoint errors

Backend might not be running or endpoint path is wrong.

```javascript
// ❌ Wrong
fetch('http://localhost:3000/upload', ...)  // Frontend port!

// ✅ Correct
fetch('http://localhost:8000/upload', ...)  // Backend port!
```

### Problem: Large file uploads fail

If uploading large resumes, increase FastAPI limits:

```python
# backend/main.py
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError

# Increase max upload size to 10MB
app = FastAPI()

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    # Existing code
    pass
```

## Environment Variables

Make sure `.env` has:

```bash
OPENROUTER_API_KEY=your_actual_key
DATABASE_URL=sqlite:///./interviewiq.db
API_HOST=0.0.0.0
API_PORT=8000
```

## Running Backend for Frontend Development

```bash
# Terminal 1: Start backend
cd backend
python main.py

# Terminal 2: Start Next.js frontend
cd frontend
npm run dev
```

Both servers will run simultaneously:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Swagger UI: http://localhost:8000/docs

---

## Next Steps for Phase 6 (Frontend Development)

1. Create Next.js project: `npx create-next-app@latest frontend`
2. Install UI dependencies: `npm install tailwindcss autoprefixer`
3. Create components for:
   - Resume upload
   - Interview chat interface
   - Interview report display
   - Interview history dashboard
4. Integrate with backend API (using fetch or axios)
5. Handle CORS automatically (no need for proxy in dev!)

The CORS is now **production-ready** for the Next.js frontend! ✅
