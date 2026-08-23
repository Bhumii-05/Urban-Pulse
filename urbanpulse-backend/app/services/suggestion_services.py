from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import NotificationType
from app.models.suggestion import Suggestion, SuggestionStatus
from app.models.user import User
from app.schemas.suggestion import (
    SuggestionCreate,
    SuggestionReviewRequest,
)
from app.services.notification_services import create_notification


def create_suggestion(
    db: Session,
    user: User,
    suggestion_data: SuggestionCreate,
) -> Suggestion:
    suggestion = Suggestion(
        submitted_by=user.id,
        title=suggestion_data.title,
        description=suggestion_data.description,
        status=SuggestionStatus.PENDING,
    )

    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)

    return suggestion


def get_citizen_suggestions(
    db: Session,
    user_id: int,
) -> list[Suggestion]:
    return db.scalars(
        select(Suggestion)
        .where(Suggestion.submitted_by == user_id)
        .order_by(Suggestion.created_at.desc())
    ).all()


def get_all_suggestions(
    db: Session,
) -> list[Suggestion]:
    return db.scalars(
        select(Suggestion)
        .order_by(Suggestion.created_at.desc())
    ).all()


def get_suggestion_by_id(
    db: Session,
    suggestion_id: int,
) -> Suggestion | None:
    return db.scalar(
        select(Suggestion).where(
            Suggestion.id == suggestion_id
        )
    )


def review_suggestion(
    db: Session,
    suggestion_id: int,
    admin_id: int,
    review_data: SuggestionReviewRequest,
) -> Suggestion | None:
    suggestion = get_suggestion_by_id(
        db,
        suggestion_id,
    )

    if suggestion is None:
        return None

    try:
        suggestion.status = review_data.status
        suggestion.admin_reply = review_data.admin_reply
        suggestion.reviewed_by = admin_id

        db.flush()

        create_notification(
            db=db,
            recipient_id=suggestion.submitted_by,
            notification_type=NotificationType.SUGGESTION,
            title="Suggestion Updated",
            message=(
                f"Your suggestion '{suggestion.title}' "
                f"has been {suggestion.status.value.lower()}."
            ),
        )

        db.commit()
        db.refresh(suggestion)

        return suggestion

    except Exception:
        db.rollback()
        raise