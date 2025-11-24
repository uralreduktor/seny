# Модели данных

## Обзор

Данный документ описывает структуру базы данных и модели данных системы TenderFlow KB AI.

## Технологии

- **СУБД**: PostgreSQL 16
- **Расширение**: pgvector 0.7+ (для векторного поиска)
- **ORM**: SQLAlchemy 2.0+ (async)

## Схема базы данных

### Основные таблицы

#### users (Пользователи)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- admin, manager, engineer, readonly
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### tenders (Тендеры)

```sql
CREATE TABLE tenders (
    id SERIAL PRIMARY KEY,
    number VARCHAR(100) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    customer VARCHAR(255) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    budget DECIMAL(15, 2),
    stage VARCHAR(50) NOT NULL,
    responsible_id INTEGER REFERENCES users(id),
    source VARCHAR(100), -- ЕИС, Сбербанк-АСТ, Росэлторг и т.д.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenders_stage ON tenders(stage);
CREATE INDEX idx_tenders_responsible ON tenders(responsible_id);
CREATE INDEX idx_tenders_deadline ON tenders(deadline);
CREATE INDEX idx_tenders_customer ON tenders(customer);
```

#### calculations (Расчёты стоимости)

```sql
CREATE TABLE calculations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(100) NOT NULL, -- редуктор, мотор-редуктор, шестерня
    parameters JSONB NOT NULL, -- мощность, передаточное число и т.д.
    materials JSONB NOT NULL, -- список материалов
    labor_costs JSONB NOT NULL, -- трудозатраты
    overhead DECIMAL(5, 4) NOT NULL, -- коэффициент накладных расходов
    margin DECIMAL(5, 4) NOT NULL, -- коэффициент маржи
    total_cost DECIMAL(15, 2) NOT NULL,
    tender_id INTEGER REFERENCES tenders(id),
    author_id INTEGER REFERENCES users(id) NOT NULL,
    embedding vector(3072), -- векторное представление для поиска
    status VARCHAR(50) DEFAULT 'draft', -- draft, approved, used
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calculations_tender ON calculations(tender_id);
CREATE INDEX idx_calculations_author ON calculations(author_id);
CREATE INDEX idx_calculations_equipment_type ON calculations(equipment_type);
CREATE INDEX idx_calculations_embedding ON calculations USING ivfflat (embedding vector_cosine_ops);
```

#### drawings (Чертежи)

```sql
CREATE TABLE drawings (
    id SERIAL PRIMARY KEY,
    calculation_id INTEGER REFERENCES calculations(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL, -- путь в MinIO
    file_type VARCHAR(50) NOT NULL, -- PDF, DWG, STEP
    file_size BIGINT NOT NULL,
    extracted_parameters JSONB, -- извлечённые параметры через OCR
    ocr_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    ocr_task_id VARCHAR(100), -- ID задачи Celery
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drawings_calculation ON drawings(calculation_id);
CREATE INDEX idx_drawings_ocr_status ON drawings(ocr_status);
```

#### document_templates (Шаблоны документов)

```sql
CREATE TABLE document_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- форма заказчика, ТКП, прочее
    customer VARCHAR(255), -- заказчик (если применимо)
    file_path VARCHAR(500) NOT NULL, -- путь в MinIO
    file_type VARCHAR(50) NOT NULL, -- Word, Excel, PDF
    fields JSONB NOT NULL, -- разметка полей для автозаполнения
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_type ON document_templates(type);
CREATE INDEX idx_templates_customer ON document_templates(customer);
CREATE INDEX idx_templates_active ON document_templates(is_active);
```

#### documents (Документы)

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES document_templates(id),
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    calculation_id INTEGER REFERENCES calculations(id),
    type VARCHAR(100) NOT NULL, -- ТКП, форма заказчика, прочее
    file_path VARCHAR(500) NOT NULL, -- путь в MinIO
    version INTEGER DEFAULT 1,
    signed BOOLEAN DEFAULT FALSE,
    signature_path VARCHAR(500), -- путь к файлу подписи
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_tender ON documents(tender_id);
CREATE INDEX idx_documents_calculation ON documents(calculation_id);
CREATE INDEX idx_documents_type ON documents(type);
```

#### tasks (Задачи)

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignee_id INTEGER REFERENCES users(id),
    creator_id INTEGER REFERENCES users(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_tender ON tasks(tender_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

#### document_packages (Пакеты документов)

```sql
CREATE TABLE document_packages (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    documents JSONB NOT NULL, -- массив ID документов
    zip_path VARCHAR(500), -- путь к zip-архиву в MinIO
    status VARCHAR(50) DEFAULT 'preparing', -- preparing, ready, sent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_packages_tender ON document_packages(tender_id);
CREATE INDEX idx_packages_status ON document_packages(status);
```

## SQLAlchemy модели (Python)

### Пример модели Calculation

```python
from sqlalchemy import Column, Integer, String, Decimal, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import relationship
from app.db.base import Base

class Calculation(Base):
    __tablename__ = "calculations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    equipment_type = Column(String(100), nullable=False)
    parameters = Column(JSONB, nullable=False)
    materials = Column(JSONB, nullable=False)
    labor_costs = Column(JSONB, nullable=False)
    overhead = Column(Decimal(5, 4), nullable=False)
    margin = Column(Decimal(5, 4), nullable=False)
    total_cost = Column(Decimal(15, 2), nullable=False)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    embedding = Column(Vector(3072), nullable=True)
    status = Column(String(50), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tender = relationship("Tender", back_populates="calculations")
    author = relationship("User", foreign_keys=[author_id])
    drawings = relationship("Drawing", back_populates="calculation", cascade="all, delete-orphan")
```

## Миграции

Миграции базы данных управляются через Alembic:

```bash
# Создание новой миграции
alembic revision --autogenerate -m "Add calculations table"

# Применение миграций
alembic upgrade head

# Откат миграции
alembic downgrade -1
```

## Индексы для производительности

### Векторный поиск

Для эффективного векторного поиска используется индекс IVFFlat:

```sql
CREATE INDEX idx_calculations_embedding ON calculations 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

### Полнотекстовый поиск

Для поиска по текстовым полям используется полнотекстовый поиск PostgreSQL:

```sql
CREATE INDEX idx_tenders_title_fts ON tenders 
USING gin(to_tsvector('russian', title));
```

## Связанные документы

- [Архитектура системы](./system_architecture.md)
- [Описание сущностей](../functional/entities.md)
- [Миграции БД](../development/database_migrations.md)

