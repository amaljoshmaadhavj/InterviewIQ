"""
Configuration management for backend services.

Loads environment variables and provides centralized config.
"""

import os
from pathlib import Path
from dotenv import load_dotenv


# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)


class Config:
    """Application configuration."""

    # API Keys
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
    
    # Models (OpenRouter - updated model IDs)
    # Note: Check https://openrouter.ai/models for available models
    RESUME_ANALYSIS_MODEL = "google/gemini-2.0-flash"
    INTERVIEW_MODEL = "meta-llama/llama-3.3-70b-instruct"
    
    # OpenRouter Settings
    OPENROUTER_API_URL = "https://openrouter.ai/api/v1"
    OPENROUTER_APP_NAME = "InterviewIQ"
    OPENROUTER_APP_URL = "http://localhost:3000"
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./interviewiq.db")
    
    # API Settings
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", 8000))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # Interview Settings
    MAX_API_CALLS_PER_SESSION = 3
    MAX_QUESTIONS = 5
    INTERVIEW_TIMEOUT = 3600  # 1 hour in seconds


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


def get_config():
    """Get appropriate config based on environment."""
    env = os.getenv("ENVIRONMENT", "development").lower()
    if env == "production":
        return ProductionConfig()
    return DevelopmentConfig()
