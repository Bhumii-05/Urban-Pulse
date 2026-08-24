import sqlite3
from pathlib import Path
from uuid import UUID

from app.models.complaint import Complaint, ComplaintStatus
from app.repositories.complaint_repository import ComplaintRepository
from datetime import datetime, timezone


class SQLiteComplaintRepository(ComplaintRepository):
    """
    SQLite implementation of the ComplaintRepository.

    Responsible only for persistence. It does not perform
    complaint analysis or AI processing.
    """

    def __init__(
        self,
        database_path: str = "data/urban_pulse.db",
    ):
        self.database_path = Path(database_path)

        # Create parent directory if it does not exist.
        self.database_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        self._initialize_database()

    def _get_connection(self) -> sqlite3.Connection:
        """
        Create a SQLite database connection.
        """

        connection = sqlite3.connect(
            str(self.database_path)
        )

        connection.row_factory = sqlite3.Row

        return connection

    def _initialize_database(self) -> None:
        """
        Create the complaints table if it does not exist.
        """

        with self._get_connection() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS complaints (
                    id TEXT PRIMARY KEY,
                    complaint_text TEXT NOT NULL,
                    category TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    description TEXT NOT NULL,
                    recommended_action TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    status TEXT NOT NULL,
                    image_filename TEXT,
                    image_mime_type TEXT,
                    image_reference TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )

            connection.commit()

    def create(
        self,
        complaint: Complaint,
    ) -> Complaint:
        """
        Persist a complaint.

        If the complaint ID already exists, SQLite will raise
        an integrity error rather than silently replacing it.
        """

        with self._get_connection() as connection:
            connection.execute(
                """
                INSERT INTO complaints (
                    id,
                    complaint_text,
                    category,
                    severity,
                    description,
                    recommended_action,
                    confidence,
                    status,
                    image_filename,
                    image_mime_type,
                    image_reference,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    str(complaint.id),
                    complaint.complaint_text,
                    complaint.category,
                    complaint.severity,
                    complaint.description,
                    complaint.recommended_action,
                    complaint.confidence,
                    complaint.status.value,
                    complaint.image_filename,
                    complaint.image_mime_type,
                    complaint.image_reference,
                    complaint.created_at.isoformat(),
                    complaint.updated_at.isoformat(),
                ),
            )

            connection.commit()

        return complaint

    def get_by_id(
        self,
        complaint_id: UUID,
    ) -> Complaint | None:
        """
        Retrieve a complaint by UUID.
        """

        with self._get_connection() as connection:
            row = connection.execute(
                """
                SELECT
                    id,
                    complaint_text,
                    category,
                    severity,
                    description,
                    recommended_action,
                    confidence,
                    status,
                    image_filename,
                    image_mime_type,
                    image_reference,
                    created_at,
                    updated_at
                FROM complaints
                WHERE id = ?
                """,
                (str(complaint_id),),
            ).fetchone()

        if row is None:
            return None

        return self._row_to_complaint(row)

    def list_all(self) -> list[Complaint]:
        """
        Retrieve all complaints.

        Results are returned newest first.
        """

        with self._get_connection() as connection:
            rows = connection.execute(
                """
                SELECT
                    id,
                    complaint_text,
                    category,
                    severity,
                    description,
                    recommended_action,
                    confidence,
                    status,
                    image_filename,
                    image_mime_type,
                    image_reference,
                    created_at,
                    updated_at
                FROM complaints
                ORDER BY created_at DESC
                """
            ).fetchall()

        return [
            self._row_to_complaint(row)
            for row in rows
        ]

    @staticmethod
    def _row_to_complaint(
        row: sqlite3.Row,
    ) -> Complaint:
        """
        Convert a SQLite row into a Complaint domain model.
        """

        return Complaint(
            id=UUID(row["id"]),
            complaint_text=row["complaint_text"],
            category=row["category"],
            severity=row["severity"],
            description=row["description"],
            recommended_action=row["recommended_action"],
            confidence=float(row["confidence"]),
            status=ComplaintStatus(row["status"]),
            image_filename=row["image_filename"],
            image_mime_type=row["image_mime_type"],
            image_reference=row["image_reference"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def update_status(
    self,
    complaint_id: UUID,
    status: ComplaintStatus,
    ) -> Complaint | None:
        """
        Update the status of a complaint.

        Business rules regarding allowed status transitions
        are handled by the service layer.
        """

        updated_at = datetime.now(
            timezone.utc
        ).isoformat()

        with self._get_connection() as connection:
            cursor = connection.execute(
                """
                UPDATE complaints
                SET status = ?,
                    updated_at = ?
                WHERE id = ?
                """,
                (
                    status.value,
                    updated_at,
                    str(complaint_id),
                ),
            )

            connection.commit()

            if cursor.rowcount == 0:
                return None

        return self.get_by_id(
            complaint_id
        )