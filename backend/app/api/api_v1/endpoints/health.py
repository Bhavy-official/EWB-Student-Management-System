from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK, tags=["System Health"])
def liveness_check():
    """Liveness check to verify the service is running."""
    return {"status": "ok", "service": "EWB Student Management System"}


@router.get("/health/ready", status_code=status.HTTP_200_OK, tags=["System Health"])
def readiness_check(db: Session = Depends(get_db)):
    """Readiness check including database connectivity verification."""
    try:
        # Execute light ping query
        db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected",
            "service": "EWB Student Management System",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connectivity failed: {str(e)}",
        )
