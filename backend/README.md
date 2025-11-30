# SENY Backend

Backend API for SENY Tender Automation System.

## Stack
- **Python**: 3.11+
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0 (Async)
- **DB**: PostgreSQL + pgvector
- **Task Queue**: Celery + Redis
- **Storage**: MinIO

## Setup

1. Install dependencies:
   ```bash
   poetry install
   ```

2. Create `.env` file:
   ```bash
   cp ../.env.example .env
   ```

3. Run migrations:
   ```bash
   poetry run alembic upgrade head
   ```

4. Start server:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

## Structure
- `app/core`: Settings and config
- `app/db`: Database session and base models
- `app/modules`: Business logic modules (Tender, DocFlow, etc.)
- `app/api`: API Routers
- `migrations`: Alembic migrations
