# System Architecture: InterviewIQ
## 1. PDF Processing Layer
File: parser.py

Responsibilities:
- Extract raw text from PDF using PyMuPDF
- Clean formatting issues (line breaks, multi-column text)
- Identify key sections:
  - Skills
  - Projects
  - Education

Output:
- Clean text string


## 2. Resume Understanding Layer (LLM - Gemini Flash)

Function: analyze_resume()

Input:
- Extracted resume text

Process:
- Send text to OpenRouter (Gemini Flash)
- Convert into structured JSON:

{
  "skills": [],
  "projects": [],
  "experience_level": "",
  "domains": []
}

Reason:
- Fast and cost-efficient structured extraction


## 3. Interview Engine (LLM - LLaMA 3.3 70B)

Function: generate_question()

Input:
- Resume JSON
- Role
- Chat history

Output:
- One interview question at a time

Logic:
- Adaptive questioning
- Follow-up generation
- Difficulty adjustment


## 4. Evaluation Engine (LLM - LLaMA)

Function: evaluate_interview()

Input:
- Questions + answers

Output:
- Score (0–10)
- Strengths
- Weaknesses
- Suggestions


## 5. API Layer (FastAPI)

Endpoints:

### POST /upload
- Accepts PDF
- Calls parser + Gemini
- Returns structured resume JSON

### POST /interview/start
- Initializes interview session
- Stores role + resume

### POST /interview/chat
- Input: user answer
- Output: next question

### GET /interview/report/{id}
- Returns evaluation report


## 6. Database Layer (SQLite + SQLAlchemy)

Tables:

### interviews
- id
- role
- created_at
- score

### messages
- id
- interview_id
- sender (AI/User)
- content
- timestamp


## 7. OpenRouter Integration

Headers:
- Authorization: Bearer OPENROUTER_API_KEY
- HTTP-Referer: your-app-url
- X-Title: InterviewIQ

Optimization Strategy:
- 1 call → resume analysis
- 1 call → interview session
- 1 call → evaluation

Max: 3 API calls per session


## 8. Frontend Layer (Next.js)

Pages:
- Upload page
- Interview chat interface
- Dashboard (history + scores)

Components:
- Chat bubbles
- Timer
- Progress tracker