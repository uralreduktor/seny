# Описание сущностей системы

## Обзор

Данный документ описывает основные сущности (entities) системы TenderFlow KB AI и их взаимосвязи.

## Основные сущности

### Tender (Тендер)

**Описание**: Основная сущность, представляющая тендерную закупку.

**Атрибуты**:
- `id` (int) — уникальный идентификатор
- `number` (str) — номер тендера
- `title` (str) — название тендера
- `customer` (str) — заказчик
- `deadline` (datetime) — дедлайн подачи предложения
- `budget` (Decimal) — бюджет закупки
- `stage` (str) — текущая стадия жизненного цикла
- `responsible_id` (int) — ID ответственного пользователя
- `source` (str) — источник тендера (ЕИС, Сбербанк-АСТ и т.д.)
- `created_at` (datetime) — дата создания
- `updated_at` (datetime) — дата обновления

**Связи**:
- Имеет множество расчётов (Calculations)
- Имеет множество документов (Documents)
- Имеет множество задач (Tasks)

---

### Calculation (Расчёт стоимости)

**Описание**: Расчёт стоимости оборудования или позиции для тендера.

**Атрибуты**:
- `id` (int) — уникальный идентификатор
- `title` (str) — название расчёта
- `equipment_type` (str) — тип оборудования (редуктор, мотор-редуктор, шестерня)
- `parameters` (JSON) — параметры оборудования (мощность, передаточное число и т.д.)
- `materials` (JSON) — список материалов и их стоимость
- `labor_costs` (JSON) — трудозатраты по операциям
- `overhead` (Decimal) — накладные расходы (коэффициент)
- `margin` (Decimal) — маржа (коэффициент)
- `total_cost` (Decimal) — итоговая стоимость
- `tender_id` (int) — связь с тендером
- `author_id` (int) — ID автора расчёта
- `embedding` (Vector) — векторное представление для поиска
- `status` (str) — статус (черновик, утверждён, использован)
- `created_at` (datetime) — дата создания
- `updated_at` (datetime) — дата обновления

**Связи**:
- Принадлежит тендеру (Tender)
- Имеет множество чертежей (Drawings)
- Используется для генерации документов (Documents)

---

### Drawing (Чертеж)

**Описание**: Чертеж или техническая документация, прикреплённая к расчёту.

**Атрибуты**:
- `id` (int) — уникальный идентификатор
- `calculation_id` (int) — связь с расчётом
- `file_path` (str) — путь к файлу в MinIO
- `file_type` (str) — тип файла (PDF, DWG, STEP)
- `file_size` (int) — размер файла в байтах
- `extracted_parameters` (JSON) — извлечённые параметры через OCR
- `ocr_status` (str) — статус OCR обработки (pending, processing, completed, failed)
- `ocr_task_id` (str) — ID задачи Celery для OCR
- `created_at` (datetime) — дата загрузки

**Связи**:
- Принадлежит расчёту (Calculation)

---

### Document (Документ)

**Описание**: Документ, связанный с тендером (ТКП, формы заказчика и т.д.).

**Атрибуты**:
- `id` (int) — уникальный идентификатор
- `template_id` (int) — ID шаблона (если использовался)
- `tender_id` (int) — связь с тендером
- `calculation_id` (int) — связь с расчётом (если применимо)
- `type` (str) — тип документа (ТКП, форма заказчика, прочее)
- `file_path` (str) — путь к файлу в MinIO
- `version` (int) — версия документа
- `signed` (bool) — подписан ли документ
- `signature_path` (str) — путь к файлу подписи
- `created_at` (datetime) — дата создания
- `updated_at` (datetime) — дата обновления

**Связи**:
- Принадлежит тендеру (Tender)
- Может быть связан с расчётом (Calculation)
- Может использовать шаблон (DocumentTemplate)

---

### DocumentTemplate (Шаблон документа)

**Описание**: Шаблон документа для автозаполнения (формы заказчиков, шаблоны ТКП).

**Атрибуты**:
- `id` (int) — уникальный идентификатор
- `name` (str) — название шаблона
- `type` (str) — тип шаблона (форма заказчика, ТКП, прочее)
- `customer` (str) — заказчик (если применимо)
- `file_path` (str) — путь к файлу шаблона в MinIO
- `file_type` (str) — тип файла (Word, Excel, PDF)
- `fields` (JSON) — разметка полей для автозаполнения
- `version` (int) — версия шаблона
- `is_active` (bool) — активен ли шаблон
- `created_at` (datetime) — дата создания
- `updated_at` (datetime) — дата обновления

**Связи**:
- Используется для создания документов (Documents)

---

### Task (Задача)

**Описание**: Задача, связанная с тендером.

**Атрибуты**:
- `id` (int) — уникальный идентификатор
- `tender_id` (int) — связь с тендером
- `title` (str) — название задачи
- `description` (str) — описание задачи
- `assignee_id` (int) — ID исполнителя
- `creator_id` (int) — ID создателя задачи
- `status` (str) — статус (pending, in_progress, completed, cancelled)
- `priority` (str) — приоритет (low, medium, high, critical)
- `due_date` (datetime) — срок выполнения
- `completed_at` (datetime) — дата завершения
- `created_at` (datetime) — дата создания
- `updated_at` (datetime) — дата обновления

**Связи**:
- Принадлежит тендеру (Tender)

---

### User (Пользователь)

**Описание**: Пользователь системы.

**Атрибуты**:
- `id` (int) — уникальный идентификатор
- `email` (str) — email (уникальный)
- `password_hash` (str) — хеш пароля
- `full_name` (str) — полное имя
- `role` (str) — роль (admin, manager, engineer, readonly)
- `is_active` (bool) — активен ли пользователь
- `created_at` (datetime) — дата регистрации
- `updated_at` (datetime) — дата обновления

**Связи**:
- Создаёт расчёты (Calculations)
- Назначается ответственным за тендеры (Tenders)
- Выполняет задачи (Tasks)

---

### DocumentPackage (Пакет документов)

**Описание**: Комплект документов для подачи на ЭТП.

**Атрибуты**:
- `id` (int) — уникальный идентификатор
- `tender_id` (int) — связь с тендером
- `documents` (JSON) — список ID документов в пакете
- `zip_path` (str) — путь к zip-архиву в MinIO
- `status` (str) — статус (preparing, ready, sent)
- `created_at` (datetime) — дата создания
- `updated_at` (datetime) — дата обновления

**Связи**:
- Принадлежит тендеру (Tender)
- Содержит множество документов (Documents)

---

## Диаграмма связей

```
User
  ├── создаёт → Calculation
  ├── назначается → Tender (responsible)
  └── выполняет → Task

Tender
  ├── имеет → Calculation (множество)
  ├── имеет → Document (множество)
  ├── имеет → Task (множество)
  └── имеет → DocumentPackage

Calculation
  ├── принадлежит → Tender
  ├── имеет → Drawing (множество)
  └── используется для → Document

Drawing
  └── принадлежит → Calculation

Document
  ├── принадлежит → Tender
  ├── может использовать → Calculation
  ├── может использовать → DocumentTemplate
  └── входит в → DocumentPackage

DocumentTemplate
  └── используется для → Document

Task
  └── принадлежит → Tender
```

---

**Связанные документы:**
- [Архитектура системы](../architecture/system_architecture.md)
- [Модели данных](../architecture/data_models.md)
- [API документация](../development/api_docs.md)

