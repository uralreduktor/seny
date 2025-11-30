import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { api } from "@/lib/api";
import type {
  ApiErrorResponse,
  NomenclatureAttributePreset,
  SchemaStatus,
} from "@/types";
import {
  buildSchemaPayload,
  convertSchemaToFields,
  FIELD_TYPE_OPTIONS,
} from "@/utils/schemaFields";
import type { SchemaFieldForm, FieldType } from "@/utils/schemaFields";

const STATUS_OPTIONS: { label: string; value: "all" | SchemaStatus }[] = [
  { label: "Все статусы", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Review", value: "review" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

type PresetFormValues = {
  code: string;
  title: string;
  description: string;
  version: string;
};

const EMPTY_FORM: PresetFormValues = {
  code: "",
  title: "",
  description: "",
  version: "1",
};

export function NomenclaturePresetsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | SchemaStatus>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<NomenclatureAttributePreset | null>(null);
  const [formValues, setFormValues] = useState<PresetFormValues>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [schemaFields, setSchemaFields] = useState<SchemaFieldForm[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("string");

  const { data, isLoading, error } = useQuery({
    queryKey: ["nomenclature-presets", statusFilter],
    queryFn: async () => {
      const params =
        statusFilter === "all"
          ? undefined
          : {
              status: statusFilter,
            };
      const res = await api.get<NomenclatureAttributePreset[]>("/nomenclature/presets", {
        params,
      });
      return res.data;
    },
  });

  const presets = useMemo(() => data ?? [], [data]);

  const mutation = useMutation({
    mutationFn: async (payload: {
      mode: "create" | "update";
      id?: number;
      form: PresetFormValues;
      schema: Record<string, unknown>;
    }) => {
      const base = {
        title: payload.form.title.trim(),
        description: payload.form.description.trim() || undefined,
        json_schema: payload.schema,
        version: Number(payload.form.version) || 1,
      };

      if (payload.mode === "create") {
        const createPayload = {
          ...base,
          code: payload.form.code.trim(),
        };
        const res = await api.post<NomenclatureAttributePreset>("/nomenclature/presets", createPayload);
        return res.data;
      }

      const res = await api.patch<NomenclatureAttributePreset>(
        `/nomenclature/presets/${payload.id}`,
        base
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nomenclature-presets"] });
      handleCloseModal();
    },
    onError: (err: Error | AxiosError<ApiErrorResponse>) => {
      if ("isAxiosError" in err) {
        const axiosErr = err as AxiosError<ApiErrorResponse>;
        const message = axiosErr.response?.data?.detail ?? axiosErr.message;
        setFormError(message ?? "Не удалось сохранить пресет");
      } else {
        setFormError(err.message);
      }
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (presetId: number) => {
      await api.delete(`/nomenclature/presets/${presetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nomenclature-presets"] });
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const message = err.response?.data?.detail ?? err.message ?? "Ошибка удаления";
      alert(message);
    },
  });

  const handleCreate = () => {
    setEditingPreset(null);
    setFormValues(EMPTY_FORM);
    setFormError(null);
    setSchemaFields([]);
    setFieldErrors({});
    setNewFieldKey("");
    setNewFieldType("string");
    setModalOpen(true);
  };

  const handleEdit = (preset: NomenclatureAttributePreset) => {
    setEditingPreset(preset);
    setFormValues({
      code: preset.code,
      title: preset.title,
      description: preset.description ?? "",
      version: preset.version.toString(),
    });
    setSchemaFields(convertSchemaToFields(preset.json_schema));
    setFieldErrors({});
    setNewFieldKey("");
    setNewFieldType("string");
    setFormError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPreset(null);
    setFormValues(EMPTY_FORM);
    setFormError(null);
    setSchemaFields([]);
    setFieldErrors({});
    setNewFieldKey("");
    setNewFieldType("string");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const hasErrors = validateFieldsBeforeSave();
    if (hasErrors) {
      setFormError("Исправьте ошибки в атрибутах пресета");
      return;
    }
    const schemaPayload = buildSchemaPayload(schemaFields);
    const propertiesCount = Object.keys(
      (schemaPayload.properties as Record<string, unknown>) ?? {}
    ).length;
    if (propertiesCount === 0) {
      setFormError("Добавьте и включите хотя бы одно поле в пресет");
      return;
    }
    mutation.mutate({
      mode: editingPreset ? "update" : "create",
      id: editingPreset?.id,
      form: formValues,
      schema: schemaPayload,
    });
  };

  const handleFieldChange = (fieldKey: string, patch: Partial<SchemaFieldForm>) => {
    setSchemaFields((prev) =>
      prev.map((field) => (field.key === fieldKey ? { ...field, ...patch } : field))
    );
  };

  const handleFieldToggle = (fieldKey: string, enabled: boolean) => {
    handleFieldChange(fieldKey, { enabled });
  };

  const handleFieldRequiredToggle = (fieldKey: string, required: boolean) => {
    handleFieldChange(fieldKey, { required });
  };

  const setFieldError = (fieldKey: string, message: string | null) => {
    setFieldErrors((prev) => ({ ...prev, [fieldKey]: message }));
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
      handleFieldChange(field.key, { defaultValue: rawValue === "" ? null : rawValue === "true" });
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
      setFormError("Укажите ключ для нового поля");
      return;
    }
    if (schemaFields.some((field) => field.key === trimmedKey)) {
      setFormError("Поле с таким ключом уже существует");
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

  const handleRemoveField = (fieldKey: string) => {
    setSchemaFields((prev) => prev.filter((field) => field.key !== fieldKey));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
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

  const schemaPreview = useMemo(
    () => JSON.stringify(buildSchemaPayload(schemaFields), null, 2),
    [schemaFields]
  );

  const visiblePresets = useMemo(() => {
    if (!statusFilter || statusFilter === "all") return presets;
    return presets.filter((preset) => preset.status === statusFilter);
  }, [presets, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Пресеты атрибутов</h1>
          <p className="text-sm text-gray-500">
            Группы атрибутов, которые можно подключать к схемам классов. Статус Published означает, что пресет доступен для использования.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Новый пресет
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Статус</label>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | SchemaStatus)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {isLoading && <div className="text-sm text-gray-500">Загрузка...</div>}
        {error && <div className="text-sm text-red-500">Ошибка загрузки пресетов</div>}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Код</th>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Версия</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Дата создания</th>
              <th className="px-4 py-3 font-medium w-1/3">Схема</th>
              <th className="px-4 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visiblePresets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Пресеты не найдены
                </td>
              </tr>
            )}
            {visiblePresets.map((preset) => (
              <tr key={preset.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{preset.code}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{preset.title}</div>
                  {preset.description && (
                    <div className="text-xs text-gray-500">{preset.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">{preset.version}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={preset.status} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(preset.created_at).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-3">
                  <SchemaSummary schema={preset.json_schema} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(preset)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => {
                        if (
                          !archiveMutation.isPending &&
                          window.confirm(`Архивировать пресет ${preset.code}?`)
                        ) {
                          archiveMutation.mutate(preset.id);
                        }
                      }}
                      className="text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      Архивировать
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl max-h-[90vh]">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <div className="text-lg font-semibold">
                  {editingPreset ? "Редактирование пресета" : "Новый пресет"}
                </div>
                <div className="text-xs text-gray-500">
                  Код пресета должен быть уникальным, а JSON Schema — валидным.
                </div>
              </div>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {formError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Код</label>
                  <input
                    type="text"
                    value={formValues.code}
                    disabled={Boolean(editingPreset)}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, code: event.target.value }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="gear_drive"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Название</label>
                  <input
                    type="text"
                    value={formValues.title}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Описание</label>
                <textarea
                  value={formValues.description}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Версия</label>
                  <input
                    type="number"
                    min={1}
                    value={formValues.version}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, version: event.target.value }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-4 rounded-md border border-gray-200 p-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Атрибуты JSON Schema</div>
                  <p className="text-xs text-gray-500">
                    Пресет хранит только собственные поля. Наследование выполняется на уровне узла.
                  </p>
                </div>
                <div className="rounded-md border border-dashed border-gray-200 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={newFieldKey}
                      onChange={(event) => setNewFieldKey(event.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ключ поля"
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
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Добавить поле
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Ключ должен быть уникальным и состоять из латинских букв, цифр и подчёркиваний.
                  </p>
                </div>

                {schemaFields.length === 0 && (
                  <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                    Полей пока нет. Добавьте первую характеристику, чтобы сформировать пресет.
                  </div>
                )}

                <div className="space-y-3">
                  {schemaFields.map((field) => {
                    const defaultStringValue = Array.isArray(field.defaultValue)
                      ? field.defaultValue.join(", ")
                      : field.defaultValue === null || field.defaultValue === undefined
                        ? ""
                        : String(field.defaultValue);
                    return (
                    <div
                      key={field.key}
                      className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
                          checked={field.enabled}
                          onChange={(event) => handleFieldToggle(field.key, event.target.checked)}
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col gap-2 lg:flex-row">
                            <input
                              type="text"
                              value={field.key}
                              onChange={(event) =>
                                handleFieldChange(field.key, { key: event.target.value })
                              }
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 lg:w-1/3"
                              placeholder="Ключ"
                              disabled={!field.enabled}
                            />
                            <select
                              value={field.type}
                              onChange={(event) =>
                                handleFieldTypeChange(field.key, event.target.value as FieldType)
                              }
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 lg:w-1/4"
                              disabled={!field.enabled}
                            >
                              {FIELD_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <label className="flex items-center gap-2 text-xs text-gray-600 lg:w-1/4">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(event) =>
                                  handleFieldRequiredToggle(field.key, event.target.checked)
                                }
                                disabled={!field.enabled}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                              />
                              Обязательное
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveField(field.key)}
                              className="text-sm text-red-500 hover:text-red-700"
                              disabled={!field.enabled}
                            >
                              Удалить
                            </button>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-500">Заголовок</label>
                              <input
                                type="text"
                                value={field.title}
                                onChange={(event) =>
                                  handleFieldChange(field.key, { title: event.target.value })
                                }
                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                disabled={!field.enabled}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-500">Единица измерения</label>
                              <input
                                type="text"
                                value={field.unit ?? ""}
                                onChange={(event) =>
                                  handleFieldChange(field.key, { unit: event.target.value })
                                }
                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                disabled={!field.enabled || field.type !== "number"}
                                placeholder="кВт, мм..."
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Описание</label>
                            <textarea
                              value={field.description}
                              onChange={(event) =>
                                handleFieldChange(field.key, { description: event.target.value })
                              }
                              className="min-h-[60px] w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              disabled={!field.enabled}
                            />
                          </div>

                          {(field.type === "string" || field.type === "array") && (
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-500">
                                Допустимые значения (через запятую)
                              </label>
                              <input
                                type="text"
                                value={field.enumValues?.join(", ") ?? ""}
                                onChange={(event) =>
                                  handleFieldEnumChange(field.key, event.target.value)
                                }
                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                disabled={!field.enabled}
                              />
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">
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
                                onChange={(event) =>
                                  handleFieldDefaultChange(field, event.target.value)
                                }
                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                disabled={!field.enabled}
                              >
                                <option value="">Не задано</option>
                                <option value="true">true</option>
                                <option value="false">false</option>
                              </select>
                            ) : field.type === "array" ? (
                              <input
                                type="text"
                                value={defaultStringValue}
                                onChange={(event) =>
                                  handleFieldDefaultChange(field, event.target.value)
                                }
                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                disabled={!field.enabled}
                                placeholder="значение1, значение2"
                              />
                            ) : (
                              <input
                                type={field.type === "number" ? "number" : "text"}
                                value={defaultStringValue}
                                onChange={(event) =>
                                  handleFieldDefaultChange(field, event.target.value)
                                }
                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                disabled={!field.enabled}
                              />
                            )}
                            {fieldErrors[field.key] && (
                              <div className="text-xs text-red-600">{fieldErrors[field.key]}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">JSON Preview</label>
                  <pre className="max-h-64 overflow-auto rounded-md bg-gray-900 p-3 text-xs text-white">
{schemaPreview}
                  </pre>
                </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {mutation.isPending ? "Сохранение…" : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SchemaStatus }) {
  const colors: Record<SchemaStatus, string> = {
    draft: "bg-gray-100 text-gray-700",
    review: "bg-amber-100 text-amber-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}

function SchemaSummary({ schema }: { schema: Record<string, unknown> }) {
  const keys = Object.keys(schema?.properties ?? {});
  if (keys.length === 0) {
    return <span className="text-xs text-gray-400">Пустая схема</span>;
  }

  return (
    <div className="text-xs text-gray-600">
      {keys.slice(0, 3).map((key) => (
        <Fragment key={key}>
          <span className="font-mono text-gray-800">{key}</span>
          <span>, </span>
        </Fragment>
      ))}
      {keys.length > 3 && <span>+{keys.length - 3} ещё</span>}
    </div>
  );
}
