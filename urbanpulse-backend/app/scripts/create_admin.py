#Script for initial admin creation
from getpass import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole


def create_admin():
    db = SessionLocal()

    try:
        full_name = input("Admin name: ").strip()
        email = input("Admin email: ").strip().lower()
        phone_number = input("Admin phone number: ").strip()
        password = getpass("Admin password: ")

        existing_user = db.scalar(
            select(User).where(User.email == email)
        )

        if existing_user:
            print("A user with this email already exists.")
            return

        admin = User(
            full_name=full_name,
            email=email,
            phone_number=phone_number,
            hashed_password=hash_password(password),
            role=UserRole.ADMIN,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print(f"Admin created successfully: {admin.email}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()