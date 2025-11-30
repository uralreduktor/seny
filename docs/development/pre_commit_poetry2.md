# Установка Pre-commit с Poetry 2.0.0+

## Проблема: Poetry 2.0.0 не имеет команды `poetry shell`

В Poetry 2.0.0 команда `poetry shell` была удалена. Вместо неё нужно использовать:

- `poetry env activate` (активация окружения)
- `poetry run <command>` (запуск команды в окружении Poetry)

## ✅ Решение для Poetry 2.0.0+

### Способ 1: Использовать `poetry run` (рекомендуется)

```bash
cd backend

# Добавить pre-commit (если ещё не добавлен)
poetry add --group dev pre-commit

# Установить hooks через poetry run
poetry run pre-commit install

# Запускать проверки через poetry run
poetry run pre-commit run --all-files
```

### Способ 2: Активировать окружение

```bash
cd backend

# Активировать виртуальное окружение Poetry
poetry env activate

# Теперь можно использовать команды напрямую
pre-commit install
pre-commit run --all-files
```

### Способ 3: Установить shell plugin (если нужен `poetry shell`)

```bash
# Установить shell plugin для Poetry
poetry self add poetry-plugin-shell

# Теперь команда poetry shell будет доступна
poetry shell
pre-commit install
```

## Проверка установки

```bash
# Проверить версию Poetry
poetry --version

# Проверить, что pre-commit установлен
poetry run pre-commit --version

# Запустить проверки
poetry run pre-commit run --all-files
```

## Использование в повседневной работе

После установки hooks будут запускаться автоматически при коммите. Если нужно запустить проверки вручную:

```bash
# Из корня проекта
cd backend
poetry run pre-commit run --all-files

# Или из любого места, если окружение активировано
pre-commit run --all-files
```

## Альтернатива: Использовать pipx

Если не хотите использовать Poetry для pre-commit:

```bash
# Установить pipx
sudo apt install pipx
pipx ensurepath

# Установить pre-commit через pipx
pipx install pre-commit

# Установить hooks
pre-commit install
```

---

**Связанные документы**:

- [Автоматическая проверка документации](./docs_validation.md)
- [Установка Pre-commit](./pre_commit_setup.md)
