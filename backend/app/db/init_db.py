import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.modules.auth.schemas.user import UserCreate
from app.modules.auth.services.user_service import UserService
from app.modules.pricing_kb_ai.models.nomenclature import Nomenclature
from app.modules.tender_management.enums import PositionStatus, StageCode, TenderSource
from app.modules.tender_management.models.position import Position
from app.modules.tender_management.models.stage import Stage, StageTransition
from app.modules.tender_management.models.tender import Tender

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def init_stages(db: AsyncSession):
    stages_data = [
        {"name": "Обнаружен", "code": StageCode.DISCOVERED, "order": 1},
        {"name": "На рассмотрении", "code": StageCode.REVIEWING, "order": 2},
        {"name": "В работе", "code": StageCode.IN_PROGRESS, "order": 3},
        {"name": "Расчёт стоимости", "code": StageCode.CALCULATING, "order": 4},
        {"name": "Подготовка документов", "code": StageCode.PREPARING_DOCS, "order": 5},
        {"name": "Подача", "code": StageCode.SUBMITTED, "order": 6},
        {
            "name": "Ожидание результатов",
            "code": StageCode.AWAITING_RESULTS,
            "order": 7,
        },
        {"name": "Выигран", "code": StageCode.WON, "order": 8},
        {"name": "Проигран", "code": StageCode.LOST, "order": 9},
        {"name": "Отменён", "code": StageCode.CANCELLED, "order": 10},
    ]

    created_stages = {}
    for s_data in stages_data:
        result = await db.execute(select(Stage).where(Stage.code == s_data["code"]))
        stage = result.scalar_one_or_none()

        if not stage:
            stage = Stage(**s_data)
            db.add(stage)
            await db.flush()

        created_stages[s_data["code"]] = stage

    await db.commit()
    # Refresh all
    for stage in created_stages.values():
        await db.refresh(stage)

    return created_stages


async def init_transitions(db: AsyncSession, stages: dict):
    transitions = [
        (StageCode.DISCOVERED, StageCode.REVIEWING),
        (StageCode.REVIEWING, StageCode.IN_PROGRESS),
        (StageCode.REVIEWING, StageCode.CANCELLED),
        (StageCode.IN_PROGRESS, StageCode.CALCULATING),
        (StageCode.IN_PROGRESS, StageCode.CANCELLED),
        (StageCode.CALCULATING, StageCode.PREPARING_DOCS),
        (StageCode.PREPARING_DOCS, StageCode.SUBMITTED),
        (StageCode.PREPARING_DOCS, StageCode.CALCULATING),  # Return for rework
        (StageCode.SUBMITTED, StageCode.AWAITING_RESULTS),
        (StageCode.AWAITING_RESULTS, StageCode.WON),
        (StageCode.AWAITING_RESULTS, StageCode.LOST),
    ]

    for from_code, to_code in transitions:
        from_stage = stages.get(from_code)
        to_stage = stages.get(to_code)

        if from_stage and to_stage:
            result = await db.execute(
                select(StageTransition).where(
                    (StageTransition.from_stage_id == from_stage.id)
                    & (StageTransition.to_stage_id == to_stage.id)
                )
            )
            if not result.scalar_one_or_none():
                t = StageTransition(
                    from_stage_id=from_stage.id, to_stage_id=to_stage.id
                )
                db.add(t)
    await db.commit()


async def init_tenders(db: AsyncSession, stages: dict):
    result = await db.execute(select(Tender).limit(1))
    if result.scalar_one_or_none():
        logger.info("Tenders already exist, skipping demo data.")
        return

    discovered_stage = stages[StageCode.DISCOVERED]

    demos = [
        {
            "number": "T-2024-001",
            "title": "Поставка редукторов Ц2У-250",
            "customer": "ООО 'Завод Механики'",
            "description": "Тендер на поставку 5 редукторов для завода",
            "source": TenderSource.EIS,
            "deadline_at": datetime.now(timezone.utc) + timedelta(days=7),
            "initial_max_price": 500000.00,
            "terms": {
                "payment_terms": "30% аванс, 70% перед отгрузкой",
                "delivery_conditions": "DDP г. Екатеринбург",
                "warranty": "12 месяцев с момента ввода в эксплуатацию",
                "validity_days": 30,
            },
        },
        {
            "number": "T-2024-002",
            "title": "Закупка мотор-редукторов",
            "customer": "ПАО 'Нефтегаз'",
            "description": "Комплексная поставка",
            "source": TenderSource.MANUAL,
            "deadline_at": datetime.now(timezone.utc) + timedelta(days=14),
            "initial_max_price": 1200000.00,
            "terms": {
                "payment_terms": "100% постоплата 30 дней",
                "delivery_conditions": "EXW г. Челябинск",
                "warranty": "24 месяца",
                "validity_days": 60,
            },
        },
        {
            "number": "T-2024-003",
            "title": "Ремонт привода конвейера",
            "customer": "ЗАО 'Горнодобывающая компания'",
            "description": "Услуги по ремонту",
            "source": TenderSource.SBERBANK_AST,
            "deadline_at": datetime.now(timezone.utc) + timedelta(days=3),
            "initial_max_price": 150000.00,
            "terms": {
                "payment_terms": "50% аванс, 50% по факту работ",
                "delivery_conditions": "Работы на объекте Заказчика",
                "warranty": "6 месяцев на выполненные работы",
                "validity_days": 14,
            },
        },
    ]

    for t_data in demos:
        tender = Tender(**t_data, stage_id=discovered_stage.id)
        db.add(tender)
        await db.flush()

        for i in range(1, 4):
            pos = Position(
                tender_id=tender.id,
                name=f"Позиция {i} для {tender.number}",
                quantity=i * 2,
                unit="шт",
                price_per_unit=1000.00,
                status=PositionStatus.NEW,
            )
            db.add(pos)

    await db.commit()


async def init_users(db: AsyncSession):
    admin_email = "admin@example.com"
    admin = await UserService.get_by_email(db, admin_email)
    if not admin:
        admin_in = UserCreate(
            email=admin_email,
            password="admin",
            is_superuser=True,
            full_name="Admin User",
        )
        await UserService.create(db, obj_in=admin_in)
        logger.info(f"Admin user created: {admin_email}")
    else:
        logger.info(f"Admin user already exists: {admin_email}")


async def main():
    async with AsyncSessionLocal() as db:
        logger.info("Initializing Stages...")
        stages = await init_stages(db)

        logger.info("Initializing Transitions...")
        await init_transitions(db, stages)

        logger.info("Initializing Demo Data (Tenders & Positions)...")
        await init_tenders(db, stages)

        logger.info("Initializing Users...")
        await init_users(db)

        logger.info("Seed data initialization completed.")


if __name__ == "__main__":
    asyncio.run(main())
