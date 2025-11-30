#!/usr/bin/env python3
"""
Проверка ссылок в документации Markdown.

Проверяет:
- Внутренние ссылки на файлы (существуют ли файлы)
- Якоря в документах (существуют ли заголовки)
- Относительные пути корректны
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple
from urllib.parse import urlparse

# Корень проекта
PROJECT_ROOT = Path(__file__).parent.parent
DOCS_ROOT = PROJECT_ROOT / "docs"
RULES_ROOT = PROJECT_ROOT / ".cursor" / "rules"

# Файлы, которые помечены как TODO и могут отсутствовать (только предупреждение, не ошибка)
TODO_FILES = {
    "docs/development/coding_standards.md",
    "docs/development/backend_guide.md",
    "docs/development/frontend_guide.md",
    "docs/development/database_migrations.md",
    "docs/operations/deployment.md",
    "docs/operations/monitoring.md",
    "docs/operations/backup_restore.md",
    "docs/operations/maintenance.md",
    "docs/testing/unit_tests.md",
    "docs/testing/integration_tests.md",
}


def find_markdown_files(files: List[str]) -> List[Path]:
    """Находит все Markdown файлы из списка."""
    markdown_files = []
    for file_path in files:
        path = Path(file_path)
        if path.suffix in [".md", ".mdc"]:
            markdown_files.append(path)
    return markdown_files


def extract_links(content: str, file_path: Path) -> List[Tuple[str, str]]:
    """Извлекает все ссылки из Markdown контента.

    Returns:
        List of (link_text, link_url) tuples
    """
    # Паттерн для Markdown ссылок: [текст](url)
    link_pattern = r"\[([^\]]+)\]\(([^)]+)\)"
    links = []

    for match in re.finditer(link_pattern, content):
        link_text = match.group(1)
        link_url = match.group(2)
        links.append((link_text, link_url))

    return links


def resolve_link(link_url: str, base_file: Path) -> Tuple[Path, str]:
    """Разрешает ссылку относительно базового файла.

    Returns:
        (resolved_path, anchor) tuple или (None, anchor) для якорей внутри документа
    """
    # Разделяем URL и якорь
    if "#" in link_url:
        url_part, anchor = link_url.split("#", 1)
    else:
        url_part = link_url
        anchor = None

    # Если ссылка начинается только с #, это якорь внутри текущего документа
    if url_part == "" or url_part == "#":
        return base_file, anchor

    # Пропускаем внешние ссылки
    parsed = urlparse(url_part)
    if parsed.scheme or parsed.netloc:
        return None, None

    # Если ссылка начинается с /, ищем от корня проекта
    if url_part.startswith("/"):
        resolved = PROJECT_ROOT / url_part.lstrip("/")
    else:
        # Относительный путь от текущего файла
        resolved = (base_file.parent / url_part).resolve()

    return resolved, anchor


def check_anchor_exists(content: str, anchor: str) -> bool:
    """Проверяет, существует ли якорь (заголовок) в контенте."""
    if not anchor:
        return True

    # Нормализуем якорь (как это делает GitHub)
    # Заменяем пробелы на дефисы, нижний регистр, удаляем спецсимволы
    normalized_anchor = re.sub(r"[^\w\s-]", "", anchor.lower())
    normalized_anchor = re.sub(r"[-\s]+", "-", normalized_anchor)
    normalized_anchor = normalized_anchor.strip("-")

    # Ищем заголовки в Markdown
    header_pattern = r"^#{1,6}\s+(.+)$"
    for line in content.split("\n"):
        match = re.match(header_pattern, line)
        if match:
            header_text = match.group(1)
            normalized_header = re.sub(r"[^\w\s-]", "", header_text.lower())
            normalized_header = re.sub(r"[-\s]+", "-", normalized_header)
            normalized_header = normalized_header.strip("-")

            if normalized_header == normalized_anchor:
                return True

    return False


def check_file_exists(file_path: Path) -> bool:
    """Проверяет существование файла."""
    return file_path.exists() and file_path.is_file()


def check_links_in_file(file_path: Path) -> List[str]:
    """Проверяет все ссылки в файле.

    Returns:
        List of error messages
    """
    errors = []

    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        errors.append(f"❌ Не удалось прочитать файл {file_path}: {e}")
        return errors

    links = extract_links(content, file_path)

    for link_text, link_url in links:
        resolved_path, anchor = resolve_link(link_url, file_path)

        # Пропускаем внешние ссылки
        if resolved_path is None:
            continue

        # Если это якорь внутри текущего документа (resolved_path == base_file)
        if resolved_path == file_path:
            # Проверяем только якорь
            if anchor and not check_anchor_exists(content, anchor):
                try:
                    file_rel = str(file_path.relative_to(PROJECT_ROOT))
                except ValueError:
                    file_rel = str(file_path)
                errors.append(
                    f"⚠️  {file_rel}: "
                    f"Ссылка '[{link_text}]({link_url})' содержит несуществующий якорь: #{anchor}"
                )
            continue

        # Проверяем существование файла
        if not check_file_exists(resolved_path):
            try:
                file_rel = str(file_path.relative_to(PROJECT_ROOT))
                target_rel = str(resolved_path.relative_to(PROJECT_ROOT))
            except ValueError:
                file_rel = str(file_path)
                target_rel = str(resolved_path)

            # Нормализуем путь для сравнения
            try:
                # Пытаемся получить относительный путь от корня проекта
                target_rel_normalized = str(
                    resolved_path.relative_to(PROJECT_ROOT)
                ).replace("\\", "/")
            except ValueError:
                # Если не получается, используем абсолютный путь и пытаемся извлечь относительную часть
                target_rel_normalized = str(resolved_path).replace("\\", "/")
                if PROJECT_ROOT.as_posix() in target_rel_normalized:
                    target_rel_normalized = target_rel_normalized.replace(
                        PROJECT_ROOT.as_posix() + "/", ""
                    )

            # Проверяем, является ли это файлом из TODO списка
            is_todo_file = (
                target_rel_normalized in TODO_FILES
                or any(
                    target_rel_normalized.startswith(todo.replace("\\", "/"))
                    for todo in TODO_FILES
                )
                or any(
                    todo.replace("\\", "/") in target_rel_normalized
                    for todo in TODO_FILES
                )
            )

            # Также проверяем, является ли это ссылкой на директорию (не файл)
            is_directory_link = link_url.endswith("/") or resolved_path.is_dir()

            if is_todo_file:
                errors.append(
                    f"⚠️  {file_rel}: "
                    f"Ссылка '[{link_text}]({link_url})' ведёт на файл из TODO списка: {target_rel_normalized}"
                )
            elif is_directory_link:
                # Ссылки на директории - это предупреждение, не ошибка
                errors.append(
                    f"⚠️  {file_rel}: "
                    f"Ссылка '[{link_text}]({link_url})' ведёт на директорию (не файл): {target_rel_normalized}"
                )
            else:
                errors.append(
                    f"❌ {file_rel}: "
                    f"Ссылка '[{link_text}]({link_url})' ведёт на несуществующий файл: {target_rel_normalized}"
                )
            continue

        # Проверяем якорь, если он есть
        if anchor:
            try:
                target_content = resolved_path.read_text(encoding="utf-8")
                if not check_anchor_exists(target_content, anchor):
                    try:
                        file_rel = file_path.relative_to(PROJECT_ROOT)
                    except ValueError:
                        file_rel = str(file_path)
                    errors.append(
                        f"⚠️  {file_rel}: "
                        f"Ссылка '[{link_text}]({link_url})' содержит несуществующий якорь: #{anchor}"
                    )
            except Exception as e:
                try:
                    file_rel = file_path.relative_to(PROJECT_ROOT)
                    target_rel = resolved_path.relative_to(PROJECT_ROOT)
                except ValueError:
                    file_rel = str(file_path)
                    target_rel = str(resolved_path)
                errors.append(
                    f"❌ {file_rel}: "
                    f"Не удалось проверить якорь в файле {target_rel}: {e}"
                )

    return errors


def main():
    """Главная функция."""
    if len(sys.argv) < 2:
        print("Использование: check_docs_links.py <file1> [file2] ...")
        sys.exit(1)

    files_to_check = sys.argv[1:]
    markdown_files = find_markdown_files(files_to_check)

    if not markdown_files:
        print("ℹ️  Нет Markdown файлов для проверки")
        sys.exit(0)

    all_errors = []
    all_warnings = []

    for file_path in markdown_files:
        errors = check_links_in_file(file_path)
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

    # Возвращаем ошибку только если есть критические ошибки (не предупреждения)
    if all_errors:
        sys.exit(1)
    elif all_warnings:
        print(f"\n⚠️  Найдено {len(all_warnings)} предупреждений (файлы из TODO списка)")
        sys.exit(0)
    else:
        print(f"✅ Проверено {len(markdown_files)} файл(ов), все ссылки корректны")
        sys.exit(0)


if __name__ == "__main__":
    main()
