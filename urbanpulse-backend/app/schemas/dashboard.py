from pydantic import BaseModel


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_workers: int
    total_concerns: int
    pending_concerns: int
    resolved_concerns: int
    todays_collections: int
    most_reported_area: str | None = None


class WorkerRouteResponse(BaseModel):
    id: int
    route_name: str
    route_date: str
    status: str


class CollectionProgressResponse(BaseModel):
    total: int
    completed: int


class WorkerDashboardResponse(BaseModel):
    today_route: WorkerRouteResponse | None
    pending_assignments: int
    completed_assignments: int
    collection_progress: CollectionProgressResponse
    unread_notifications: int

class CitizenDashboardResponse(BaseModel):
    total_concerns: int
    pending_concerns: int
    resolved_concerns: int
    total_suggestions: int
    unread_notifications: int