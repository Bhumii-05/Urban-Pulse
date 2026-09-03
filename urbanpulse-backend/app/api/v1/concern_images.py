from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.concern import Concern
from app.models.user import User
from app.schemas.concern_image import ConcernImageResponse
from app.services import concern_image_service
from app.services.cloudinary_service import CloudinaryServiceError
from app.services.concern_image_service import (
    ConcernImageValidationError,
)

from app.models.assignment import Assignment
from app.models.user import UserRole


router = APIRouter(
    prefix="/concerns/{concern_id}/images",
    tags=["Concern Images"],
)


def get_active_concern(
    db: Session,
    concern_id: int,
) -> Concern | None:
    return (
        db.query(Concern)
        .filter(
            Concern.id == concern_id,
            Concern.is_deleted.is_(False),
        )
        .first()
    )

@router.post(
    "",
    response_model=ConcernImageResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_concern_image(
    concern_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    concern = get_active_concern(
        db=db,
        concern_id=concern_id,
    )

    if concern is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concern not found",
        )

    # 1. Block Admins from uploading evidence
    user_role_str = str(getattr(current_user.role, "value", current_user.role)).lower()
    if user_role_str == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot upload concern evidence images",
        )

    # 2. Check if user is the reporting citizen
    is_creator = concern.reported_by == current_user.id

    # 3. Check if user is an assigned worker for this specific concern
    is_assigned_worker = (
        db.query(Assignment)
        .filter(
            Assignment.concern_id == concern_id,
            Assignment.worker_id == current_user.id,
        )
        .first()
        is not None
    )

    # 4. Check if user has worker role
    is_worker = user_role_str == "worker"

    # Allow if reporting citizen, assigned worker, or any worker handling field operations
    if not (is_creator or is_assigned_worker or is_worker):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the reporting citizen or assigned workers can upload images to this concern",
        )

    try:
        return concern_image_service.create_concern_image(
            db=db,
            concern_id=concern_id,
            file=file,
        )

    except ConcernImageValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except CloudinaryServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    

@router.get(
    "",
    response_model=list[ConcernImageResponse],
)
def get_concern_images(
    concern_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    concern = get_active_concern(
        db=db,
        concern_id=concern_id,
    )

    if concern is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concern not found",
        )

    return concern_image_service.get_concern_images(
        db=db,
        concern_id=concern_id,
    )


@router.delete(
    "/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_concern_image(
    concern_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    concern = get_active_concern(
        db=db,
        concern_id=concern_id,
    )

    if concern is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concern not found",
        )

    if concern.reported_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete images from your own concerns",
        )

    concern_image = concern_image_service.get_concern_image(
        db=db,
        concern_id=concern_id,
        image_id=image_id,
    )

    if concern_image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concern image not found",
        )

    try:
        concern_image_service.delete_concern_image(
            db=db,
            concern_image=concern_image,
        )

    except CloudinaryServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    return None