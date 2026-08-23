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

    if concern.reported_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload images to your own concerns",
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