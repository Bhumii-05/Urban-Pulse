from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.dependencies.roles import require_role
from app.models.user import User, UserRole
from app.schemas.collection_point import (
    CollectionPointCreate,
    CollectionPointResponse,
    CollectionPointUpdate,
)
from app.services import (
    collection_point_service,
    collection_route_service,
)

router = APIRouter(
    prefix="/collection-points",
    tags=["Collection Points"],
)


@router.post(
    "",
    response_model=CollectionPointResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_collection_point(
    point_data: CollectionPointCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    try:
        return collection_point_service.create_collection_point(
            db=db,
            route_id=point_data.route_id,
            latitude=point_data.latitude,
            longitude=point_data.longitude,
            sequence_order=point_data.sequence_order,
            waste_bin_id=point_data.waste_bin_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )


@router.get(
    "",
    response_model=list[CollectionPointResponse],
)
def get_collection_points(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == UserRole.ADMIN:
        return collection_point_service.get_all_collection_points(
            db=db,
        )

    if current_user.role == UserRole.WORKER:
        routes = collection_route_service.get_worker_collection_routes(
            db=db,
            worker_id=current_user.id,
        )

        points = []

        for route in routes:
            points.extend(
                collection_point_service.get_route_collection_points(
                    db=db,
                    route_id=route.id,
                )
            )

        return points

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to view collection points",
    )


@router.get(
    "/route/{route_id}",
    response_model=list[CollectionPointResponse],
)
def get_route_collection_points(
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

    if current_user.role != UserRole.ADMIN and route.worker_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view these collection points",
        )

    return collection_point_service.get_route_collection_points(
        db=db,
        route_id=route_id,
    )


@router.get(
    "/{point_id}",
    response_model=CollectionPointResponse,
)
def get_collection_point(
    point_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    collection_point = collection_point_service.get_collection_point_by_id(
        db=db,
        point_id=point_id,
    )

    if collection_point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection point not found",
        )

    route = collection_route_service.get_collection_route_by_id(
        db=db,
        route_id=collection_point.route_id,
    )

    if route is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection route not found",
        )

    if current_user.role != UserRole.ADMIN and route.worker_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this collection point",
        )

    return collection_point_service.get_collection_point_response(
        db=db,
        collection_point=collection_point,
    )


@router.patch(
    "/{point_id}",
    response_model=CollectionPointResponse,
)
def update_collection_point(
    point_id: int,
    point_data: CollectionPointUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    collection_point = collection_point_service.get_collection_point_by_id(
        db=db,
        point_id=point_id,
    )

    if collection_point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection point not found",
        )

    try:
        updated_point = collection_point_service.update_collection_point(
            db=db,
            collection_point=collection_point,
            latitude=point_data.latitude,
            longitude=point_data.longitude,
            sequence_order=point_data.sequence_order,
            waste_bin_id=point_data.waste_bin_id,
        )

        return collection_point_service.get_collection_point_response(
            db=db,
            collection_point=updated_point,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.patch(
    "/{point_id}/collect",
    response_model=CollectionPointResponse,
)
def mark_collection_point_collected(
    point_id: int,
    current_user: User = Depends(require_role(UserRole.WORKER)),
    db: Session = Depends(get_db),
):
    collection_point = collection_point_service.get_collection_point_by_id(
        db=db,
        point_id=point_id,
    )

    if collection_point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection point not found",
        )

    try:
        collected_point = collection_point_service.mark_collection_point_collected(
            db=db,
            collection_point=collection_point,
            current_user=current_user,
        )

        return collection_point_service.get_collection_point_response(
            db=db,
            collection_point=collected_point,
        )

    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.delete(
    "/{point_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_collection_point(
    point_id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    collection_point = collection_point_service.get_collection_point_by_id(
        db=db,
        point_id=point_id,
    )

    if collection_point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection point not found",
        )

    collection_point_service.delete_collection_point(
        db=db,
        collection_point=collection_point,
    )
