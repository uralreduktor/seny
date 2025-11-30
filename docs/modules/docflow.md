# Модуль DocFlow (Подготовка документации)

> **🤖 Для AI-разработчика**: Этот модуль отвечает за генерацию файлов (PDF/DOCX) и управление шаблонами.
>
> 1. **Jinja2**: Используется для рендеринга шаблонов (`docx-template` или `python-docx`).
> 2. **Async Generation**: Генерация документов — это тяжелая задача. **Всегда** используй Celery.
> 3. **Storage**: Готовые файлы хранятся в MinIO, в БД только ссылки (`file_path`).
> 4. **Digital Signature**: Подпись через КриптоПро/Рутокен происходит на клиенте (Frontend), сервер только хранит `signature_path` и публичный сертификат.

## 📋 Quick Reference

| Параметр       | Значение                                                     |
| -------------- | ------------------------------------------------------------ |
| **Path**       | `backend/app/modules/docflow/`                               |
| **API Prefix** | `/api/v1/documents`, `/api/v1/templates`, `/api/v1/packages` |
| **DB Tables**  | `document_templates`, `documents`, `document_packages`       |
| **Service**    | `DocumentService`, `TemplateService`, `PackageService`       |
| **Libs**       | `docxtpl` (DOCX), `weasyprint` (PDF), `python-docx`          |

---

## 📁 Файловая структура

```text
backend/app/modules/docflow/
├── __init__.py
├── models/
│   ├── __init__.py
│   ├── template.py      # DocumentTemplate
│   ├── document.py      # Document
│   └── package.py       # DocumentPackage
├── schemas/
│   ├── __init__.py
│   ├── template.py      # Pydantic schemas
│   ├── document.py
│   └── package.py
├── services/
│   ├── __init__.py
│   ├── template_service.py
│   ├── document_service.py
│   ├── generator_service.py  # Логика заполнения docx/pdf
│   └── package_service.py
├── routers/
│   ├── __init__.py
│   ├── templates.py
│   ├── documents.py
│   └── packages.py
└── utils/
    └── jinja_filters.py      # Форматирование дат, валют, сумм прописью
```

---

## 📊 Модели данных (SQLAlchemy)

### DocumentTemplate

```python
# backend/app/modules/docflow/models/template.py

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import DateTime

from app.db.base import Base

class DocumentTemplate(Base):
    """Шаблон документа (Jinja2-размеченный docx/html)"""
    __tablename__ = "document_templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # 'tkp', 'contract', 'act'
    customer: Mapped[Optional[str]] = mapped_column(String(255)) # Для специфичных шаблонов

    file_path: Mapped[str] = mapped_column(String(500), nullable=False) # MinIO path
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'docx', 'html'
    fields: Mapped[dict] = mapped_column(JSONB, nullable=False) # Метаданные полей для UI

    version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Document

```python
# backend/app/modules/docflow/models/document.py

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import DateTime

from app.db.base import Base

class Document(Base):
    """Сгенерированный документ"""
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    template_id: Mapped[Optional[int]] = mapped_column(ForeignKey("document_templates.id"))
    tender_id: Mapped[int] = mapped_column(ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    calculation_id: Mapped[Optional[int]] = mapped_column(ForeignKey("calculations.id"))

    type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False) # MinIO path
    version: Mapped[int] = mapped_column(Integer, default=1)

    # Подпись
    signed: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    signature_path: Mapped[Optional[str]] = mapped_column(String(500)) # Открепленная подпись (.sig)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    template: Mapped["DocumentTemplate"] = relationship(lazy="joined")
    tender: Mapped["Tender"] = relationship(back_populates="documents")
```

---

## 🔄 Процесс генерации (Celery Pipeline)

1. **Initiate**: Пользователь запрашивает генерацию ТКП.
2. **Queue**: Создается задача `generate_document_task` в Celery.
3. **Data Fetch**: Воркер получает данные Тендера и Расчета.
4. **Prepare Context**: Данные преобразуются в плоский словарь для Jinja2 (форматирование дат, чисел).
5. **Render**:
   - Если `docx`: `docxtpl` заменяет `{{ var }}` в шаблоне.
   - Если `pdf`: рендерится HTML + CSS, затем `WeasyPrint` конвертирует в PDF.
6. **Save**: Файл загружается в MinIO.
7. **DB Update**: Создается запись в таблице `documents`.
8. **Notify**: Отправляется уведомление пользователю (WebSocket/Push).

### Пример контекста для шаблона

```json
{
  "tender": {
    "number": "Т-123",
    "date": "25.11.2025",
    "customer": "ООО Ромашка"
  },
  "items": [
    {
      "name": "Редуктор Ц2У-200",
      "quantity": 2,
      "price": "50 000,00",
      "sum": "100 000,00"
    }
  ],
  "total_sum_words": "Сто тысяч рублей 00 копеек",
  "manager": {
    "fio": "Иванов И.И.",
    "phone": "+7..."
  }
}
```

---

## ✅ Критерии приёмки

### Шаблонизатор

- [ ] Поддержка загрузки `.docx` шаблонов с Jinja2 тегами.
- [ ] Валидация шаблона при загрузке (проверка синтаксиса тегов).
- [ ] Версионирование шаблонов.

### Генератор

- [ ] Асинхронная генерация через Celery.
- [ ] Конвертация `docx` -> `pdf` (LibreOffice в Docker или WeasyPrint).
- [ ] Корректное форматирование валют (разделители тысяч) и дат (русская локаль).
- [ ] "Сумма прописью" (num2words).

### Пакеты (Packages)

- [ ] Создание ZIP-архива из списка документов.
- [ ] Структура папок внутри ZIP (например, `/Техническая часть`, `/Коммерческая часть`).

### Подпись

- [ ] API для загрузки открепленной подписи (`.sig`).
- [ ] Валидация наличия пары "Документ + Подпись".

---

## 🚫 Anti-Patterns (Запрещено)

1. **Sync Generation**: Генерация PDF может занимать секунды. **Никогда** не делай это в основном потоке FastAPI.
2. **Hardcoded Templates**: Не храни шаблоны в коде. Только в MinIO/DB.
3. **Direct File Response**: Не отдавай файлы через FastAPI (кроме мелких). Используй presigned URLs или Nginx `X-Accel-Redirect` для MinIO.
4. **No Versions**: При изменении шаблона старые документы не должны меняться.

---

## 📎 Связанные документы

- [Tender Management](./tender_management.md) — источник данных.
- [Pricing KB AI](./pricing_kb_ai.md) — источник расчетов.
- [API Docs](../development/api_docs.md) — контракты.
