from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.ai_service import ai_service
from app.core.config import settings

router = APIRouter()


class AIQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500, description="Natural language question about student data")


class AIQueryResponse(BaseModel):
    answer: str
    intent: Optional[str] = None
    grounded_data: Optional[Dict[str, Any]] = None
    ai_enabled: bool
    model: str


@router.post("/ai/query", response_model=AIQueryResponse, tags=["AI Assistant"])
def ask_ai_assistant(request: AIQueryRequest, db: Session = Depends(get_db)):
    """Process natural language questions with read-only grounded database queries."""
    try:
        result = ai_service.process_query(request.query, db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing grounded AI query: {str(e)}",
        )


@router.get("/ai/status", tags=["AI Assistant"])
def get_ai_status():
    """Check AI assistant configuration and availability status."""
    return {
        "provider": "google-gemini",
        "configured": bool(settings.GEMINI_API_KEY),
        "model": settings.GEMINI_MODEL,
        "mode": "live-api" if settings.GEMINI_API_KEY else "deterministic-fallback",
    }
