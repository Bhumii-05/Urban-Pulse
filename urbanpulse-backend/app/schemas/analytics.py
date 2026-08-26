from pydantic import BaseModel


class AnalyticsOverviewResponse(BaseModel):
    total_users: int
    total_workers: int
    total_concerns: int
    pending_concerns: int
    resolved_concerns: int
    total_suggestions: int


class WorkerAnalyticsResponse(BaseModel):
    worker_id: int
    worker_name: str
    total_assignments: int
    completed_assignments: int
    pending_assignments: int
