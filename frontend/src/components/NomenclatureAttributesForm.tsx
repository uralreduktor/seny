import { useMemo } from "react";

type AttributeValue = string | number | null | string[];

type FieldConfig =
  | { key: string; label: string; type: "string"; placeholder?: string }
  | { key: string; label: string; type: "number"; suffix?: string }
  | { key: string; label: string; type: "enum"; options: string[] }
  | { key: string; label: string; type: "array"; options: string[] };

type FieldGroup = {
  title: string;
  fields: FieldConfig[];
};

const DEMO_SCHEMA: FieldGroup[] = [
  {
    title: "Механика",
    fields: [
      { key: "power", label: "Мощность, кВт", type: "number", suffix: "кВт" },
      { key: "torque", label: "Крутящий момент, Н·м", type: "number", suffix: "Н·м" },
      { key: "ratio", label: "Передаточное число", type: "string", placeholder: "Напр. 1:15" },
    ],
  },
  {
    title: "Эксплуатация",
    fields: [
      { key: "protection", label: "Класс защиты", type: "enum", options: ["IP54", "IP65", "IP67"] },
      { key: "temperature", label: "Температура, °C", type: "number", suffix: "°C" },
    ],
  },
];

type NomenclatureAttributesFormProps = {
  schema?: Record<string, unknown> | null;
  isLoading?: boolean;
  values: Record<string, AttributeValue>;
  onChange: (next: Record<string, AttributeValue>) => void;
  disabled?: boolean;
};

const resolveGroup = (definition: Record<string, unknown>) =>
  (definition["x-group"] as string) || (definition.group as string) || "Характеристики";

const resolveType = (definition: Record<string, unknown>): FieldConfig["type"] => {
  const rawType = definition.type;
  const type = Array.isArray(rawType) ? rawType[0] : rawType;
  if (definition.enum) return "enum";
  if (type === "array") return "array";
  if (type === "number" || type === "integer") return "number";
  return "string";
};

const buildGroupsFromSchema = (schema?: Record<string, unknown> | null): FieldGroup[] | undefined => {
  const properties = schema?.properties;
  if (!properties || typeof properties !== "object") return undefined;

  const groups = new Map<string, FieldConfig[]>();
  Object.entries(properties as Record<string, Record<string, unknown>>).forEach(
    ([key, definition]) => {
      const type = resolveType(definition);
      const rawDescription =
        typeof definition.description === "string" ? definition.description.trim() : "";
      const title =
        typeof definition.title === "string" && definition.title.trim().length > 0
          ? definition.title
          : key;
      const label = rawDescription || title;
      let field: FieldConfig;
      if (type === "enum") {
        field = {
          key,
          label,
          type: "enum",
          options: (definition.enum as string[]) ?? [],
        };
      } else if (type === "array") {
        const items = definition.items;
        const options =
          items && typeof items === "object" && Array.isArray((items as Record<string, unknown>).enum)
            ? ((items as Record<string, unknown>).enum as string[])
            : [];
        field = {
          key,
          label,
          type: "array",
          options,
        };
      } else if (type === "number") {
        field = {
          key,
          label,
          type: "number",
          suffix: (definition.unit as string) || (definition["x-unit"] as string),
        };
      } else {
        field = {
          key,
          label,
          type: "string",
          placeholder: rawDescription && rawDescription !== label ? rawDescription : undefined,
        };
      }

      const bucket = resolveGroup(definition);
      if (!groups.has(bucket)) groups.set(bucket, []);
      groups.get(bucket)?.push(field);
    }
  );

  if (groups.size === 0) return undefined;
  return Array.from(groups.entries()).map(([title, fields]) => ({ title, fields }));
};

export function NomenclatureAttributesForm({
  schema,
  isLoading,
  values,
  onChange,
  disabled,
}: NomenclatureAttributesFormProps) {
  const parsedGroups = useMemo(() => buildGroupsFromSchema(schema), [schema]);
  const groupsToRender = parsedGroups ?? DEMO_SCHEMA;
  const handleValueChange = (field: FieldConfig, rawValue: string | string[]) => {
    const next = { ...(values ?? {}) };
    let typed: AttributeValue = rawValue as string;
    if (field.type === "number") {
      typed = rawValue === "" ? null : Number(rawValue);
    } else if (field.type === "array") {
      const list = Array.isArray(rawValue)
        ? rawValue.filter((entry) => entry && entry.length > 0)
        : [];
      typed = list;
    } else if (rawValue === "") {
      typed = "";
    }
    if (typed === "" || typed === null || (Array.isArray(typed) && typed.length === 0)) {
      delete next[field.key];
    } else {
      next[field.key] = typed;
    }
    onChange(next);
  };

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
      <div>
        <div className="text-sm font-semibold text-gray-800">Атрибуты карточки</div>
        <p className="text-xs text-gray-500">
          {parsedGroups
            ? "Схема загружена из последней опубликованной версии узла."
            : "Используется тестовый набор полей до полной интеграции."}
        </p>
        {isLoading && <div className="text-xs text-gray-400">Загрузка схемы…</div>}
      </div>

      {groupsToRender.map((group) => (
        <div key={group.title} className="space-y-3 rounded-md border border-white bg-white/70 p-3 shadow-inner">
          <div className="text-sm font-medium text-gray-700">{group.title}</div>
          <div className="grid gap-3">
            {group.fields.map((field) => {
              const rawCurrentValue = values[field.key];
              const stringValue =
                typeof rawCurrentValue === "string"
                  ? rawCurrentValue
                  : rawCurrentValue === null || rawCurrentValue === undefined
                    ? ""
                    : String(rawCurrentValue);
              const commonProps = {
                id: field.key,
                value: stringValue,
                className:
                  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                disabled,
                onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                  handleValueChange(field, event.target.value),
              };

              if (field.type === "enum") {
                return (
                  <div key={field.key} className="space-y-1">
                    <label htmlFor={field.key} className="text-xs font-medium text-gray-600">
                      {field.label}
                    </label>
                    <select {...commonProps}>
                      <option value="">—</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === "array") {
                const selectedValues = Array.isArray(rawCurrentValue)
                  ? (rawCurrentValue as string[])
                  : [];
                return (
                  <div key={field.key} className="space-y-1">
                    <label htmlFor={field.key} className="text-xs font-medium text-gray-600">
                      {field.label}
                    </label>
                    <select
                      id={field.key}
                      multiple
                      value={selectedValues}
                      disabled={disabled}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(event) => {
                        const selected = Array.from(event.target.selectedOptions).map(
                          (option) => option.value
                        );
                        handleValueChange(field, selected);
                      }}
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-500">
                      Удерживайте Ctrl/Shift, чтобы выбрать несколько значений.
                    </p>
                  </div>
                );
              }

              return (
                <div key={field.key} className="space-y-1">
                  <label htmlFor={field.key} className="text-xs font-medium text-gray-600">
                    {field.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      {...commonProps}
                      type={field.type === "number" ? "number" : "text"}
                      placeholder={field.type === "string" ? field.placeholder : undefined}
                    />
                    {field.type === "number" && field.suffix && (
                      <span className="text-xs text-gray-500">{field.suffix}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <details className="rounded-md bg-white/80 p-2 text-xs text-gray-500">
        <summary className="cursor-pointer text-gray-700">Текущие значения (отладка)</summary>
        <code className="mt-2 block break-all text-gray-700">
          {JSON.stringify(values, null, 2)}
        </code>
      </details>
    </div>
  );
}
