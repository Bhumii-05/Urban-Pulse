from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User

# for retrieving users
def get_users(db: Session) -> list[User]:
    return db.scalars(
        select(User)
    ).all()