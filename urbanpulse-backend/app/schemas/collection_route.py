from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.collection_route import RouteStatus


class CollectionRouteCreate(BaseModel):
    worker_id: int
    route_name: str
    route_date: datetime


class CollectionRouteUpdate(BaseModel):
    route_name: str | None = None
    route_date: datetime | None = None


class CollectionRouteStatusUpdate(BaseModel):
    status: RouteStatus


class CollectionRouteResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    worker_id: int
    route_name: str
    route_date: datetime
    status: RouteStatus
    created_at: datetime
    updated_at: datetime