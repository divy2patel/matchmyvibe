from fastapi import APIRouter
from backend.app.api.v1.match import router as match_router
from backend.app.api.v1.icebreaker import router as icebreaker_router
from backend.app.api.v1.groups import router as groups_router
from backend.app.api.v1.events import router as events_router
from backend.app.api.v1.interests import router as interests_router
from backend.app.api.v1.saved import router as saved_router
from backend.app.api.v1.history import router as history_router
from backend.app.api.v1.feedback import router as feedback_router
from backend.app.api.v1.profile import router as profile_router
from backend.app.api.v1.chat import router as chat_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(match_router)
api_v1_router.include_router(icebreaker_router)
api_v1_router.include_router(groups_router)
api_v1_router.include_router(events_router)
api_v1_router.include_router(interests_router)
api_v1_router.include_router(saved_router)
api_v1_router.include_router(history_router)
api_v1_router.include_router(feedback_router)
api_v1_router.include_router(profile_router)
api_v1_router.include_router(chat_router)
