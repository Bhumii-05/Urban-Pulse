from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.dependencies.roles import require_role
from app.models.user import User, UserRole
from app.schemas.dashboard import (
    AdminDashboardResponse,
    CitizenDashboardResponse,
    WorkerDashboardResponse,
)
from app.services.dashboard_services import (
    get_admin_dashboard,
    get_citizen_dashboard,
    get_worker_dashboard,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/admin",
    response_model=AdminDashboardResponse,
)
def get_admin_dashboard_data(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return get_admin_dashboard(db)


@router.get(
    "/worker",
    response_model=WorkerDashboardResponse,
)
def get_worker_dashboard_data(
    current_user: User = Depends(require_role(UserRole.WORKER)),
    db: Session = Depends(get_db),
):
    return get_worker_dashboard(
        db,
        current_user.id,
    )


@router.get(
    "/citizen",
    response_model=CitizenDashboardResponse,
)
def get_citizen_dashboard_data(
    current_user: User = Depends(require_role(UserRole.CITIZEN)),
    db: Session = Depends(get_db),
):
    return get_citizen_dashboard(
        db,
        current_user.id,
    )
