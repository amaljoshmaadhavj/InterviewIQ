# Project Context: InterviewIQ

## Overview
InterviewIQ is an AI-powered mock interview platform that generates personalized, resume-aware interview experiences. Users upload a PDF resume, select a target role, and interact with an AI interviewer that asks adaptive, role-specific questions.

## Target Users
- Students preparing for placements
- Job seekers preparing for interviews

## Core Tech Stack
- Frontend: Next.js (App Router) + Tailwind CSS
- Backend: FastAPI (Python 3.12+)
- AI Layer: OpenRouter API (Free Tier)

## Models (via OpenRouter)
- google/gemini-2.0-flash:free → Resume understanding & structuring
- meta-llama/llama-3.3-70b-instruct:free → Interview generation & evaluation

## Supporting Tools
- PDF Processing: PyMuPDF
- Database: SQLite

## Core Features
1. Resume parsing and structured extraction (skills, projects, experience)
2. Role-based interview question generation
3. One-question-at-a-time interview simulation
4. Follow-up questions based on user responses
5. Final evaluation report (score, strengths, weaknesses)
6. Interview history tracking (dashboard-ready)

## Key Constraints
- Only OpenRouter free models must be used
- API calls must be minimized (max 2–3 per session)
- System must be responsive and low-latency

## AI Persona
The AI acts as a:
"Senior Technical Interviewer with 10+ years experience"

Tone:
- Professional
- Slightly challenging
- Realistic (not robotic)