from __future__ import annotations

import logging
import traceback
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

logger = logging.getLogger(__name__)


class CloudinaryServiceError(Exception):
    """Raised when a Cloudinary operation fails."""


def upload_image(
    file: BinaryIO,
    folder: str = "",
    public_id: str | None = None,
) -> dict:
    try:
        if hasattr(file, "seek"):
            file.seek(0)

        upload_params = {
            "resource_type": "image",
            "overwrite": False,
            "secure": True,
        }

        clean_folder = folder.strip("/") if folder else ""
        if clean_folder:
            upload_params["folder"] = clean_folder

        if public_id:
            upload_params["public_id"] = public_id

        result = cloudinary.uploader.upload(file, **upload_params)

        return {
            "secure_url": result["secure_url"],
            "public_id": result["public_id"],
        }

    except Exception as exc:
        logger.error("Cloudinary upload exception: %s", exc)
        print("\n--- CLOUDINARY UPLOAD ERROR ---")
        traceback.print_exc()
        print("Settings Cloud Name:", repr(settings.CLOUDINARY_CLOUD_NAME))
        print("Settings API Key:", repr(settings.CLOUDINARY_API_KEY))
        print("-------------------------------\n")
        raise CloudinaryServiceError(
            f"Failed to upload image to Cloudinary: {str(exc)}"
        ) from exc


def delete_image(public_id: str) -> None:
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
            f"Failed to delete image from Cloudinary: {str(exc)}"
        ) from exc