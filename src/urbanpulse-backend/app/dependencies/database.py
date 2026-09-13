"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Ashish Pant
Date of Last Modification: 13 September 2026
Brief Description: Provides database session dependencies for API requests.
"""
from collections.abc import Generator
from sqlalchemy.orm import Session

from app.db.session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a SQLAlchemy database session per request.
    Ensures the session is always closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()