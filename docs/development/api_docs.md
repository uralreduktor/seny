# API Документация

## Обзор

API системы TenderFlow KB AI построен на FastAPI и следует RESTful принципам. Все эндпоинты версионированы через префикс `/api/v1/`.

## Базовый URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.tenderflow.example.com`

## Аутентификация

Большинство эндпоинтов требуют аутентификации через JWT токены.

### Получение токена

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Использование токена

Добавьте заголовок `Authorization` к запросам:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Версионирование API

- Текущая версия: `v1`
- Префикс всех эндпоинтов: `/api/v1/`
- При breaking changes создаётся новая версия: `/api/v2/`

## Формат ответов

### Успешный ответ

```json
{
  "data": { ... },
  "message": "Success"
}
```

### Ошибка

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

### Коды статусов HTTP

- `200 OK` — успешный запрос
- `201 Created` — ресурс создан
- `400 Bad Request` — неверный запрос
- `401 Unauthorized` — требуется аутентификация
- `403 Forbidden` — недостаточно прав
- `404 Not Found` — ресурс не найден
- `422 Unprocessable Entity` — ошибка валидации
- `500 Internal Server Error` — внутренняя ошибка сервера

## Модуль: Управление торгами

### Тендеры

#### Получить список тендеров

```http
GET /api/v1/tenders
Authorization: Bearer {token}
```

**Параметры запроса**:
- `page` (int, default: 1) — номер страницы
- `page_size` (int, default: 20) — размер страницы
- `stage` (str, optional) — фильтр по стадии
- `responsible_id` (int, optional) — фильтр по ответственному
- `search` (str, optional) — поиск по названию/номеру

**Ответ**:
```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "number": "ТЕНДЕР-2025-001",
        "title": "Поставка редукторов",
        "customer": "ООО Заказчик",
        "deadline": "2025-02-15T10:00:00Z",
        "budget": 5000000.00,
        "stage": "В работе",
        "responsible_id": 2,
        "created_at": "2025-01-10T08:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

#### Получить детали тендера

```http
GET /api/v1/tenders/{id}
Authorization: Bearer {token}
```

#### Создать тендер

```http
POST /api/v1/tenders
Authorization: Bearer {token}
Content-Type: application/json

{
  "number": "ТЕНДЕР-2025-001",
  "title": "Поставка редукторов",
  "customer": "ООО Заказчик",
  "deadline": "2025-02-15T10:00:00Z",
  "budget": 5000000.00,
  "stage": "Обнаружен"
}
```

#### Обновить тендер

```http
PUT /api/v1/tenders/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "stage": "В работе",
  "responsible_id": 2
}
```

### Канбан

#### Получить данные для канбан-доски

```http
GET /api/v1/kanban
Authorization: Bearer {token}
```

**Ответ**:
```json
{
  "data": {
    "stages": [
      {
        "name": "Обнаружен",
        "tenders": [...]
      },
      {
        "name": "В работе",
        "tenders": [...]
      }
    ]
  }
}
```

## Модуль: База знаний по ценообразованию

### Расчёты

#### Получить список расчётов

```http
GET /api/v1/calculations
Authorization: Bearer {token}
```

**Параметры запроса**:
- `equipment_type` (str, optional) — тип оборудования
- `tender_id` (int, optional) — фильтр по тендеру
- `search` (str, optional) — поиск по параметрам

#### Создать расчёт

```http
POST /api/v1/calculations
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Расчёт стоимости редуктора",
  "equipment_type": "редуктор",
  "parameters": {
    "power": 5.0,
    "gear_ratio": 50,
    "type": "червячный"
  },
  "materials": [...],
  "labor_costs": [...],
  "overhead": 0.15,
  "margin": 0.20,
  "tender_id": 1
}
```

### Поиск

#### Поиск похожих расчётов (векторный)

```http
POST /api/v1/search/similar
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "червячный редуктор i=50 мощность 5 кВт",
  "limit": 5
}
```

**Ответ**:
```json
{
  "data": {
    "results": [
      {
        "calculation": { ... },
        "similarity": 0.95,
        "explanation": "Совпадение по типу редуктора и передаточному числу"
      }
    ]
  }
}
```

### OCR

#### Обработка чертежа

```http
POST /api/v1/ocr/process
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <чертеж.pdf>
calculation_id: 1
```

**Ответ**:
```json
{
  "data": {
    "task_id": "ocr-task-123",
    "status": "processing"
  }
}
```

#### Получить статус задачи OCR

```http
GET /api/v1/ocr/tasks/{task_id}
Authorization: Bearer {token}
```

### AI-ассистент

#### Запрос к AI-ассистенту

```http
POST /api/v1/ai/assistant/query
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "Проверь мой расчёт на ошибки",
  "calculation_id": 1
}
```

**Ответ**:
```json
{
  "data": {
    "answer": "Ваш расчёт выглядит корректно...",
    "suggestions": [...],
    "similar_calculations": [...]
  }
}
```

## Модуль: Подготовка документации

### Генерация ТКП

#### Создать задачу генерации ТКП

```http
POST /api/v1/tkp/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "tender_id": 1,
  "calculation_id": 1,
  "template_id": 1
}
```

**Ответ**:
```json
{
  "data": {
    "task_id": "tkp-task-456",
    "status": "processing"
  }
}
```

#### Получить статус генерации

```http
GET /api/v1/tkp/tasks/{task_id}
Authorization: Bearer {token}
```

#### Скачать ТКП

```http
GET /api/v1/tkp/{id}/download
Authorization: Bearer {token}
```

### Автозаполнение форм

#### Заполнить форму автоматически

```http
POST /api/v1/documents/fill
Authorization: Bearer {token}
Content-Type: application/json

{
  "template_id": 2,
  "tender_id": 1,
  "calculation_id": 1
}
```

### Комплектование пакета

#### Создать пакет документов

```http
POST /api/v1/packages/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "tender_id": 1,
  "documents": [1, 2, 3, 4]
}
```

#### Скачать пакет

```http
GET /api/v1/packages/{id}/download
Authorization: Bearer {token}
```

## Интерактивная документация

### Swagger UI

Доступна по адресу: `http://localhost:8000/docs`

Позволяет:
- Просматривать все эндпоинты
- Тестировать API прямо в браузере
- Видеть схемы данных (Pydantic модели)
- Авторизоваться через UI

### ReDoc

Доступна по адресу: `http://localhost:8000/redoc`

Альтернативный формат документации с улучшенной читаемостью.

## Генерация клиентов

TypeScript клиенты генерируются автоматически из OpenAPI спецификации. Подробнее см. [openapi-generator.md](../openapi-generator.md).

## Rate Limiting

API имеет ограничения на количество запросов:
- **Анонимные**: 10 запросов/минуту
- **Аутентифицированные**: 100 запросов/минуту
- **AI эндпоинты**: 20 запросов/минуту

При превышении лимита возвращается `429 Too Many Requests`.

## Webhooks (планируется)

Для интеграции с внешними системами планируется поддержка webhooks для событий:
- Изменение статуса тендера
- Завершение генерации ТКП
- Завершение обработки OCR

---

**Связанные документы:**
- [OpenAPI Generator](../openapi-generator.md)
- [Архитектура системы](../architecture/system_architecture.md)
- [Разработка backend](./backend_guide.md)

