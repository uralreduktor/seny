#!/usr/bin/env python3
"""
Проверка специфичных правил документации проекта.

Проверяет:
- Наличие блока "🤖 Для AI-разработчика" в AI Ready документах
- Соответствие структуры документации правилам проекта
- Наличие обязательных разделов
"""

import re
import sys
from pathlib import Path
from typing import List, Set

# Корень проекта
PROJECT_ROOT = Path(__file__).parent.parent
DOCS_ROOT = PROJECT_ROOT / "docs"
RULES_ROOT = PROJECT_ROOT / ".cursor" / "rules"

# AI Ready документы (из docs/STRUCTURE.md)
AI_READY_DOCS = {
    "docs/architecture/system_architecture.md",
    "docs/architecture/tech_stack.md",
    "docs/architecture/data_models.md",
    "docs/development/api_docs.md",
    "docs/modules/tender_management.md",
    "docs/modules/docflow.md",
    "docs/development/setup.md",
}

# Обязательные разделы для разных типов документов
REQUIRED_SECTIONS = {
    "docs/modules/": ["## 📋 Quick Reference", "## 📁 Файловая структура"],
    "docs/architecture/": ["## 📋 Обзор"],
}


def find_markdown_files(files: List[str]) -> List[Path]:
    """Находит все Markdown файлы из списка."""
    markdown_files = []
    for file_path in files:
        path = Path(file_path)
        if path.suffix in [".md", ".mdc"]:
            markdown_files.append(path)
    return markdown_files


def get_relative_path(file_path: Path) -> str:
    """Возвращает относительный путь от корня проекта."""
    try:
        return str(file_path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(file_path)


def check_ai_ready_block(content: str, file_path: Path) -> List[str]:
    """Проверяет наличие блока для AI-разработчика в AI Ready документах."""
    errors = []
    relative_path = get_relative_path(file_path)

    # Проверяем только AI Ready документы
    if relative_path not in AI_READY_DOCS:
        return errors

    # Ищем блок "🤖 Для AI-разработчика"
    ai_block_pattern = r">\s*🤖\s+Для\s+AI-разработчика"

    if not re.search(ai_block_pattern, content, re.IGNORECASE):
        errors.append(
            f"⚠️  {relative_path}: "
            f"AI Ready документ должен содержать блок '> 🤖 Для AI-разработчика' в начале"
        )

    return errors


def check_required_sections(content: str, file_path: Path) -> List[str]:
    """Проверяет наличие обязательных разделов."""
    errors = []
    relative_path = get_relative_path(file_path)

    # Проверяем обязательные разделы для модулей
    if relative_path.startswith("docs/modules/"):
        for section in REQUIRED_SECTIONS.get("docs/modules/", []):
            if section not in content:
                errors.append(
                    f"⚠️  {relative_path}: "
                    f"Отсутствует обязательный раздел: {section}"
                )

    # Проверяем обязательные разделы для архитектуры
    if relative_path.startswith("docs/architecture/"):
        for section in REQUIRED_SECTIONS.get("docs/architecture/", []):
            if section not in content:
                errors.append(
                    f"⚠️  {relative_path}: "
                    f"Отсутствует обязательный раздел: {section}"
                )

    return errors


def check_document_structure(content: str, file_path: Path) -> List[str]:
    """Проверяет структуру документа."""
    errors = []
    relative_path = get_relative_path(file_path)

    # Проверяем наличие заголовка первого уровня
    if not re.match(r"^#\s+.+$", content.strip(), re.MULTILINE):
        errors.append(
            f"⚠️  {relative_path}: "
            f"Документ должен начинаться с заголовка первого уровня (# Заголовок)"
        )

    # Проверяем наличие пустых строк вокруг заголовков (базовая проверка)
    # Более детальная проверка делается markdownlint

    return errors


def check_file_rules(file_path: Path) -> List[str]:
    """Проверяет все правила для файла.

    Returns:
        List of error messages
    """
    errors = []

    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        errors.append(f"❌ Не удалось прочитать файл {file_path}: {e}")
        return errors

    # Проверяем AI Ready блок
    errors.extend(check_ai_ready_block(content, file_path))

    # Проверяем обязательные разделы
    errors.extend(check_required_sections(content, file_path))

    # Проверяем структуру документа
    errors.extend(check_document_structure(content, file_path))

    return errors


def main():
    """Главная функция."""
    if len(sys.argv) < 2:
        print("Использование: check_docs_rules.py <file1> [file2] ...")
        sys.exit(1)

    files_to_check = sys.argv[1:]
    markdown_files = find_markdown_files(files_to_check)

    if not markdown_files:
        print("ℹ️  Нет Markdown файлов для проверки")
        sys.exit(0)

    all_errors = []
    all_warnings = []

    for file_path in markdown_files:
        errors = check_file_rules(file_path)
        for error in errors:
            if error.startswith("❌"):
                all_errors.append(error)
            else:
                all_warnings.append(error)

    # Выводим ошибки и предупреждения
    if all_errors:
        print("\n".join(all_errors))

    if all_warnings:
        print("\n".join(all_warnings))

    # Возвращаем ошибку только если есть критические ошибки
    if all_errors:
        sys.exit(1)
    elif all_warnings:
        print(f"\n⚠️  Найдено {len(all_warnings)} предупреждений")
        sys.exit(0)
    else:
        print(f"✅ Проверено {len(markdown_files)} файл(ов), все правила соблюдены")
        sys.exit(0)


if __name__ == "__main__":
    main()
