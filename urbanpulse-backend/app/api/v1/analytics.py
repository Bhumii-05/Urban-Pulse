from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.roles import require_role
from app.models.user import User, UserRole
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    WorkerAnalyticsResponse,
    ConcernStatusAnalyticsResponse,
    ConcernCategoryAnalyticsResponse,
    ConcernPriorityAnalyticsResponse,
    RouteStatusAnalyticsResponse,
    CollectionPointAnalyticsResponse,
    WasteBinStatusAnalyticsResponse,
)
from app.services.analytics_services import (
    get_overview,
    get_worker_analytics,
    get_concern_status_analytics,
    get_concern_category_analytics,
    get_concern_priority_analytics,
    get_route_status_analytics,
    get_collection_point_analytics,
    get_waste_bin_status_analytics,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse,
)
def analytics_overview(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    return get_overview(db)


@router.get(
    "/workers",
    response_model=list[WorkerAnalyticsResponse],
)
def analytics_workers(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    return get_worker_analytics(db)


@router.get(
    "/concerns/status",
    response_model=list[ConcernStatusAnalyticsResponse],
)
def analytics_concern_status(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    return get_concern_status_analytics(db)


@router.get(
    "/concerns/categories",
    response_model=list[ConcernCategoryAnalyticsResponse],
)
def analytics_concern_categories(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    return get_concern_category_analytics(db)


@router.get(
    "/concerns/priorities",
    response_model=list[ConcernPriorityAnalyticsResponse],
)
def analytics_concern_priorities(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    return get_concern_priority_analytics(db)


@router.get(
    "/routes/status",
    response_model=list[RouteStatusAnalyticsResponse],
)
def analytics_route_status(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    return get_route_status_analytics(db)


@router.get(
    "/collection-points/status",
    response_model=list[CollectionPointAnalyticsResponse],
)
def analytics_collection_point_status(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    return get_collection_point_analytics(db)


@router.get(
    "/waste-bins/status",
    response_model=list[WasteBinStatusAnalyticsResponse],
)
def analytics_waste_bin_status(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    return get_waste_bin_status_analytics(db)