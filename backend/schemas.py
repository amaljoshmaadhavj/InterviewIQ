"""
Pydantic schemas for request/response validation.

Provides type safety, validation, and auto-generated Swagger documentation.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# ============================================================================
# UPLOAD & RESUME ANALYSIS
# ============================================================================

class ResumeAnalysisResponse(BaseModel):
    """Response schema for /upload endpoint."""
    
    status: str = Field(
        description="Status of the upload (success/error)"
    )
    resume_data: Dict[str, Any] = Field(
        description="Structured resume data with skills, projects, experience level"
    )
    file_name: str = Field(
        description="Original filename of uploaded resume"
    )
    sections_found: List[str] = Field(
        description="List of sections found in the resume"
    )


# ============================================================================
# INTERVIEW MANAGEMENT
# ============================================================================

class StartInterviewRequest(BaseModel):
    """Request schema for /interview/start endpoint."""
    
    role: str = Field(
        ...,
        description="Target job role (e.g., 'Senior Backend Engineer')"
    )
    resume_data: Dict[str, Any] = Field(
        ...,
        description="Structured resume data from analyze_resume (from /upload)"
    )


class StartInterviewResponse(BaseModel):
    """Response schema for /interview/start endpoint."""
    
    session_id: str = Field(
        description="Unique interview session identifier (UUID)"
    )
    role: str = Field(
        description="Target job role"
    )
    first_question: str = Field(
        description="First interview question"
    )
    experience_level: Optional[str] = Field(
        description="Candidate experience level: junior, mid, or senior"
    )


class InterviewChatRequest(BaseModel):
    """Request schema for /interview/chat endpoint."""
    
    session_id: str = Field(
        ...,
        description="Interview session ID from /interview/start"
    )
    answer: str = Field(
        ...,
        description="Candidate's answer to the current question"
    )


class EvaluationData(BaseModel):
    """Evaluation data for a single answer."""
    
    score: int = Field(
        description="Overall score (0-10)"
    )
    clarity: Optional[int] = Field(
        description="Clarity score (1-5)"
    )
    depth: Optional[int] = Field(
        description="Depth score (1-5)"
    )
    relevance: Optional[int] = Field(
        description="Relevance score (1-5)"
    )
    strengths: List[str] = Field(
        description="List of positive points"
    )
    weaknesses: List[str] = Field(
        description="List of areas for improvement"
    )
    feedback: str = Field(
        description="Constructive feedback"
    )


class InterviewChatResponse(BaseModel):
    """Response schema for /interview/chat endpoint."""
    
    evaluation: EvaluationData = Field(
        description="Evaluation of the answer"
    )
    question_number: int = Field(
        description="Total number of questions answered"
    )
    is_complete: bool = Field(
        description="Whether interview is complete"
    )
    next_question: Optional[str] = Field(
        description="Next interview question (if interview not complete)"
    )


# ============================================================================
# REPORTING
# ============================================================================

class InterviewReportResponse(BaseModel):
    """Response schema for /interview/report endpoint."""
    
    session_id: str = Field(
        description="Interview session ID"
    )
    role: str = Field(
        description="Target job role"
    )
    average_score: float = Field(
        description="Average score across all questions (0-10)"
    )
    recommendation: str = Field(
        description="Overall recommendation (STRONG HIRE, HIRE, MAYBE, NO HIRE)"
    )
    strengths: List[str] = Field(
        description="Key strengths demonstrated"
    )
    weaknesses: List[str] = Field(
        description="Key areas for improvement"
    )
    api_calls_used: Optional[int] = Field(
        description="Number of API calls used in this session"
    )


class InterviewHistoryItem(BaseModel):
    """Item in interview history list."""
    
    session_id: str = Field(
        description="Interview session ID"
    )
    role: str = Field(
        description="Target job role"
    )
    created_at: Optional[str] = Field(
        description="Interview start timestamp (ISO format)"
    )
    score: Optional[float] = Field(
        description="Final average score"
    )
    experience_level: Optional[str] = Field(
        description="Candidate's experience level"
    )


class InterviewHistoryResponse(BaseModel):
    """Response schema for /interviews endpoint."""
    
    interviews: List[InterviewHistoryItem] = Field(
        description="List of recent interviews"
    )


# ============================================================================
# HEALTH CHECK
# ============================================================================

class HealthCheckResponse(BaseModel):
    """Response schema for /health endpoint."""
    
    status: str = Field(
        description="Health status (healthy/unhealthy)"
    )
    service: str = Field(
        description="Service name"
    )
    version: str = Field(
        description="API version"
    )
