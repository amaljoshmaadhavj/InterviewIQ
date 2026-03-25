"""
FastAPI Backend Application for InterviewIQ

Main entry point with all API endpoints.
"""

import logging
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid
import json
import tempfile
from pathlib import Path

from config import Config
from database import init_db, get_db
from parser import parse_resume
from engine import ResumeAnalyzer, InterviewEngine, OpenRouterClient
from models import Interview, Message, InterviewReport
from schemas import (
    StartInterviewRequest,
    StartInterviewResponse,
    InterviewChatRequest,
    InterviewChatResponse,
    InterviewReportResponse,
    InterviewHistoryResponse,
    HealthCheckResponse,
    ResumeAnalysisResponse,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="InterviewIQ API",
    description="AI-powered mock interview platform",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js frontend (dev)
        "http://localhost:3001",  # Alternative frontend port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database when server starts."""
    logger.info("InterviewIQ Backend starting...")
    init_db()
    logger.info("API ready to serve requests")


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "InterviewIQ Backend",
        "version": "1.0.0"
    }


# ============================================================================
# RESUME UPLOAD & ANALYSIS
# ============================================================================

@app.post("/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload and analyze resume PDF using Gemini Flash.
    
    - **file**: PDF resume file (multipart/form-data)
    
    Returns structured resume data with:
    - skills: List of technical skills
    - projects: List of projects
    - experience_level: junior, mid, or senior
    - domains: Technical domains
    - summary: One-line professional summary
    
    Note: Uses Gemini 2.0 Flash for fast resume parsing
    """
    try:
        # Validate file type
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted")
        
        logger.info(f"Processing resume upload: {file.filename}")
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            # Step 1: Parse PDF
            logger.info("Parsing resume PDF")
            parse_result = parse_resume(tmp_path)
            
            if parse_result["status"] != "success":
                raise HTTPException(status_code=400, detail=parse_result.get("error"))
            
            # Step 2: Analyze with Gemini (API call 1/3)
            logger.info("Analyzing resume with Gemini Flash")
            analyzer = ResumeAnalyzer()
            resume_data = analyzer.analyze_resume(parse_result["full_text"])
            
            logger.info(f"Resume data keys: {resume_data.keys()}")
            logger.info(f"Resume data: {resume_data}")
            
            response = {
                "status": "success",
                "resume_data": resume_data,
                "file_name": file.filename,
                "sections_found": parse_result.get("sections_found", [])
            }
            
            logger.info(f"Preparing response: {response}")
            logger.info(f"Resume analysis successful for {file.filename}")
            return response
            
        finally:
            # Clean up temporary file
            Path(tmp_path).unlink(missing_ok=True)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# INTERVIEW SESSION
# ============================================================================

@app.post("/interview/start", response_model=StartInterviewResponse)
async def start_interview(
    request_data: StartInterviewRequest,
    db: Session = Depends(get_db)
):
    """
    Initialize interview session with resume data and target role.
    
    - **role**: Target job role (e.g., 'Senior Backend Engineer')
    - **resume_data**: Structured resume from /upload endpoint
    
    Returns first interview question and session ID for subsequent requests.
    
    Note: Uses LLaMA 3.3 70B to generate interview questions
    """
    try:
        role = request_data.role
        resume_data = request_data.resume_data
        
        logger.info(f"Starting interview for role: {role}")
        
        # Create session ID
        session_id = str(uuid.uuid4())
        
        # Create database record
        interview = Interview(
            session_id=session_id,
            role=role,
            experience_level=resume_data.get("experience_level"),
            resume_json=json.dumps(resume_data)
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        
        # Generate first question (API call 2/3)
        logger.info("Generating first interview question")
        engine = InterviewEngine()
        first_question = engine.generate_question(resume_data, role, question_number=1)
        
        # Store question in database
        msg = Message(
            interview_id=interview.id,
            message_type="question",
            sender="ai",
            content=first_question
        )
        db.add(msg)
        db.commit()
        
        response = {
            "session_id": session_id,
            "role": role,
            "first_question": first_question,
            "experience_level": resume_data.get("experience_level")
        }
        
        logger.info(f"Interview session created: {session_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Interview start failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/interview/chat", response_model=InterviewChatResponse)
async def interview_chat(
    request_data: InterviewChatRequest,
    db: Session = Depends(get_db)
):
    """
    Submit interview answer and receive evaluation + next question.
    
    - **session_id**: Interview session ID from /interview/start
    - **answer**: Candidate's answer to current question
    
    Returns:
    - evaluation: Score (0-10) with strengths/weaknesses/feedback
    - next_question: Next interview question (if interview not complete)
    - is_complete: Whether all questions answered (max 5)
    - question_number: Total questions answered
    
    Note: Always uses LLaMA 3.3 70B for consistent evaluation
    """
    try:
        session_id = request_data.session_id
        answer = request_data.answer
        
        logger.info(f"Processing chat for session: {session_id}")
        
        # Get interview
        interview = db.query(Interview).filter(Interview.session_id == session_id).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Parse resume data
        resume_data = json.loads(interview.resume_json)
        engine = InterviewEngine()
        
        # Get previous messages for context
        previous_messages = db.query(Message).filter(
            Message.interview_id == interview.id
        ).all()
        
        # Find the last question
        last_question = None
        for msg in reversed(previous_messages):
            if msg.message_type == "question":
                last_question = msg.content
                break
        
        if not last_question:
            raise HTTPException(status_code=400, detail="No question found")
        
        # Store user answer
        answer_msg = Message(
            interview_id=interview.id,
            message_type="answer",
            sender="user",
            content=answer
        )
        db.add(answer_msg)
        db.commit()
        
        # Evaluate answer (API call 3/3 final)
        logger.info("Evaluating interview answer")
        evaluation = engine.evaluate_answer(
            last_question,
            answer,
            resume_data,
            interview.role
        )
        
        # Store evaluation
        eval_msg = Message(
            interview_id=interview.id,
            message_type="evaluation",
            sender="ai",
            content=f"Score: {evaluation.get('score', 'N/A')}",
            evaluation_json=json.dumps(evaluation)
        )
        db.add(eval_msg)
        
        # Count questions answered
        question_count = len([
            m for m in previous_messages if m.message_type == "question"
        ]) + 1  # Include current
        
        is_complete = question_count >= Config.MAX_QUESTIONS
        
        next_question = None
        
        if not is_complete:
            # Generate next question
            next_question = engine.generate_question(
                resume_data,
                interview.role,
                chat_history=previous_messages,
                question_number=question_count + 1
            )
            
            next_msg = Message(
                interview_id=interview.id,
                message_type="question",
                sender="ai",
                content=next_question
            )
            db.add(next_msg)
        else:
            # Interview complete - mark completion time
            interview.completed_at = datetime.utcnow()
        
        response_data = {
            "evaluation": evaluation,
            "question_number": question_count,
            "is_complete": is_complete,
            "next_question": next_question
        }
        
        db.commit()
        logger.info(f"Chat processed for session {session_id}")
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat processing failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# REPORT & HISTORY
# ============================================================================

@app.get("/interview/report/{session_id}", response_model=InterviewReportResponse)
async def get_report(session_id: str, db: Session = Depends(get_db)):
    """
    Get interview report after completion.
    
    - **session_id**: Interview session ID from /interview/start
    
    Returns:
    - average_score: Average interview score (0-10)
    - recommendation: Overall recommendation (STRONG HIRE, HIRE, MAYBE, NO HIRE)
    - strengths: Key strengths demonstrated
    - weaknesses: Areas for improvement
    - api_calls_used: Number of API calls (max 3)
    """
    try:
        logger.info(f"Fetching report for session: {session_id}")
        
        interview = db.query(Interview).filter(Interview.session_id == session_id).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Check if interview report exists
        report = db.query(InterviewReport).filter(
            InterviewReport.interview_id == interview.id
        ).first()
        
        if report:
            return {
                "session_id": session_id,
                "role": interview.role,
                "average_score": report.average_score,
                "recommendation": report.recommendation,
                "strengths": json.loads(report.strengths) if report.strengths else [],
                "weaknesses": json.loads(report.weaknesses) if report.weaknesses else [],
                "api_calls_used": report.api_calls_used
            }
        
        # Generate report from messages
        messages = db.query(Message).filter(Message.interview_id == interview.id).all()
        
        evaluations = [
            json.loads(m.evaluation_json) if m.evaluation_json else {}
            for m in messages if m.message_type == "evaluation"
        ]
        
        if not evaluations:
            raise HTTPException(status_code=400, detail="Interview not yet complete")
        
        scores = [e.get('score', 5) for e in evaluations]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Collect strengths and weaknesses
        all_strengths = []
        all_weaknesses = []
        for eval_item in evaluations:
            all_strengths.extend(eval_item.get('strengths', []))
            all_weaknesses.extend(eval_item.get('weaknesses', []))
        
        # Generate recommendation
        if avg_score >= 8:
            recommendation = "STRONG HIRE - Excellent fit for the role"
        elif avg_score >= 6:
            recommendation = "HIRE - Good technical fit with some areas to develop"
        elif avg_score >= 4:
            recommendation = "MAYBE - Needs improvement in key areas"
        else:
            recommendation = "NO HIRE - Significant gaps in required skills"
        
        # Create report
        report_data = {
            "session_id": session_id,
            "role": interview.role,
            "average_score": round(avg_score, 1),
            "recommendation": recommendation,
            "strengths": list(dict.fromkeys(all_strengths))[:5],  # Remove duplicates
            "weaknesses": list(dict.fromkeys(all_weaknesses))[:5],  # Remove duplicates
            "api_calls_used": 3  # Always 3 for complete session
        }
        
        logger.info(f"Report retrieved for session {session_id}")
        return report_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Report retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/interviews", response_model=InterviewHistoryResponse)
async def get_interview_history(db: Session = Depends(get_db)):
    """
    Get interview history for dashboard.
    
    Returns list of recent interviews with summary data.
    Useful for building a dashboard showing past interview sessions.
    """
    try:
        interviews = db.query(Interview).order_by(Interview.created_at.desc()).limit(50).all()
        
        history = [
            {
                "session_id": i.session_id,
                "role": i.role,
                "created_at": i.created_at.isoformat() if i.created_at else None,
                "score": i.average_score,
                "experience_level": i.experience_level
            }
            for i in interviews
        ]
        
        return {"interviews": history}
        
    except Exception as e:
        logger.error(f"History retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    logger.info(
        f"Starting InterviewIQ Backend on {Config.API_HOST}:{Config.API_PORT}"
    )
    
    uvicorn.run(
        "main:app",
        host=Config.API_HOST,
        port=Config.API_PORT,
        reload=Config.DEBUG,
        log_level="info"
    )
