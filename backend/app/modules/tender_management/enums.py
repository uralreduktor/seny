from enum import Enum


class StageCode(str, Enum):
    """Коды стадий тендера (фиксированные значения)"""

    DISCOVERED = "discovered"  # Обнаружен
    REVIEWING = "reviewing"  # На рассмотрении
    IN_PROGRESS = "in_progress"  # В работе
    CALCULATING = "calculating"  # Расчёт стоимости
    PREPARING_DOCS = "preparing_docs"  # Подготовка документов
    SUBMITTED = "submitted"  # Подача
    AWAITING_RESULTS = "awaiting_results"  # Ожидание результатов
    WON = "won"  # Выигран
    LOST = "lost"  # Проигран
    CANCELLED = "cancelled"  # Отменён


class PositionStatus(str, Enum):
    """Статусы позиции"""

    NEW = "new"  # Новая
    NOMENCLATURE_ASSIGNED = "nomenclature_assigned"  # Назначена номенклатура
    CALCULATING = "calculating"  # В расчёте
    CALCULATED = "calculated"  # Рассчитано
    VERIFIED = "verified"  # Проверено инженером
    TRANSFERRED = "transferred"  # Передано менеджеру
    IN_PROPOSAL = "in_proposal"  # В КП


class CalculationStatus(str, Enum):
    """Статусы расчёта позиции"""

    NOT_ASSIGNED = "not_assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CLARIFICATION_NEEDED = "clarification_needed"


class TaskType(str, Enum):
    """Типы задач"""

    TECHNICAL = "technical"  # Технические
    DOCUMENTARY = "documentary"  # Документальные
    ADMINISTRATIVE = "administrative"  # Административные
    OTHER = "other"


class TaskStatus(str, Enum):
    """Статусы задач"""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    """Приоритеты задач"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FileCategory(str, Enum):
    """Категории файлов тендера"""

    SPECIFICATION = "specification"  # ТЗ
    COMMERCIAL = "commercial"  # Коммерческие требования
    CORRESPONDENCE = "correspondence"  # Переписка
    CLARIFICATION = "clarification"  # Разъяснения
    OTHER = "other"


class NotificationType(str, Enum):
    """Типы уведомлений"""

    DEADLINE_7_DAYS = "deadline_7_days"
    DEADLINE_3_DAYS = "deadline_3_days"
    DEADLINE_1_DAY = "deadline_1_day"
    DEADLINE_HOURS = "deadline_hours"
    ASSIGNED_RESPONSIBLE = "assigned_responsible"
    ASSIGNED_ENGINEER = "assigned_engineer"
    STAGE_CHANGED = "stage_changed"
    NEW_TASK = "new_task"
    TASK_OVERDUE = "task_overdue"
    TENDER_WON = "tender_won"
    TENDER_LOST = "tender_lost"


class AuditAction(str, Enum):
    """Действия для аудит-лога"""

    CREATED = "created"
    UPDATED = "updated"
    STAGE_CHANGED = "stage_changed"
    RESPONSIBLE_ASSIGNED = "responsible_assigned"
    ENGINEER_ASSIGNED = "engineer_assigned"
    POSITION_ADDED = "position_added"
    POSITION_UPDATED = "position_updated"
    POSITION_DELETED = "position_deleted"
    FILE_UPLOADED = "file_uploaded"
    FILE_DELETED = "file_deleted"
    TASK_CREATED = "task_created"
    TASK_COMPLETED = "task_completed"
    CALCULATION_CREATED = "calculation_created"
    PROPOSAL_GENERATED = "proposal_generated"


class TenderSource(str, Enum):
    """Источники тендеров"""

    EIS = "eis"  # ЕИС (zakupki.gov.ru)
    SBERBANK_AST = "sberbank_ast"
    ROSELTORG = "roseltorg"
    MANUAL = "manual"  # Ручной ввод
