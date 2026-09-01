from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.dependencies.roles import require_role
from app.models.collection_route import RouteStatus
from app.models.user import User, UserRole
from app.schemas.collection_route import (
    CollectionRouteCreate,
    CollectionRouteResponse,
    CollectionRouteStatusUpdate,
    CollectionRouteUpdate,
)
from app.services import collection_route_service


router = APIRouter(
    prefix="/collection-routes",
    tags=["Collection Routes"],
)


@router.post(
    "",
    response_model=CollectionRouteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_collection_route(
    route_data: CollectionRouteCreate,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    try:
        return collection_route_service.create_collection_route(
            db=db,
            worker_id=route_data.worker_id,
            route_name=route_data.route_name,
            route_date=route_data.route_date,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )


@router.get(
    "",
    response_model=list[CollectionRouteResponse],
)
def get_collection_routes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == UserRole.ADMIN:
        return collection_route_service.get_all_collection_routes(
            db=db,
        )

    if current_user.role == UserRole.WORKER:
        return collection_route_service.get_worker_collection_routes(
            db=db,
            worker_id=current_user.id,
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to view collection routes",
    )


@router.get(
    "/{route_id}",
    response_model=CollectionRouteResponse,
)
def get_collection_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = collection_route_service.get_collection_route_by_id(
        db=db,
        route_id=route_id,
    )

    if route is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection route not found",
        )

    if (
        current_user.role != UserRole.ADMIN
        and route.worker_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this collection route",
        )

    return route


@router.patch(
    "/{route_id}",
    response_model=CollectionRouteResponse,
)
def update_collection_route(
    route_id: int,
    route_data: CollectionRouteUpdate,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    route = collection_route_service.get_collection_route_by_id(
        db=db,
        route_id=route_id,
    )

    if route is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection route not found",
        )

    try:
        return collection_route_service.update_collection_route(
            db=db,
            route=route,
            route_name=route_data.route_name,
            route_date=route_data.route_date,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.patch(
    "/{route_id}/status",
    response_model=CollectionRouteResponse,
)
def update_collection_route_status(
    route_id: int,
    status_data: CollectionRouteStatusUpdate,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    route = collection_route_service.get_collection_route_by_id(
        db=db,
        route_id=route_id,
    )

    if route is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection route not found",
        )

    try:
        return collection_route_service.update_collection_route_status(
            db=db,
            route=route,
            new_status=status_data.status,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.delete(
    "/{route_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_collection_route(
    route_id: int,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    route = collection_route_service.get_collection_route_by_id(
        db=db,
        route_id=route_id,
    )

    if route is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection route not found",
        )

    try:
        collection_route_service.delete_collection_route(
            db=db,
            route=route,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )