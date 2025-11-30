# Решение проблем Pre-commit

## Проблема: Ошибка с types-all при установке mypy

**Ошибка**:

```text
ERROR: Could not find a version that satisfies the requirement types-pkg-resources (from types-all)
```

**Причина**: Пакет `types-all` содержит зависимость `types-pkg-resources`, которая больше не существует в PyPI.

**Решение**: Mypy hook временно отключен в `.pre-commit-config.yaml`. Это не критично, так как:

1. Проверки документации (markdownlint, ссылки, правила) работают нормально
2. Проверки форматирования Python (black, isort) работают нормально
3. Mypy можно запускать вручную через `poetry run mypy backend/`

**Если нужно включить mypy**:

Отредактируйте `.pre-commit-config.yaml` и раскомментируйте секцию mypy, убрав `types-all`:

```yaml
- repo: https://github.com/pre-commit/mirrors-mypy
  rev: v1.8.0
  hooks:
    - id: mypy
      additional_dependencies: [] # Убрать types-all
      args: ["--ignore-missing-imports", "--no-strict-optional"]
      files: ^backend/.*\.py$
```

## Проблема: Poetry 2.0.0 не имеет команды `poetry shell`

**Ошибка**:

```text
Looks like you're trying to use a Poetry command that is not available.
Since Poetry (2.0.0), the shell command is not installed by default.
```

**Решение**: Используйте `poetry run` вместо `poetry shell`:

```bash
poetry run pre-commit install
poetry run pre-commit run --all-files
```

## Проблема: externally-managed-environment

**Ошибка**:

```text
error: externally-managed-environment
```

**Решение**: Используйте Poetry или pipx:

```bash
# Через Poetry (рекомендуется)
cd backend
poetry add --group dev pre-commit
poetry install
poetry run pre-commit install

# Или через pipx
pipx install pre-commit
pre-commit install
```

## Проблема: markdownlint не найден

**Ошибка**:

```text
markdownlint: command not found
```

**Решение**: Установите markdownlint через npm:

```bash
npm install -g markdownlint-cli
```

Или используйте версию из pre-commit (она устанавливается автоматически).

## Проблема: Python версия не совпадает

**Ошибка**:

```text
RuntimeError: failed to find interpreter for Builtin discover of python_spec='python3.11'
```

**Решение**: Обновите `.pre-commit-config.yaml`:

```yaml
default_language_version:
  python: python3.12 # Используйте вашу версию Python
```

## Проблема: Pre-commit работает медленно

**Причина**: Первый запуск устанавливает все окружения, это может занять несколько минут.

**Решение**:

- Дождитесь завершения первой установки
- Последующие запуски будут быстрее
- Можно пропустить медленные проверки: `SKIP=mypy git commit`

## Проблема: Hooks не запускаются автоматически

**Проверка**:

```bash
# Проверить, установлены ли hooks
ls -la .git/hooks/pre-commit

# Переустановить hooks
poetry run -C backend pre-commit install
```

## Пропуск проверок (временное решение)

Если нужно временно пропустить проверки:

```bash
# Пропустить все проверки (не рекомендуется)
git commit --no-verify

# Пропустить конкретную проверку
SKIP=markdownlint git commit
SKIP=mypy git commit
```

---

**Связанные документы**:

- [Установка Pre-commit](./pre_commit_setup.md)
- [Автоматическая проверка документации](./docs_validation.md)
