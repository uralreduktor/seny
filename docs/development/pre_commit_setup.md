# Установка Pre-commit Hooks

## Проблема: externally-managed-environment

Если при установке `pre-commit` вы видите ошибку:

```text
error: externally-managed-environment
```

Это означает, что система защищает системный Python от установки пакетов напрямую (PEP 668).

## ✅ Решение: Использовать Poetry (рекомендуется)

Проект использует Poetry для управления зависимостями, поэтому лучше всего установить pre-commit через Poetry:

### Пошаговая установка для Poetry 2.0.0+

```bash
# 1. Перейти в директорию backend
cd backend

# 2. Добавить pre-commit как dev зависимость (если ещё не добавлен)
poetry add --group dev pre-commit

# 3. Обновить lock файл (если нужно)
poetry lock

# 4. Установить зависимости (включая pre-commit)
poetry install

# 5. Установить hooks через poetry run
poetry run pre-commit install
```

После выполнения этих команд вы увидите:

```text
pre-commit installed at .git/hooks/pre-commit
```

### Использование pre-commit

После установки hooks будут запускаться автоматически при каждом коммите. Для ручного запуска:

```bash
# Из директории backend
cd backend
poetry run pre-commit run --all-files

# Или из корня проекта
poetry run -C backend pre-commit run --all-files
```

### Альтернатива: Активировать окружение

Если хотите использовать команды напрямую без `poetry run`:

```bash
cd backend
poetry env activate  # Активирует окружение
pre-commit install   # Теперь можно использовать напрямую
pre-commit run --all-files
```

После этого pre-commit будет работать в виртуальном окружении Poetry.

## Альтернативные решения

### Вариант 1: pipx (глобальная установка)

```bash
# Установить pipx (если не установлен)
sudo apt install pipx
pipx ensurepath

# Установить pre-commit через pipx
pipx install pre-commit

# Установить hooks
pre-commit install
```

### Вариант 2: Виртуальное окружение

```bash
# Создать виртуальное окружение в корне проекта
python3 -m venv .venv

# Активировать виртуальное окружение
source .venv/bin/activate  # Linux/Mac
# или
.venv\Scripts\activate  # Windows

# Установить pre-commit
pip install pre-commit

# Установить hooks
pre-commit install
```

### Вариант 3: Системный пакет (Ubuntu/Debian)

```bash
sudo apt install pre-commit
pre-commit install
```

> ⚠️ **Внимание**: Версия из системного репозитория может быть устаревшей.

## Проверка установки

После установки проверьте, что pre-commit работает:

```bash
# Из директории backend
cd backend
poetry run pre-commit --version
poetry run pre-commit run --all-files

# Или из корня проекта
poetry run -C backend pre-commit --version
poetry run -C backend pre-commit run --all-files
```

> **Примечание**: Если видите ошибку с `types-all` при установке mypy hook, это нормально — mypy hook временно отключен в конфигурации из-за проблем с зависимостями. Проверки документации и форматирования работают нормально.

## Использование

После установки hooks будут запускаться автоматически при каждом коммите:

```bash
git commit -m "docs: обновление документации"
```

Если нужно запустить проверки вручную:

```bash
pre-commit run --all-files
```

## Отключение hooks (не рекомендуется)

Если нужно временно отключить проверки:

```bash
git commit --no-verify -m "сообщение"
```

Или пропустить конкретную проверку:

```bash
SKIP=markdownlint git commit -m "сообщение"
```

---

**Связанные документы**:

- [Автоматическая проверка документации](./docs_validation.md)
- [Git Workflow](../../.cursor/rules/05-git-workflow.mdc)
