from __future__ import annotations

from typing import BinaryIO

import cloudinary
import cloudinary.uploader

from app.core.config import settings


cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


class CloudinaryServiceError(Exception):
    """Raised when a Cloudinary operation fails."""


def upload_image(
    file: BinaryIO,
    folder: str,
    public_id: str,
) -> dict:
    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            public_id=public_id,
            resource_type="image",
            overwrite=False,
            secure=True,
        )

        return {
            "secure_url": result["secure_url"],
            "public_id": result["public_id"],
        }

    except Exception as exc:
        raise CloudinaryServiceError(
            "Failed to upload image to Cloudinary"
        ) from exc


def delete_image(
    public_id: str,
) -> None:
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="image",
            type="upload",
            invalidate=True,
        )

        if result.get("result") not in {"ok", "not found"}:
            raise CloudinaryServiceError(
                "Cloudinary did not confirm image deletion"
            )

    except CloudinaryServiceError:
        raise

    except Exception as exc:
        raise CloudinaryServiceError(
            "Failed to delete image from Cloudinary"
        ) from exc