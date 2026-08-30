from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.concern_image import ConcernImage
from app.services.cloudinary_service import (
    CloudinaryServiceError,
    delete_image,
    upload_image,
)

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

ALLOWED_FORMATS = {
    "JPEG",
    "PNG",
    "WEBP",
}


class ConcernImageValidationError(Exception):
    """Raised when an uploaded image fails validation."""


def validate_image(file: UploadFile) -> None:
    if not file.filename:
        raise ConcernImageValidationError("Image file is required")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise ConcernImageValidationError("Only JPEG, PNG, and WEBP images are allowed")

    raw_file = file.file

    raw_file.seek(0, 2)
    file_size = raw_file.tell()
    raw_file.seek(0)

    if file_size == 0:
        raise ConcernImageValidationError("Uploaded image is empty")

    if file_size > settings.MAX_IMAGE_SIZE_BYTES:
        raise ConcernImageValidationError("Image size must not exceed 5 MB")

    try:
        with Image.open(raw_file) as image:
            image.verify()

        raw_file.seek(0)

        with Image.open(raw_file) as image:
            if image.format not in ALLOWED_FORMATS:
                raise ConcernImageValidationError(
                    "Uploaded file is not a supported image format"
                )

    except UnidentifiedImageError as exc:
        raw_file.seek(0)
        raise ConcernImageValidationError("Uploaded file is not a valid image") from exc

    except ConcernImageValidationError:
        raw_file.seek(0)
        raise

    except Exception as exc:
        raw_file.seek(0)
        raise ConcernImageValidationError("Unable to validate uploaded image") from exc

    raw_file.seek(0)


def create_concern_image(
    db: Session,
    concern_id: int,
    file: UploadFile,
) -> ConcernImage:
    validate_image(file)

    file.file.seek(0)

    unique_id = uuid4().hex
    clean_folder = (settings.CLOUDINARY_FOLDER or "urbanpulse/concerns").strip("/")
    public_id_name = f"concern_{concern_id}_{unique_id}"

    cloudinary_result = upload_image(
        file=file.file,
        folder=clean_folder,
        public_id=public_id_name,
    )

    concern_image = ConcernImage(
        concern_id=concern_id,
        image_url=cloudinary_result["secure_url"],
        cloudinary_public_id=cloudinary_result["public_id"],
        uploaded_at=datetime.utcnow(),
    )

    try:
        db.add(concern_image)
        db.commit()
        db.refresh(concern_image)

    except Exception:
        db.rollback()
        try:
            delete_image(cloudinary_result["public_id"])
        except CloudinaryServiceError:
            pass
        raise

    return concern_image


def get_concern_images(
    db: Session,
    concern_id: int,
) -> list[ConcernImage]:
    return (
        db.query(ConcernImage)
        .filter(ConcernImage.concern_id == concern_id)
        .order_by(ConcernImage.uploaded_at.desc())
        .all()
    )


def get_concern_image(
    db: Session,
    concern_id: int,
    image_id: int,
) -> ConcernImage | None:
    return (
        db.query(ConcernImage)
        .filter(
            ConcernImage.id == image_id,
            ConcernImage.concern_id == concern_id,
        )
        .first()
    )


def delete_concern_image(
    db: Session,
    concern_image: ConcernImage,
) -> None:
    delete_image(concern_image.cloudinary_public_id)
    db.delete(concern_image)
    db.commit()
