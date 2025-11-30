# 📚 Документация проекта TenderFlow KB AI

Добро пожаловать в документацию проекта **TenderFlow KB AI** — единой корпоративной платформы для полного цикла участия в тендерных закупках.

## 🗂️ Структура документации

### 📋 Обзор проекта

- **[project_brief.md](./project_brief.md)** — Техническое задание на разработку системы
- **[analysis_current_state.md](./analysis_current_state.md)** — Анализ текущего состояния и бизнес-проблемы
- **[overview/project_overview.md](./overview/project_overview.md)** — Обзор проекта, цели, аудитория, модули
- **[overview/glossary.md](./overview/glossary.md)** — Глоссарий терминов и аббревиатур

### 🏗️ Архитектура

- **[architecture/tech_stack.md](./architecture/tech_stack.md)** — Технологический стек, версии, зависимости
- **[architecture/system_architecture.md](./architecture/system_architecture.md)** — Архитектура системы, компоненты, взаимодействия
- **[architecture/ai_components.md](./architecture/ai_components.md)** — AI/ML компоненты (RAG, embeddings, OCR)
- **[architecture/data_models.md](./architecture/data_models.md)** — Модели данных, схемы БД
- **[architecture/diagrams/](./architecture/diagrams/)** — Диаграммы архитектуры (PlantUML, Mermaid)

### 📦 Модули системы

- **[modules/tender_management.md](./modules/tender_management.md)** — Модуль управления торгами
- **[modules/pricing_kb_ai.md](./modules/pricing_kb_ai.md)** — База знаний по ценообразованию с AI
- **[modules/docflow.md](./modules/docflow.md)** — Подготовка тендерной документации

### ⚙️ Функциональные требования

- **[functional/requirements.md](./functional/requirements.md)** — Функциональные и нефункциональные требования
- **[functional/scenarios.md](./functional/scenarios.md)** — Пользовательские сценарии использования
- **[functional/entities.md](./functional/entities.md)** — Описание сущностей системы

### 💻 Разработка

- **[development/setup.md](./development/setup.md)** — Инструкции по установке и настройке окружения
- **[development/coding_standards.md](./development/coding_standards.md)** — Стандарты кодирования (Python, TypeScript)
- **[development/api_docs.md](./development/api_docs.md)** — Документация API (OpenAPI/Swagger)
- **[development/openapi-generator.md](./openapi-generator.md)** — Генерация TypeScript клиентов из OpenAPI
- **[development/frontend_guide.md](./development/frontend_guide.md)** — Руководство по разработке фронтенда
- **[development/backend_guide.md](./development/backend_guide.md)** — Руководство по разработке бэкенда
- **[development/database_migrations.md](./development/database_migrations.md)** — Миграции базы данных

### 🚀 Эксплуатация

- **[operations/deployment.md](./operations/deployment.md)** — Развертывание (Docker, Kubernetes)
- **[operations/monitoring.md](./operations/monitoring.md)** — Мониторинг (Grafana, Prometheus, Loki)
- **[operations/backup_restore.md](./operations/backup_restore.md)** — Резервное копирование и восстановление
- **[operations/maintenance.md](./operations/maintenance.md)** — Обслуживание системы

### 🧪 Тестирование

- **[testing/test_plan.md](./testing/test_plan.md)** — План тестирования
- **[testing/unit_tests.md](./testing/unit_tests.md)** — Unit тесты (Pytest, Vitest)
- **[testing/integration_tests.md](./testing/integration_tests.md)** — Интеграционные тесты
- **[testing/ai_validation.md](./testing/ai_validation.md)** — Валидация AI компонентов (OCR, RAG)

### 📝 История изменений

- **[changelog/CHANGELOG.md](./changelog/CHANGELOG.md)** — История изменений проекта

## 🎯 Быстрый старт

1. **Новые разработчики**: Начните с [overview/project_overview.md](./overview/project_overview.md) и [development/setup.md](./development/setup.md)
2. **Архитекторы**: Изучите [architecture/system_architecture.md](./architecture/system_architecture.md)
3. **Тестировщики**: См. [testing/test_plan.md](./testing/test_plan.md)
4. **DevOps**: См. [operations/deployment.md](./operations/deployment.md)

## 📖 Стандарты документирования

Документация следует стандартам, описанным в `.cursor/rules/04-documentation.mdc`:

- Формат: Markdown (.md)
- Язык: Русский (бизнес-термины), английский (технические термины)
- Версионирование: Git (semantic versioning для ключевых документов)
- Актуальность: Обновление при каждом PR
- **Автоматическая проверка**: Pre-commit hooks проверяют форматирование, ссылки и правила проекта (см. [docs/development/docs_validation.md](./development/docs_validation.md))

## 🔍 Поиск документации

- **По модулю**: См. раздел [Модули системы](#-модули-системы)
- **По технологии**: См. [architecture/tech_stack.md](./architecture/tech_stack.md)
- **По задаче**: Используйте поиск в IDE или GitHub

## 📞 Контакты и поддержка

Для вопросов по документации создавайте Issue в репозитории с меткой `docs`.

---

**Последнее обновление**: 2025-01-XX  
**Версия документации**: 1.0.0
