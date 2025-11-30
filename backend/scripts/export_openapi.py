from __future__ import annotations

import json
from pathlib import Path

from app.main import app


def main() -> None:
    schema = app.openapi()
    output_path = Path(__file__).resolve().parents[1] / "openapi.json"
    output_path.write_text(
        json.dumps(schema, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"OpenAPI schema exported to {output_path}")


if __name__ == "__main__":
    main()
