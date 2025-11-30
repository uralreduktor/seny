import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.modules.pricing_kb_ai.models.nomenclature import (  # Import needed for registry
    Nomenclature,
)
from app.modules.tender_management.models.tender import Tender


async def main():
    async with AsyncSessionLocal() as db:
        # Update T-2024-001
        result = await db.execute(select(Tender).where(Tender.number == "T-2024-001"))
        t1 = result.scalar_one_or_none()
        if t1:
            t1.customer = "ООО 'Завод Механики'"
            db.add(t1)
            print(f"Updated {t1.number}")

        # Update T-2024-002
        result = await db.execute(select(Tender).where(Tender.number == "T-2024-002"))
        t2 = result.scalar_one_or_none()
        if t2:
            t2.customer = "ПАО 'Нефтегаз'"
            db.add(t2)
            print(f"Updated {t2.number}")

        # Update T-2024-003
        result = await db.execute(select(Tender).where(Tender.number == "T-2024-003"))
        t3 = result.scalar_one_or_none()
        if t3:
            t3.customer = "ЗАО 'Горнодобывающая компания'"
            db.add(t3)
            print(f"Updated {t3.number}")

        await db.commit()


if __name__ == "__main__":
    asyncio.run(main())
