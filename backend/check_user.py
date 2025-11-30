import asyncio

from sqlalchemy import select

from app.core.security import verify_password
from app.db.session import AsyncSessionLocal
from app.modules.auth.models.user import User


async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "admin@example.com"))
        user = result.scalar_one_or_none()
        if user:
            print(f"User found: {user.email}")
            print(f"Hashed password: {user.hashed_password}")
            is_valid = verify_password("admin", user.hashed_password)
            print(f"Password 'admin' valid: {is_valid}")
        else:
            print("User not found")


if __name__ == "__main__":
    asyncio.run(main())
