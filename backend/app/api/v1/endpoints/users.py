from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.config import settings
from app.core.security import verify_password
from app.modules.auth.models.user import User
from app.modules.auth.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    UserUpdatePassword,
)
from app.modules.auth.services.user_service import UserService

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.post("/me/password", response_model=UserResponse)
async def update_user_password(
    *,
    db: AsyncSession = Depends(deps.get_db),
    password_in: UserUpdatePassword,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update current user password.
    """
    if not verify_password(password_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    if password_in.current_password == password_in.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )

    user = await UserService.update(
        db, db_obj=current_user, obj_in={"password": password_in.new_password}
    )
    return user


@router.post("/", response_model=UserResponse)
async def create_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate,
    # current_user: User = Depends(deps.get_current_active_superuser), # Open registration for MVP setup
) -> Any:
    """
    Create new user.
    """
    user = await UserService.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = await UserService.create(db, obj_in=user_in)
    return user
