from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.roles import require_role
from app.models.user import User, UserRole
from app.schemas.suggestion import (
    SuggestionCreate,
    SuggestionResponse,
    SuggestionReviewRequest,
)
from app.services.suggestion_services import (
    create_suggestion,
    get_all_suggestions,
    get_citizen_suggestions,
    get_suggestion_by_id,
    review_suggestion,
)


citizen_router = APIRouter(
    prefix="/citizen/suggestions",
    tags=["Citizen Suggestions"],
)


admin_router = APIRouter(
    prefix="/admin/suggestions",
    tags=["Admin Suggestions"],
)


@citizen_router.post(
    "",
    response_model=SuggestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_suggestion(
    suggestion_data: SuggestionCreate,
    current_user: User = Depends(
        require_role(UserRole.CITIZEN)
    ),
    db: Session = Depends(get_db),
):
    return create_suggestion(
        db,
        current_user,
        suggestion_data,
    )


@citizen_router.get(
    "",
    response_model=list[SuggestionResponse],
)
def get_my_suggestions(
    current_user: User = Depends(
        require_role(UserRole.CITIZEN)
    ),
    db: Session = Depends(get_db),
):
    return get_citizen_suggestions(
        db,
        current_user.id,
    )


@admin_router.get(
    "",
    response_model=list[SuggestionResponse],
)
def get_suggestions(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    return get_all_suggestions(db)


@admin_router.get(
    "/{suggestion_id}",
    response_model=SuggestionResponse,
)
def get_suggestion(
    suggestion_id: int,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    suggestion = get_suggestion_by_id(
        db,
        suggestion_id,
    )

    if suggestion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggestion not found",
        )

    return suggestion


@admin_router.patch(
    "/{suggestion_id}",
    response_model=SuggestionResponse,
)
def review_suggestion_route(
    suggestion_id: int,
    review_data: SuggestionReviewRequest,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    suggestion = review_suggestion(
        db=db,
        suggestion_id=suggestion_id,
        admin_id=current_user.id,
        review_data=review_data,
    )

    if suggestion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggestion not found",
        )

    return suggestion