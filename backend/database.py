"""
Database configuration and session management.

Handles SQLite connection, session creation, and initialization.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from config import Config
from models import Base
import logging

logger = logging.getLogger(__name__)

# Create engine
engine = create_engine(
    Config.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite
    echo=Config.DEBUG
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database - create all tables."""
    logger.info(f"Initializing database: {Config.DATABASE_URL}")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialization complete")


def get_db() -> Session:
    """
    Get database session.
    
    Usage in FastAPI:
    @app.get("/endpoint")
    def endpoint(db: Session = Depends(get_db)):
        pass
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
