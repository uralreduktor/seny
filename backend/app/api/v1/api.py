from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    nomenclature,
    nomenclatures,
    positions,
    tenders,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tenders.router, prefix="/tenders", tags=["tenders"])
api_router.include_router(positions.router, prefix="/positions", tags=["positions"])
api_router.include_router(nomenclature.router)
api_router.include_router(
    nomenclatures.router, prefix="/nomenclatures", tags=["nomenclatures"]
)
