"""
Database models using SQLAlchemy.

Tables:
- Interviews: Interview session data
- Messages: Chat messages
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Interview(Base):
    """Interview session record."""
    
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)
    experience_level = Column(String)  # junior, mid, senior
    
    # Resume data stored as JSON string
    resume_json = Column(Text)
    
    # Interview metrics
    total_questions = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    recommendation = Column(String)  # STRONG HIRE, HIRE, MAYBE, NO HIRE
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    messages = relationship("Message", back_populates="interview", cascade="delete")
    
    def __repr__(self):
        return f"<Interview(session_id={self.session_id}, role={self.role})>"


class Message(Base):
    """Chat message record."""
    
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False, index=True)
    
    # Message metadata
    message_type = Column(String)  # "question", "answer", "evaluation"
    sender = Column(String, nullable=False)  # "ai" or "user"
    
    # Content
    content = Column(Text, nullable=False)
    
    # Optional evaluation data (stored as JSON string)
    evaluation_json = Column(Text, nullable=True)
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    interview = relationship("Interview", back_populates="messages")
    
    def __repr__(self):
        return f"<Message(interview_id={self.interview_id}, sender={self.sender})>"


class InterviewReport(Base):
    """Final interview report/summary."""
    
    __tablename__ = "interview_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), unique=True, nullable=False)
    
    # Report data
    average_score = Column(Float)
    scores = Column(Text)  # JSON array of individual scores
    
    strengths = Column(Text)  # JSON array
    weaknesses = Column(Text)  # JSON array
    
    recommendation = Column(String)
    feedback = Column(Text)
    
    # API usage tracking
    api_calls_used = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<InterviewReport(interview_id={self.interview_id}, score={self.average_score})>"
