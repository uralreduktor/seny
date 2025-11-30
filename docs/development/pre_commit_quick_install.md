# Быстрая установка Pre-commit

## ✅ Готовое решение (скопируйте и выполните)

```bash
cd backend
poetry add --group dev pre-commit
poetry lock
poetry install
poetry run pre-commit install
```

Готово! Pre-commit hooks установлены и будут запускаться автоматически при каждом коммите.

## Проверка работы

```bash
# Проверить версию
poetry run -C backend pre-commit --version

# Запустить проверки вручную
poetry run -C backend pre-commit run --all-files
```

## Что дальше?

Pre-commit будет автоматически проверять:

- ✅ Форматирование Markdown (markdownlint)
- ✅ Ссылки в документации (выдаёт предупреждения для TODO файлов)
- ✅ Правила проекта (AI Ready блоки, обязательные разделы)
- ✅ Форматирование Python кода (black, isort)
- ⚠️ Типизацию (mypy) — временно отключен, можно запускать вручную

При коммите проверки запустятся автоматически. Если найдены критические ошибки, коммит будет отклонён с описанием проблем. Предупреждения для TODO файлов не блокируют коммит.

---

**Подробная документация**: [pre_commit_setup.md](./pre_commit_setup.md)
