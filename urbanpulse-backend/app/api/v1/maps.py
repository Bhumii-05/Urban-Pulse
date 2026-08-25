from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.map import (
    MapQuery,
    NearbyCollectionPointResponse,
    NearbyConcernResponse,
    NearbyWasteBinResponse,
)
from app.services.map_service import (
    get_nearby_collection_points,
    get_nearby_concerns,
    get_nearby_waste_bins,
)


router = APIRouter(
    prefix="/maps",
    tags=["Maps"],
)


@router.get(
    "/nearby-bins",
    response_model=list[NearbyWasteBinResponse],
)
def get_nearby_bins(
    query: MapQuery = Depends(),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    return get_nearby_waste_bins(
        db=db,
        latitude=query.latitude,
        longitude=query.longitude,
        radius=query.radius,
    )


@router.get(
    "/nearby-concerns",
    response_model=list[NearbyConcernResponse],
)
def get_nearby_concerns_route(
    query: MapQuery = Depends(),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    return get_nearby_concerns(
        db=db,
        latitude=query.latitude,
        longitude=query.longitude,
        radius=query.radius,
    )


@router.get(
    "/nearby-collection-points",
    response_model=list[
        NearbyCollectionPointResponse
    ],
)
def get_nearby_collection_points_route(
    query: MapQuery = Depends(),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    return get_nearby_collection_points(
        db=db,
        latitude=query.latitude,
        longitude=query.longitude,
        radius=query.radius,
    )