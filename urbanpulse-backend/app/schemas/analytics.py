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


class ConcernStatusAnalyticsResponse(BaseModel):
    status: str
    count: int


class ConcernCategoryAnalyticsResponse(BaseModel):
    category: str
    count: int


class ConcernPriorityAnalyticsResponse(BaseModel):
    priority: str
    count: int


class RouteStatusAnalyticsResponse(BaseModel):
    status: str
    count: int


class CollectionPointAnalyticsResponse(BaseModel):
    status: str
    count: int


class WasteBinStatusAnalyticsResponse(BaseModel):
    status: str
    count: int

class CategoryShare(BaseModel):
    category: str
    percentage: float

class PublicImpactMetricsResponse(BaseModel):
    # SLA & Problem Solving Percentages
    resolution_rate: float
    total_resolved: int
    route_efficiency_rate: float
    bin_health_rate: float

    # Environmental Footprint Reductions
    co2_reduction_percentage: float
    landfill_diversion_percentage: float
    fuel_saved_percentage: float

    # Category Distribution for Visual Charts
    category_distribution: list[CategoryShare]