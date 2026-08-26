import sys
from pathlib import Path

# Fix Python path resolution for pytest
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from pathlib import Path
from uuid import uuid4

import pytest

from app.services.local_image_storage import (
    LocalImageStorage,
)


def create_storage(tmp_path):
    return LocalImageStorage(
        storage_directory=str(
            tmp_path / "uploads"
        )
    )


def test_image_is_saved(tmp_path):
    storage = create_storage(tmp_path)

    complaint_id = uuid4()

    image_data = b"test-image-data"

    reference = storage.save(
        image_data=image_data,
        filename="complaint.jpg",
        mime_type="image/jpeg",
        complaint_id=complaint_id,
    )

    image_path = Path(reference)

    assert image_path.exists()
    assert image_path.is_file()


def test_saved_image_contains_correct_bytes(
    tmp_path,
):
    storage = create_storage(tmp_path)

    complaint_id = uuid4()

    image_data = (
        b"\x89PNG\r\n\x1a\n"
        b"test-image-content"
    )

    reference = storage.save(
        image_data=image_data,
        filename="complaint.png",
        mime_type="image/png",
        complaint_id=complaint_id,
    )

    image_path = Path(reference)

    assert image_path.read_bytes() == image_data


def test_storage_reference_exists(
    tmp_path,
):
    storage = create_storage(tmp_path)

    complaint_id = uuid4()

    reference = storage.save(
        image_data=b"image-data",
        filename="test.jpg",
        mime_type="image/jpeg",
        complaint_id=complaint_id,
    )

    assert storage.exists(reference) is True


def test_storage_reference_does_not_exist_after_delete(
    tmp_path,
):
    storage = create_storage(tmp_path)

    complaint_id = uuid4()

    reference = storage.save(
        image_data=b"image-data",
        filename="test.jpg",
        mime_type="image/jpeg",
        complaint_id=complaint_id,
    )

    assert storage.exists(reference) is True

    storage.delete(reference)

    assert storage.exists(reference) is False


def test_image_is_stored_inside_complaint_directory(
    tmp_path,
):
    storage = create_storage(tmp_path)

    complaint_id = uuid4()

    reference = storage.save(
        image_data=b"image-data",
        filename="complaint.jpg",
        mime_type="image/jpeg",
        complaint_id=complaint_id,
    )

    image_path = Path(reference)

    assert image_path.parent.name == str(
        complaint_id
    )


def test_filename_path_traversal_is_sanitized(
    tmp_path,
):
    storage = create_storage(tmp_path)

    complaint_id = uuid4()

    reference = storage.save(
        image_data=b"image-data",
        filename="../../outside.jpg",
        mime_type="image/jpeg",
        complaint_id=complaint_id,
    )

    image_path = Path(reference)

    assert image_path.name == "outside.jpg"

    assert image_path.parent.name == str(
        complaint_id
    )

    assert image_path.exists()


def test_empty_image_data_is_rejected(
    tmp_path,
):
    storage = create_storage(tmp_path)

    with pytest.raises(
        ValueError,
        match="Image data cannot be empty",
    ):
        storage.save(
            image_data=b"",
            filename="test.jpg",
            mime_type="image/jpeg",
            complaint_id=uuid4(),
        )


def test_empty_filename_is_rejected(
    tmp_path,
):
    storage = create_storage(tmp_path)

    with pytest.raises(
        ValueError,
        match="Image filename cannot be empty",
    ):
        storage.save(
            image_data=b"image-data",
            filename="",
            mime_type="image/jpeg",
            complaint_id=uuid4(),
        )


def test_missing_mime_type_is_rejected(
    tmp_path,
):
    storage = create_storage(tmp_path)

    with pytest.raises(
        ValueError,
        match="Image MIME type cannot be empty",
    ):
        storage.save(
            image_data=b"image-data",
            filename="test.jpg",
            mime_type="",
            complaint_id=uuid4(),
        )


def test_delete_missing_file_is_safe(
    tmp_path,
):
    storage = create_storage(tmp_path)

    missing_reference = str(
        tmp_path / "does-not-exist.jpg"
    )

    storage.delete(
        missing_reference
    )

    assert storage.exists(
        missing_reference
    ) is False