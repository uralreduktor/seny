export type FieldType = "string" | "number" | "boolean" | "array";

export type SchemaFieldForm = {
  key: string;
  type: FieldType;
  title: string;
  description: string;
  unit?: string;
  enumValues?: string[];
  defaultValue?: string | boolean | string[] | null;
  required: boolean;
  enabled: boolean;
};

export const DEFAULT_SCHEMA = {
  type: "object",
  properties: {},
};

export const FIELD_TYPE_OPTIONS: { label: string; value: FieldType }[] = [
  { label: "Строка", value: "string" },
  { label: "Число", value: "number" },
  { label: "Логическое", value: "boolean" },
  { label: "Массив (enum)", value: "array" },
];

export const parseFieldType = (definition: Record<string, unknown>): FieldType => {
  const rawType = definition.type;
  const typeValue = Array.isArray(rawType) ? rawType[0] : rawType;
  if (typeValue === "number" || typeValue === "integer") return "number";
  if (typeValue === "boolean") return "boolean";
  if (typeValue === "array") return "array";
  return "string";
};

export const convertSchemaToFields = (
  schema: Record<string, unknown> | undefined
): SchemaFieldForm[] => {
  const properties = schema?.properties;
  const requiredList = Array.isArray(schema?.required)
    ? (schema?.required as string[])
    : [];
  if (!properties || typeof properties !== "object") {
    return [];
  }
  return Object.entries(properties as Record<string, Record<string, unknown>>).map(
    ([key, definition]) => {
      const type = parseFieldType(definition);
      const enumValues =
        type === "string"
          ? Array.isArray(definition.enum)
            ? (definition.enum as unknown[]).filter(
                (entry): entry is string => typeof entry === "string"
              )
            : undefined
          : type === "array" && definition.items && typeof definition.items === "object"
            ? Array.isArray((definition.items as Record<string, unknown>).enum)
              ? (
                  (definition.items as Record<string, unknown>).enum as unknown[]
                ).filter((entry): entry is string => typeof entry === "string")
              : undefined
            : undefined;
      let defaultValue: SchemaFieldForm["defaultValue"] = undefined;
      if ("default" in definition) {
        const rawDefault = definition.default;
        if (type === "boolean" && typeof rawDefault === "boolean") {
          defaultValue = rawDefault;
        } else if (type === "number" && typeof rawDefault === "number") {
          defaultValue = String(rawDefault);
        } else if (type === "string" && typeof rawDefault === "string") {
          defaultValue = String(rawDefault);
        } else if (type === "array" && Array.isArray(rawDefault)) {
          defaultValue = rawDefault
            .filter((entry): entry is string => typeof entry === "string")
            .map((entry) => entry);
        }
      }
      return {
        key,
        type,
        title:
          typeof definition.title === "string" && definition.title.trim().length > 0
            ? definition.title
            : key,
        description:
          typeof definition.description === "string" ? definition.description : "",
        unit:
          (type === "number"
            ? (definition.unit as string) ?? (definition["x-unit"] as string)
            : undefined) ?? undefined,
        enumValues,
        defaultValue,
        required: requiredList.includes(key),
        enabled: true,
      };
    }
  );
};

export const normalizeDefaultValue = (field: SchemaFieldForm) => {
  if (
    field.defaultValue === undefined ||
    field.defaultValue === null ||
    field.defaultValue === ""
  ) {
    return undefined;
  }
  if (field.type === "number") {
    const parsed = Number(field.defaultValue);
    if (Number.isNaN(parsed)) {
      return undefined;
    }
    return parsed;
  }
  if (field.type === "boolean") {
    return field.defaultValue;
  }
  if (field.type === "array") {
    if (!Array.isArray(field.defaultValue)) return undefined;
    const list = field.defaultValue
      .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      .map((entry) => entry.trim());
    return list.length > 0 ? list : undefined;
  }
  return String(field.defaultValue);
};

export const buildSchemaPayload = (
  fields: SchemaFieldForm[]
): Record<string, unknown> => {
  const properties: Record<string, Record<string, unknown>> = {};
  const required: string[] = [];

  fields.forEach((field) => {
    if (!field.enabled) {
      return;
    }
    const definition: Record<string, unknown> = {
      type: field.type === "array" ? "array" : field.type,
      title: field.title || field.key,
    };
    if (field.description) {
      definition.description = field.description;
    }
    if (field.unit && field.type === "number") {
      definition["x-unit"] = field.unit;
    }
    if (field.type === "string" && field.enumValues && field.enumValues.length > 0) {
      definition.enum = field.enumValues;
    }
    if (field.type === "array") {
      const items: Record<string, unknown> = { type: "string" };
      if (field.enumValues && field.enumValues.length > 0) {
        items.enum = field.enumValues;
      }
      definition.items = items;
    }
    const normalizedDefault = normalizeDefaultValue(field);
    if (normalizedDefault !== undefined) {
      definition.default = normalizedDefault;
    }
    properties[field.key] = definition;
    if (field.required) {
      required.push(field.key);
    }
  });

  const schema: Record<string, unknown> = {
    type: "object",
    properties,
  };
  if (required.length > 0) {
    schema.required = required;
  }
  return schema;
};
