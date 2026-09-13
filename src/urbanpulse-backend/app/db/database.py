"""
Project Name: UrbanPulse
Group Name: Vision Crafters
Author(s): Bhumika A
Date of Last Modification: 13 September 2026
Brief Description: Configures the database engine and database connectivity.
"""
from sqlalchemy import create_engine
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=True
)