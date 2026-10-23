
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import DashboardAnalyticsResponse
from app.services.analytics_service import get_dashboard_analytics


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "/dashboard",
    response_model=DashboardAnalyticsResponse,
)
def dashboard_analytics(
    year: int | None = Query(default=None, ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_dashboard_analytics(
            db=db,
            user_id=current_user.id,
            year=year,
        )
    except Exception as exc:
        # Log the error in the server terminal without exposing
        # internal database details to the API client.
        print(f"Dashboard analytics error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve dashboard analytics.",
        ) from exc
