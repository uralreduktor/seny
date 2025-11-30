import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.modules.pricing_kb_ai.models.nomenclature import (  # Required import
    Nomenclature,
)
from app.modules.tender_management.models.tender import Tender


async def main():
    async with AsyncSessionLocal() as db:
        # Update T-2024-001
        result = await db.execute(select(Tender).where(Tender.number == "T-2024-001"))
        t1 = result.scalar_one_or_none()
        if t1:
            t1.terms = {
                "payment_terms": "30% аванс, 70% перед отгрузкой",
                "delivery_conditions": "DDP г. Екатеринбург",
                "warranty": "12 месяцев с момента ввода в эксплуатацию",
                "validity_days": 30,
            }
            db.add(t1)
            print(f"Updated terms for {t1.number}")

        # Update T-2024-002
        result = await db.execute(select(Tender).where(Tender.number == "T-2024-002"))
        t2 = result.scalar_one_or_none()
        if t2:
            t2.terms = {
                "payment_terms": "100% постоплата 30 дней",
                "delivery_conditions": "EXW г. Челябинск",
                "warranty": "24 месяца",
                "validity_days": 60,
            }
            db.add(t2)
            print(f"Updated terms for {t2.number}")

        # Update T-2024-003
        result = await db.execute(select(Tender).where(Tender.number == "T-2024-003"))
        t3 = result.scalar_one_or_none()
        if t3:
            t3.terms = {
                "payment_terms": "50% аванс, 50% по факту работ",
                "delivery_conditions": "Работы на объекте Заказчика",
                "warranty": "6 месяцев на выполненные работы",
                "validity_days": 14,
            }
            db.add(t3)
            print(f"Updated terms for {t3.number}")

        await db.commit()


if __name__ == "__main__":
    asyncio.run(main())
