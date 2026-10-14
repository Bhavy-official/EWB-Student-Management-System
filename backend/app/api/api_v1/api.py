from fastapi import APIRouter
from app.api.api_v1.endpoints import students, health, ai

api_router = APIRouter()

# Mount endpoints
api_router.include_router(health.router)
api_router.include_router(students.router)
api_router.include_router(ai.router)
