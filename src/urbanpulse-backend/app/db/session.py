"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Ashish Pant, Bhumika A
Date of Last Modification: 13 September 2026
Brief Description: Provides database session management for application operations.
"""
from collections.abc import Generator
from sqlalchemy.orm import Session, sessionmaker

from app.db.database import engine

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()