# OpenAPI Generator — Генерация TypeScript клиентов

## Описание

OpenAPI Generator используется для автоматической генерации TypeScript клиентов из OpenAPI спецификации FastAPI бэкенда. Это обеспечивает синхронизацию типов между backend и frontend и исключает ручное создание API клиентов.

## Установка

### Требования

- Node.js 18+
- Backend должен быть запущен на `http://localhost:8000` (или изменить URL в конфигурации)

### Установка OpenAPI Generator CLI

```bash
# Глобальная установка
npm install -g @openapitools/openapi-generator-cli

# Или локально в проект
npm install --save-dev @openapitools/openapi-generator-cli
```

## Использование

### Генерация клиента из запущенного бэкенда

```bash
# Из корня проекта
cd frontend
npm run generate-api

# Или напрямую
openapi-generator-cli generate -c ../openapi-generator-config.yaml
```

### Генерация из локального файла спецификации

Если нужно сгенерировать из сохраненной спецификации:

```bash
openapi-generator-cli generate \
  -i backend/openapi.json \
  -g typescript-axios \
  -o frontend/src/api/generated \
  --additional-properties=supportsES6=true,typescriptThreePlus=true
```

### Экспорт OpenAPI спецификации из FastAPI

```bash
# Сохранить спецификацию в файл
curl http://localhost:8000/openapi.json -o backend/openapi.json
```

## Структура сгенерированных файлов

После генерации в `frontend/src/api/generated` будут созданы:

```text
generated/
├── api/                    # API клиенты по модулям
│   ├── tenders-api.ts
│   ├── calculations-api.ts
│   └── ...
├── models/                 # TypeScript типы из Pydantic моделей
│   ├── tender.ts
│   ├── calculation.ts
│   └── ...
├── base.ts                 # Базовый класс для API клиентов
├── common.ts               # Общие типы и утилиты
└── index.ts                # Экспорты всех типов и клиентов
```

## Использование в коде

### Импорт типов и клиентов

```typescript
import { TendersApi, TenderResponse, TenderCreate } from "@/api/generated";
import { Configuration } from "@/api/generated/base";

// Настройка конфигурации
const apiConfig = new Configuration({
  basePath: import.meta.env.VITE_API_URL || "http://localhost:8000",
  accessToken: () => localStorage.getItem("access_token") || "",
});

// Создание клиента
const tendersApi = new TendersApi(apiConfig);

// Использование в компоненте с TanStack Query
import { useQuery, useMutation } from "@tanstack/react-query";

function TenderList() {
  const { data, isLoading } = useQuery({
    queryKey: ["tenders"],
    queryFn: async () => {
      const response = await tendersApi.getTenders();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (tender: TenderCreate) => {
      const response = await tendersApi.createTender(tender);
      return response.data;
    },
  });

  // ...
}
```

### Использование с TanStack Query

Рекомендуется создать обертку для API клиентов:

```typescript
// src/api/client.ts
import { Configuration } from "@/api/generated/base";

export const apiConfig = new Configuration({
  basePath: import.meta.env.VITE_API_URL || "http://localhost:8000",
  accessToken: () => localStorage.getItem("access_token") || "",
});

// src/api/tenders.ts
import { TendersApi } from "@/api/generated";
import { apiConfig } from "./client";

export const tendersApi = new TendersApi(apiConfig);
```

## Workflow разработки

1. **Разработка на backend**: Добавляешь/изменяешь эндпоинты в FastAPI
2. **Запуск бэкенда**: `cd backend && uvicorn app.main:app --reload`
3. **Генерация клиента**: `cd frontend && npm run generate-api`
4. **Использование в компонентах**: Импортируй типы и клиенты из `@/api/generated`
5. **Коммит**: Включай изменения в `frontend/src/api/generated` в коммит

## Конфигурация

Основная конфигурация находится в `openapi-generator-config.yaml` в корне проекта.

### Ключевые параметры

- `generatorName: typescript-axios` — генератор TypeScript с axios
- `inputSpec` — URL или путь к OpenAPI спецификации
- `outputDir` — директория для сгенерированных файлов
- `withSeparateModelsAndApi: true` — разделение моделей и API клиентов
- `stringEnums: true` — строковые enum вместо числовых

## Обновление при изменениях API

При изменении API на бэкенде:

1. Убедись, что бэкенд запущен
2. Запусти генерацию: `npm run generate-api`
3. Проверь, что типы обновились корректно
4. Обнови использование в компонентах при необходимости
5. Запусти TypeScript проверку: `npm run build`

## Troubleshooting

### Ошибка: "Cannot connect to backend"

- Убедись, что бэкенд запущен на `http://localhost:8000`
- Проверь доступность: `curl http://localhost:8000/openapi.json`

### Ошибка: "Type errors after generation"

- Проверь версию OpenAPI Generator: `openapi-generator-cli version`
- Убедись, что используется TypeScript 5.3+
- Проверь конфигурацию в `openapi-generator-config.yaml`

### Файлы не обновляются

- Удали директорию `frontend/src/api/generated` и запусти генерацию заново
- Проверь права доступа к файлам

## Интеграция с CI/CD

Добавь генерацию в pipeline:

```yaml
# .github/workflows/ci.yml
- name: Generate API client
  run: |
    cd frontend
    npm run generate-api
  env:
    VITE_API_URL: ${{ secrets.API_URL }}
```

## Дополнительные ресурсы

- [OpenAPI Generator документация](https://openapi-generator.tech/)
- [TypeScript Axios генератор](https://openapi-generator.tech/docs/generators/typescript-axios)
- [FastAPI OpenAPI документация](https://fastapi.tiangolo.com/tutorial/metadata/)
