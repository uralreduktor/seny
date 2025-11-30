import { startTransition, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api";
import type {
  ApiErrorResponse,
  NomenclatureAttributePreset,
  NomenclatureNodeSchemaVersion,
  NomenclatureSchemaDiff,
  NomenclatureSchemaVersionResponse,
} from "@/types";
import {
  buildSchemaPayload,
  convertSchemaToFields,
  DEFAULT_SCHEMA,
  FIELD_TYPE_OPTIONS,
} from "@/utils/schemaFields";
import type { SchemaFieldForm, FieldType } from "@/utils/schemaFields";

type NomenclatureSchemaEditorProps = {
  nodeId: number | null;
};

export function NomenclatureSchemaEditor({ nodeId }: NomenclatureSchemaEditorProps) {
  const queryClient = useQueryClient();
  const [schemaFields, setSchemaFields] = useState<SchemaFieldForm[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("string");
  const [selectedPresetIds, setSelectedPresetIds] = useState<number[]>([]);
  const [comment, setComment] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDiffModalOpen, setDiffModalOpen] = useState(false);
  const [selectedVersionForDiff, setSelectedVersionForDiff] = useState<number | null>(null);
  const [publishingVersion, setPublishingVersion] = useState<number | null>(null);

  const {
    data: schemaVersions,
    isLoading: isSchemasLoading,
    error: schemaError,
  } = useQuery({
    queryKey: ["nomenclature-node-schema", nodeId],
    enabled: Boolean(nodeId),
    queryFn: async () => {
      const res = await api.get<NomenclatureNodeSchemaVersion[]>(
        `/nomenclature/nodes/${nodeId}/schemas`
      );
      return res.data;
    },
  });

  const { data: presets } = useQuery({
    queryKey: ["nomenclature-presets", "published-only"],
    queryFn: async () => {
      const res = await api.get<NomenclatureAttributePreset[]>("/nomenclature/presets", {
        params: { status: "published" },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: schemaDiff,
    isFetching: isDiffLoading,
    error: diffError,
    refetch: refetchDiff,
  } = useQuery({
    queryKey: ["nomenclature-schema-diff", nodeId, selectedVersionForDiff],
    enabled: Boolean(nodeId) && Boolean(selectedVersionForDiff) && isDiffModalOpen,
    queryFn: async () => {
      const res = await api.get<NomenclatureSchemaDiff>(
        `/nomenclature/nodes/${nodeId}/schemas/${selectedVersionForDiff}/diff`
      );
      return res.data;
    },
  });

  useEffect(() => {
    if (isDiffModalOpen && selectedVersionForDiff) {
      refetchDiff();
    }
  }, [isDiffModalOpen, selectedVersionForDiff, refetchDiff]);

  const latestSchema = schemaVersions?.[0];
  const availablePresets = presets ?? [];

  const schemaResetKey = useMemo(
    () =>
      latestSchema
        ? `${latestSchema.id}-${latestSchema.version}-${nodeId ?? "none"}`
        : `empty-${nodeId ?? "none"}`,
    [latestSchema, nodeId]
  );

  useEffect(() => {
    startTransition(() => {
      if (latestSchema) {
        setSchemaFields(
          convertSchemaToFields(
            (latestSchema.json_schema as Record<string, unknown>) ?? DEFAULT_SCHEMA
          )
        );
        setSelectedPresetIds(latestSchema.presets?.map((preset) => preset.id) ?? []);
      } else {
        setSchemaFields([]);
        setSelectedPresetIds([]);
      }
      setFieldErrors({});
      setNewFieldKey("");
      setNewFieldType("string");
      setComment("");
      setLocalError(null);
      setSuccessMessage(null);
    });
  }, [schemaResetKey, latestSchema]);

  const mutation = useMutation({
    mutationFn: async (payload: {
      schema: Record<string, unknown>;
      presetIds: number[];
      comment?: string;
    }) => {
      if (!nodeId) {
        throw new Error("Не выбран узел классификатора");
      }
      const body = {
        json_schema: payload.schema,
        presets: payload.presetIds,
        comment: payload.comment?.trim() || undefined,
      };
      const res = await api.post(`/nomenclature/nodes/${nodeId}/schemas`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nomenclature-node-schema", nodeId] });
      setSuccessMessage("Новая версия схемы сохранена. Не забудьте опубликовать её в админке.");
      setLocalError(null);
    },
    onError: (err: Error | AxiosError<ApiErrorResponse>) => {
      if ("isAxiosError" in err) {
        const axiosErr = err as AxiosError<ApiErrorResponse>;
        const message = axiosErr.response?.data?.detail ?? axiosErr.message;
        setLocalError(message ?? "Не удалось сохранить схему");
      } else {
        setLocalError(err.message);
      }
      setSuccessMessage(null);
    },
  });

  const handlePresetToggle = (presetId: number) => {
    setSelectedPresetIds((prev) =>
      prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId]
    );
  };

  const handleApplyPresetsFields = () => {
    if (selectedPresetIds.length === 0) {
      setLocalError("Выберите хотя бы один пресет для автозаполнения");
      return;
    }
    const presetIdsToApply = [...selectedPresetIds];
    const fieldsFromPresets = presetIdsToApply
      .map((presetId) => availablePresets.find((preset) => preset.id === presetId))
      .filter((preset): preset is NomenclatureAttributePreset => Boolean(preset))
      .flatMap((preset) =>
        convertSchemaToFields(
          (preset.json_schema as Record<string, unknown>) ?? DEFAULT_SCHEMA
        )
      );
    if (fieldsFromPresets.length === 0) {
      setLocalError("Выбранные пресеты не содержат полей");
      return;
    }
    setSchemaFields((prev) => {
      const map = new Map(prev.map((field) => [field.key, field]));
      fieldsFromPresets.forEach((field) => {
        map.set(field.key, { ...field, enabled: true });
      });
      return Array.from(map.values());
    });
    setSelectedPresetIds((prev) => prev.filter((id) => !presetIdsToApply.includes(id)));
    setFieldErrors({});
    setLocalError(null);
    setSuccessMessage(
      "Поля из выбранных пресетов добавлены в схему. Проверьте атрибуты и сохраните версию."
    );
  };

  const publishMutation = useMutation({
    mutationFn: async (payload: { version: number }) => {
      if (!nodeId) {
        throw new Error("Не выбран узел классификатора");
      }
      const res = await api.post<NomenclatureSchemaVersionResponse>(
        `/nomenclature/nodes/${nodeId}/schemas/${payload.version}/publish`
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["nomenclature-node-schema", nodeId] });
      setSuccessMessage(`Версия v${data.version} опубликована.`);
      setLocalError(null);
    },
    onError: (err: Error | AxiosError<ApiErrorResponse>) => {
      if ("isAxiosError" in err) {
        const axiosErr = err as AxiosError<ApiErrorResponse>;
        const message = axiosErr.response?.data?.detail ?? axiosErr.message;
        setLocalError(message ?? "Не удалось опубликовать версию");
      } else {
        setLocalError(err.message);
      }
      setSuccessMessage(null);
    },
    onSettled: () => {
      setPublishingVersion(null);
    },
  });

  const schemaInfo = useMemo(() => {
    if (!latestSchema) {
      return "Схема ещё не создана — будет использован пустой шаблон.";
    }
    return `Текущая версия v${latestSchema.version} (${latestSchema.status}). Обновлено ${new Date(
      latestSchema.created_at
    ).toLocaleString("ru-RU")}.`;
  }, [latestSchema]);

  const schemaPreview = useMemo(
    () => JSON.stringify(buildSchemaPayload(schemaFields), null, 2),
    [schemaFields]
  );

  const schemaHasActiveFields = schemaFields.some((field) => field.enabled);

  const setFieldError = (fieldKey: string, message: string | null) => {
    setFieldErrors((prev) => ({ ...prev, [fieldKey]: message }));
  };

  const handleFieldChange = (
    fieldKey: string,
    patch: Partial<SchemaFieldForm>
  ) => {
    setSchemaFields((prev) =>
      prev.map((field) =>
        field.key === fieldKey ? { ...field, ...patch } : field
      )
    );
  };

  const handleFieldToggle = (fieldKey: string, enabled: boolean) => {
    handleFieldChange(fieldKey, { enabled });
  };

  const handleFieldRequiredToggle = (fieldKey: string, required: boolean) => {
    handleFieldChange(fieldKey, { required });
  };

  const handleFieldTypeChange = (fieldKey: string, type: FieldType) => {
    handleFieldChange(fieldKey, {
      type,
      enumValues: type === "string" || type === "array" ? [] : undefined,
      unit: type === "number" ? "" : undefined,
      defaultValue: type === "boolean" ? null : type === "array" ? [] : "",
    });
    setFieldError(fieldKey, null);
  };

  const handleFieldEnumChange = (fieldKey: string, value: string) => {
    const list = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    handleFieldChange(fieldKey, { enumValues: list });
  };

  const handleFieldDefaultChange = (field: SchemaFieldForm, rawValue: string) => {
    if (field.type === "number") {
      if (rawValue === "" || !Number.isNaN(Number(rawValue))) {
        setFieldError(field.key, null);
      } else {
        setFieldError(field.key, "Введите число");
      }
      handleFieldChange(field.key, { defaultValue: rawValue });
      return;
    }
    if (field.type === "boolean") {
      setFieldError(field.key, null);
      handleFieldChange(field.key, {
        defaultValue: rawValue === "" ? null : rawValue === "true",
      });
      return;
    }
    if (field.type === "array") {
      setFieldError(field.key, null);
      const list = rawValue
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      handleFieldChange(field.key, { defaultValue: list });
      return;
    }
    setFieldError(field.key, null);
    handleFieldChange(field.key, { defaultValue: rawValue });
  };

  const handleAddField = () => {
    const trimmedKey = newFieldKey.trim();
    if (!trimmedKey) {
      setLocalError("Укажите ключ для нового поля");
      return;
    }
    if (schemaFields.some((field) => field.key === trimmedKey)) {
      setLocalError("Поле с таким ключом уже существует");
      return;
    }
    const newField: SchemaFieldForm = {
      key: trimmedKey,
      type: newFieldType,
      title: trimmedKey,
      description: "",
      enumValues: newFieldType === "string" || newFieldType === "array" ? [] : undefined,
      unit: newFieldType === "number" ? "" : undefined,
      defaultValue: newFieldType === "boolean" ? null : newFieldType === "array" ? [] : "",
      required: false,
      enabled: true,
    };
    setSchemaFields((prev) => [...prev, newField]);
    setFieldError(trimmedKey, null);
    setNewFieldKey("");
  };

  const validateFieldsBeforeSave = () => {
    const errors: Record<string, string | null> = {};
    schemaFields.forEach((field) => {
      let message: string | null = null;
      if (
        field.enabled &&
        field.type === "number" &&
        field.defaultValue !== undefined &&
        field.defaultValue !== null &&
        field.defaultValue !== "" &&
        Number.isNaN(Number(field.defaultValue))
      ) {
        message = "Введите число";
      }
      errors[field.key] = message;
    });
    setFieldErrors(errors);
    return Object.values(errors).some(Boolean);
  };

  const handleSaveDraft = () => {
    if (!nodeId) {
      setLocalError("Не выбран узел классификатора");
      return;
    }
    const hasErrors = validateFieldsBeforeSave();
    if (hasErrors) {
      setLocalError("Исправьте ошибки в атрибутах");
      return;
    }
    const schemaPayload = buildSchemaPayload(schemaFields);
    if (
      !schemaPayload.properties ||
      Object.keys(schemaPayload.properties as Record<string, unknown>).length === 0
    ) {
      setLocalError("Добавьте и включите хотя бы одно поле");
      return;
    }
    setLocalError(null);
    mutation.mutate({
      schema: schemaPayload,
      presetIds: selectedPresetIds,
      comment,
    });
  };

  if (!nodeId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
        Выберите узел классификатора слева, чтобы работать со схемой и пресетами.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
        <div className="text-lg font-semibold text-gray-900">Редактор схемы узла</div>
        <p className="text-sm text-gray-500">
          Управляйте JSON Schema и набором подключенных пресетов для выбранного узла. После сохранения
          будет создана новая версия (статус draft), которую можно опубликовать через API.
        </p>
        <span className="text-xs text-gray-400">{schemaInfo}</span>
        {schemaError && (
          <span className="text-xs text-red-500">
            Не удалось загрузить версии схемы для узла {nodeId}. Вероятно, узел отсутствует в базе.
          </span>
        )}
      </div>

      {localError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{localError}</div>}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{successMessage}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-700">
              Атрибуты JSON Schema (type: object)
            </div>
            <p className="text-xs text-gray-500">
              Наследование выполняется на бэкенде. Здесь редактируются только собственные поля узла.
            </p>
          </div>

          <div className="rounded-md border border-dashed border-gray-200 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={newFieldKey}
                onChange={(event) => setNewFieldKey(event.target.value)}
                placeholder="Ключ поля"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newFieldType}
                onChange={(event) => setNewFieldType(event.target.value as FieldType)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FIELD_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddField}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Добавить поле
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Ключ должен быть уникальным и состоять из латинских символов, цифр и подчёркиваний.
            </p>
          </div>

          <div className="space-y-3">
            {schemaFields.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
                Нет атрибутов — добавьте первое поле.
              </div>
            ) : (
              schemaFields.map((field) => {
                const defaultError = fieldErrors[field.key];
                const defaultInputValue = Array.isArray(field.defaultValue)
                  ? field.defaultValue.join(", ")
                  : typeof field.defaultValue === "string"
                    ? field.defaultValue
                    : field.defaultValue === null || field.defaultValue === undefined
                      ? ""
                      : String(field.defaultValue);
                return (
                  <div
                    key={field.key}
                    className={`rounded-md border border-gray-200 p-3 ${
                      field.enabled ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                          checked={field.enabled}
                          onChange={(event) =>
                            handleFieldToggle(field.key, event.target.checked)
                          }
                        />
                        {field.key}
                      </label>
                      <select
                        value={field.type}
                        onChange={(event) =>
                          handleFieldTypeChange(field.key, event.target.value as FieldType)
                        }
                        disabled={!field.enabled}
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {FIELD_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                          checked={field.required}
                          disabled={!field.enabled}
                          onChange={(event) =>
                            handleFieldRequiredToggle(field.key, event.target.checked)
                          }
                        />
                        Обязательное поле
                      </label>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Заголовок
                        </label>
                        <input
                          type="text"
                          value={field.title}
                          disabled={!field.enabled}
                          onChange={(event) =>
                            handleFieldChange(field.key, { title: event.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Описание
                        </label>
                        <input
                          type="text"
                          value={field.description}
                          disabled={!field.enabled}
                          onChange={(event) =>
                            handleFieldChange(field.key, {
                              description: event.target.value,
                            })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {field.type === "number" && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Единица измерения
                          </label>
                          <input
                            type="text"
                            value={field.unit ?? ""}
                            disabled={!field.enabled}
                            onChange={(event) =>
                              handleFieldChange(field.key, { unit: event.target.value })
                            }
                            placeholder="Например: кВт"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {(field.type === "string" || field.type === "array") && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Перечень значений (enum, через запятую)
                          </label>
                          <input
                            type="text"
                            value={(field.enumValues ?? []).join(", ")}
                            disabled={!field.enabled}
                            onChange={(event) =>
                              handleFieldEnumChange(field.key, event.target.value)
                            }
                            placeholder="IP54, IP65, IP67"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Значение по умолчанию
                        </label>
                        {field.type === "boolean" ? (
                          <select
                            value={
                              field.defaultValue === null || field.defaultValue === undefined
                                ? ""
                                : field.defaultValue
                                ? "true"
                                : "false"
                            }
                            disabled={!field.enabled}
                            onChange={(event) =>
                              handleFieldDefaultChange(field, event.target.value)
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Не задано</option>
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : field.type === "array" ? (
                          <input
                            type="text"
                            value={defaultInputValue}
                            disabled={!field.enabled}
                            onChange={(event) =>
                              handleFieldDefaultChange(field, event.target.value)
                            }
                            placeholder="значение1, значение2"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={defaultInputValue}
                            disabled={!field.enabled}
                            onChange={(event) =>
                              handleFieldDefaultChange(field, event.target.value)
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        {defaultError && (
                          <p className="mt-1 text-xs text-red-600">{defaultError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-semibold text-gray-700">JSON Preview</div>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-[11px] text-gray-800">
{schemaPreview}
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-800">Подключённые пресеты</div>
                <p className="text-xs text-gray-500">
                  Выберите опубликованные пресеты. Они будут объединены с локальными атрибутами.
                </p>
              </div>
              {availablePresets.length === 0 && (
                <span className="text-xs text-gray-400">Нет доступных пресетов</span>
              )}
            </div>
            <div className="max-h-64 space-y-2 overflow-auto pr-1">
              {availablePresets.map((preset) => (
                <label key={preset.id} className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
                    checked={selectedPresetIds.includes(preset.id)}
                    onChange={() => handlePresetToggle(preset.id)}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{preset.title}</div>
                    <div className="text-xs text-gray-500">
                      {preset.code} · {Object.keys(preset.json_schema?.properties ?? {}).length} полей
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Не нашли нужный набор? Создайте его в разделе Presets и обновите список.
            </div>
            <button
              type="button"
              onClick={handleApplyPresetsFields}
              disabled={selectedPresetIds.length === 0}
              className="mt-3 w-full rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              Заполнить полями из выбранных пресетов
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Комментарий к версии</label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: добавили поля по ГОСТ 2025"
            />
          </div>

          <div className="space-y-2 rounded-md border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-800">Сравнение версий</div>
            <div className="text-xs text-gray-500">
              Выберите версию и откройте diff, чтобы увидеть изменения относительно предыдущей.
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={selectedVersionForDiff ?? ""}
                onChange={(event) =>
                  setSelectedVersionForDiff(event.target.value ? Number(event.target.value) : null)
                }
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите версию</option>
                {(schemaVersions ?? []).map((version) => (
                  <option key={version.id} value={version.version}>
                    v{version.version} · {version.status} ·{" "}
                    {new Date(version.created_at).toLocaleDateString("ru-RU")}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedVersionForDiff}
                onClick={() => setDiffModalOpen(true)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Показать diff
              </button>
            </div>
          </div>

          <div className="space-y-2 rounded-md border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-800">Публикация версии</div>
            <div className="text-xs text-gray-500">
              Опубликуйте версию, чтобы сделать её доступной карточкам. После публикации diff появится в журнале.
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={publishingVersion ?? latestSchema?.version ?? ""}
                onChange={(event) =>
                  setPublishingVersion(event.target.value ? Number(event.target.value) : null)
                }
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(schemaVersions ?? []).map((version) => (
                  <option key={version.id} value={version.version}>
                    v{version.version} · {version.status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!publishingVersion || publishMutation.isPending}
                onClick={() => publishingVersion && publishMutation.mutate({ version: publishingVersion })}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {publishMutation.isPending ? "Публикуем..." : "Опубликовать"}
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={mutation.isPending || isSchemasLoading || !nodeId || !schemaHasActiveFields}
            onClick={handleSaveDraft}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? "Сохраняем..." : "Сохранить новую версию"}
          </button>
        </div>
      </div>
    </div>
      {isDiffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <div className="text-lg font-semibold">
                  Diff версии v{selectedVersionForDiff} узла {nodeId}
                </div>
                <div className="text-xs text-gray-500">
                  Показываем изменения относительно предыдущей опубликованной версии.
                </div>
              </div>
              <button
                onClick={() => setDiffModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-4 text-sm text-gray-800">
              {isDiffLoading && <div className="text-gray-500">Загрузка diff…</div>}
              {diffError && (
                <div className="rounded-md bg-red-50 p-3 text-red-600">
                  Не удалось загрузить diff: {diffError instanceof Error ? diffError.message : "ошибка"}
                </div>
              )}
              {!isDiffLoading && schemaDiff && (
                <pre className="rounded-md bg-gray-900 p-4 text-xs text-gray-100 overflow-x-auto">
{JSON.stringify(schemaDiff.diff, null, 2)}
                </pre>
              )}
              {!isDiffLoading && !schemaDiff && !diffError && (
                <div className="text-gray-500">
                  Для выбранной версии нет журнала изменений (возможно, это самая первая версия).
                </div>
              )}
            </div>
            <div className="flex justify-end border-t px-6 py-4">
              <button
                onClick={() => setDiffModalOpen(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
