# Инструкции по установке и настройке

## Требования к окружению

### Минимальные требования

- **ОС**: Linux (Ubuntu 22.04+), macOS, или Windows с WSL2
- **Python**: 3.11 или выше
- **Node.js**: 18 или выше
- **Docker**: 20.10 или выше
- **Docker Compose**: 2.0 или выше
- **Git**: 2.30 или выше

### Рекомендуемые требования

- **ОС**: Linux (Ubuntu 22.04+)
- **RAM**: 8 GB минимум, 16 GB рекомендуется
- **CPU**: 4 ядра минимум
- **Диск**: 20 GB свободного места

## Быстрый старт (Docker Compose)

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd seny
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите необходимые значения:

```env
# Database
POSTGRES_USER=seny
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=seny_db

# Redis
REDIS_PASSWORD=your_redis_password

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your_minio_password

# API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# JWT
SECRET_KEY=your_secret_key_here
```

### 3. Запуск через Docker Compose

```bash
docker-compose up -d
```

Это запустит все необходимые сервисы:
- PostgreSQL с pgvector
- Redis
- MinIO
- Backend (FastAPI)
- Frontend (React)

### 4. Проверка работы

- Backend API: http://localhost:8000
- API документация: http://localhost:8000/docs
- Frontend: http://localhost:3000
- MinIO Console: http://localhost:9001

## Ручная установка (Development)

### Backend

#### 1. Создание виртуального окружения

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate  # Linux/macOS
# или
venv\Scripts\activate  # Windows
```

#### 2. Установка зависимостей

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 3. Настройка базы данных

Убедитесь, что PostgreSQL запущен и установлено расширение pgvector:

```bash
# Подключение к PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE seny_db;

# Подключение к базе
\c seny_db

# Установка расширения pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 4. Настройка переменных окружения

Создайте файл `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/seny_db
REDIS_URL=redis://localhost:6379/0
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=seny-files
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
SECRET_KEY=your_secret_key
```

#### 5. Применение миграций

```bash
alembic upgrade head
```

#### 6. Запуск backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

#### 1. Установка зависимостей

```bash
cd frontend
npm install
```

#### 2. Настройка переменных окружения

Создайте файл `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

#### 3. Запуск frontend

```bash
npm run dev
```

Frontend будет доступен по адресу http://localhost:5173

## Генерация API клиента

После запуска backend, сгенерируйте TypeScript клиент из OpenAPI спецификации:

```bash
cd frontend
npm run generate-api
```

Подробнее см. [openapi-generator.md](../openapi-generator.md)

## Инициализация данных

### Создание первого пользователя (администратора)

```bash
cd backend
python scripts/create_admin.py
```

Или через API:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure_password",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

### Загрузка тестовых данных (опционально)

```bash
cd backend
python scripts/load_test_data.py
```

## Проверка установки

### Backend

1. Проверьте доступность API:
```bash
curl http://localhost:8000/health
```

2. Откройте Swagger документацию:
http://localhost:8000/docs

### Frontend

1. Откройте http://localhost:5173
2. Попробуйте авторизоваться
3. Проверьте работу основных функций

### База данных

```bash
psql -U postgres -d seny_db -c "SELECT version();"
psql -U postgres -d seny_db -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### Redis

```bash
redis-cli ping
# Должен вернуть: PONG
```

### MinIO

1. Откройте http://localhost:9001
2. Войдите с учётными данными из `.env`
3. Проверьте наличие bucket `seny-files`

## Решение проблем

### Проблема: PostgreSQL не запускается

**Решение**:
- Проверьте, что порт 5432 не занят другим процессом
- Убедитесь, что PostgreSQL установлен и запущен
- Проверьте логи: `docker-compose logs postgres`

### Проблема: pgvector не установлен

**Решение**:
```bash
# В контейнере PostgreSQL
docker-compose exec postgres psql -U seny -d seny_db -c "CREATE EXTENSION vector;"
```

### Проблема: Backend не может подключиться к БД

**Решение**:
- Проверьте `DATABASE_URL` в `.env`
- Убедитесь, что PostgreSQL запущен
- Проверьте сетевые настройки Docker

### Проблема: Frontend не может подключиться к API

**Решение**:
- Проверьте `VITE_API_URL` в `frontend/.env`
- Убедитесь, что backend запущен
- Проверьте CORS настройки в backend

### Проблема: Ошибки при генерации API клиента

**Решение**:
- Убедитесь, что backend запущен
- Проверьте доступность `http://localhost:8000/openapi.json`
- Удалите `frontend/src/api/generated` и запустите генерацию заново

## Дополнительные настройки

### Настройка IDE

#### VS Code / Cursor

Рекомендуемые расширения:
- Python
- Pylance
- ESLint
- Prettier
- Docker

Настройки для Python (`.vscode/settings.json`):
```json
{
  "python.linting.enabled": true,
  "python.linting.mypyEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true
}
```

### Настройка pre-commit hooks

```bash
pip install pre-commit
pre-commit install
```

## Следующие шаги

После успешной установки:

1. Изучите [API документацию](./api_docs.md)
2. Прочитайте [стандарты кодирования](./coding_standards.md)
3. Ознакомьтесь с [архитектурой системы](../architecture/system_architecture.md)
4. Начните разработку согласно [руководству по разработке](./backend_guide.md)

---

**Связанные документы:**
- [Архитектура системы](../architecture/system_architecture.md)
- [Стандарты кодирования](./coding_standards.md)
- [API документация](./api_docs.md)

