"""
API Endpoint Reference & Testing Guide

Use these examples with curl, Postman, or any HTTP client.
"""

BASE_URL = "http://localhost:8000"

# ==============================================================================
# HEALTH CHECK
# ==============================================================================

HEALTH_CHECK = """
GET /health

Response:
{
  "status": "healthy",
  "service": "InterviewIQ Backend",
  "version": "1.0.0"
}
"""

# ==============================================================================
# RESUME UPLOAD & ANALYSIS (API Call 1/3)
# ==============================================================================

UPLOAD_RESUME = """
POST /upload
Content-Type: multipart/form-data

Body:
- file: (binary) resume.pdf

Example with curl:
curl -X POST -F "file=@resume.pdf" http://localhost:8000/upload

Response:
{
  "status": "success",
  "resume_data": {
    "skills": ["Python", "Java", "AWS", "Docker"],
    "experience_level": "mid",
    "domains": ["Backend", "Cloud", "DevOps"],
    "projects": [
      "Built microservices architecture",
      "Implemented CI/CD pipeline"
    ],
    "summary": "Mid-level backend engineer with 4 years of experience"
  },
  "file_name": "resume.pdf",
  "sections_found": ["skills", "experience", "education", "projects"]
}
"""

# ==============================================================================
# START INTERVIEW SESSION (API Call 2/3)
# ==============================================================================

START_INTERVIEW = """
POST /interview/start
Content-Type: application/json

Request Body:
{
  "role": "Senior Backend Engineer",
  "resume_data": {
    "skills": ["Python", "Java"],
    "experience_level": "mid",
    "domains": ["Backend"],
    "projects": [...],
    "summary": "..."
  }
}

Example with curl:
curl -X POST http://localhost:8000/interview/start \\
  -H "Content-Type: application/json" \\
  -d '{
    "role": "Senior Backend Engineer",
    "resume_data": {
      "skills": ["Python", "Java"],
      "experience_level": "mid",
      "domains": ["Backend"]
    }
  }'

Response:
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "Senior Backend Engineer",
  "first_question": "Tell me about your experience designing scalable backend systems. What architectural patterns have you used?",
  "experience_level": "mid"
}
"""

# ==============================================================================
# INTERVIEW CHAT (API Call 3/3)
# ==============================================================================

CHAT_DURING_INTERVIEW = """
POST /interview/chat
Content-Type: application/json

Request Body:
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "answer": "I've designed several microservices architectures using Python and FastAPI. 
             We implemented service-to-service communication with message queues like RabbitMQ..."
}

Example with curl:
curl -X POST http://localhost:8000/interview/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "answer": "I have experience with microservices..."
  }'

Response:
{
  "evaluation": {
    "score": 8,
    "clarity": 4,
    "depth": 4,
    "relevance": 4,
    "strengths": [
      "Good understanding of microservices",
      "Mentioned specific technologies",
      "Clear explanation of architecture"
    ],
    "weaknesses": [
      "Could discuss security aspects more",
      "No mention of monitoring/observability"
    ],
    "feedback": "Strong answer demonstrating solid architectural knowledge. 
                Consider discussing monitoring and security aspects in future responses."
  },
  "next_question": "You mentioned using RabbitMQ for messaging. 
                     How do you ensure message delivery in failure scenarios?",
  "question_number": 2,
  "is_complete": false
}

Note: Set "is_complete": true after 5 questions. Then call /report endpoint.
"""

# ==============================================================================
# GET INTERVIEW REPORT
# ==============================================================================

GET_REPORT = """
GET /interview/report/{session_id}

Example:
curl http://localhost:8000/interview/report/550e8400-e29b-41d4-a716-446655440000

Response:
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "Senior Backend Engineer",
  "average_score": 7.6,
  "recommendation": "HIRE - Good technical fit with some areas to develop",
  "strengths": [
    "Strong system design knowledge",
    "Good communication skills",
    "Practical implementation experience"
  ],
  "weaknesses": [
    "Limited discussion of edge cases",
    "Could improve on monitoring/observability"
  ],
  "api_calls_used": 3
}
"""

# ==============================================================================
# GET INTERVIEW HISTORY
# ==============================================================================

GET_HISTORY = """
GET /interviews

Example:
curl http://localhost:8000/interviews

Response:
{
  "interviews": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "Senior Backend Engineer",
      "created_at": "2026-03-24T14:30:00",
      "score": 7.6,
      "experience_level": "mid"
    },
    {
      "session_id": "660e8400-e29b-41d4-a716-446655440001",
      "role": "Frontend Engineer",
      "created_at": "2026-03-24T13:15:00",
      "score": 8.2,
      "experience_level": "senior"
    }
  ]
}
"""

# ==============================================================================
# TESTING WORKFLOW
# ==============================================================================

COMPLETE_WORKFLOW = """
1. Start server:
   python backend/main.py

2. Check health:
   curl http://localhost:8000/health

3. Upload resume:
   curl -X POST -F "file=@resume.pdf" http://localhost:8000/upload
   → Note the resume_data from response

4. Start interview:
   curl -X POST http://localhost:8000/interview/start \\
     -H "Content-Type: application/json" \\
     -d '{"role": "Senior Backend Engineer", "resume_data": {...}}'
   → Note the session_id

5. Chat (repeat for 5 questions):
   curl -X POST http://localhost:8000/interview/chat \\
     -H "Content-Type: application/json" \\
     -d '{"session_id": "...", "answer": "My answer..."}'

6. Get report:
   curl http://localhost:8000/interview/report/{session_id}

7. View history:
   curl http://localhost:8000/interviews
"""

# ==============================================================================
# ERROR RESPONSES
# ==============================================================================

ERROR_RESPONSES = """
400 Bad Request:
{
  "detail": "Only PDF files are accepted"
}

404 Not Found:
{
  "detail": "Interview not found"
}

500 Internal Server Error:
{
  "detail": "Resume upload failed: [error details]"
}
"""

# ==============================================================================
# POSTMAN COLLECTION
# ==============================================================================

POSTMAN_COLLECTION = """
Import this as a collection in Postman.

1. Create folder "InterviewIQ Backend"
2. Add these requests:
   - Health Check: GET /health
   - Upload Resume: POST /upload (form-data)
   - Start Interview: POST /interview/start (JSON)
   - Chat: POST /interview/chat (JSON)
   - Get Report: GET /interview/report/{{session_id}}
   - Get History: GET /interviews

3. Set {{base_url}} variable to http://localhost:8000
4. Store session_id in variables after /interview/start
"""

if __name__ == "__main__":
    print("=" * 80)
    print("INTERVIEWIQ API REFERENCE")
    print("=" * 80)
    print("\nBase URL: http://localhost:8000")
    print("Documentation: http://localhost:8000/docs")
    print("\nKey Endpoints:")
    print("1. POST /upload - Parse and analyze resume")
    print("2. POST /interview/start - Initialize interview")
    print("3. POST /interview/chat - Process answers")
    print("4. GET /interview/report/{session_id} - Get results")
    print("5. GET /interviews - View history")
