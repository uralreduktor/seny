# Диаграммы архитектуры

## Обзор

В этой папке хранятся диаграммы архитектуры системы TenderFlow KB AI в различных форматах.

## Форматы диаграмм

- **PlantUML** (`.puml`) — для UML диаграмм (классы, последовательности, компонентов)
- **Mermaid** (`.mmd` или встроенные в Markdown) — для простых диаграмм
- **Draw.io** (`.drawio`) — для сложных диаграмм (экспорт в SVG/PNG)

## Планируемые диаграммы

### Архитектурные диаграммы

1. **system_overview.puml** — общая архитектура системы
2. **component_diagram.puml** — диаграмма компонентов
3. **deployment_diagram.puml** — диаграмма развёртывания

### Диаграммы модулей

4. **tender_management_flow.puml** — поток данных модуля управления торгами
5. **pricing_kb_ai_flow.puml** — поток данных модуля базы знаний
6. **docflow_flow.puml** — поток данных модуля подготовки документации

### Диаграммы данных

7. **database_schema.puml** — схема базы данных
8. **entity_relationship.puml** — ER-диаграмма

### Диаграммы AI компонентов

9. **rag_pipeline.puml** — RAG pipeline
10. **ocr_pipeline.puml** — OCR pipeline

### Диаграммы последовательности

11. **search_similar_sequence.puml** — последовательность поиска похожих расчётов
12. **generate_tkp_sequence.puml** — последовательность генерации ТКП
13. **ocr_processing_sequence.puml** — последовательность обработки чертежа

## Инструменты для просмотра

### PlantUML

- **VS Code**: Расширение "PlantUML"
- **Онлайн**: http://www.plantuml.com/plantuml/uml/
- **CLI**: `plantuml diagram.puml`

### Mermaid

- **VS Code**: Расширение "Markdown Preview Mermaid Support"
- **Онлайн**: https://mermaid.live/
- **Встроенный в Markdown**: Поддерживается GitHub и многими редакторами

### Draw.io

- **Онлайн**: https://app.diagrams.net/
- **Desktop**: https://github.com/jgraph/drawio-desktop

## Конвенции именования

- Используйте описательные имена файлов
- Префикс типа диаграммы: `flow_`, `sequence_`, `component_`, `er_`
- Примеры: `flow_tender_management.puml`, `sequence_search_similar.puml`

## Обновление диаграмм

Диаграммы должны обновляться при изменении архитектуры системы. Обязательно обновляйте диаграммы при:
- Добавлении новых компонентов
- Изменении потоков данных
- Изменении структуры БД

---

**Примечание**: Диаграммы будут добавлены по мере разработки проекта.

