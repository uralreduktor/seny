import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition, useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import type {
  ApiErrorResponse,
  NomenclatureCard,
  NomenclatureCardListItem,
  NomenclatureNodeSchemaVersion,
} from "@/types";
import { NomenclatureAttributesForm } from "@/components/NomenclatureAttributesForm";

interface NomenclatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  card?: NomenclatureCardListItem | null;
  nodeId?: number | null;
}

type AttributeValue = string | number | null | string[];

type CustomField = {
  id: string;
  key: string;
  value: string;
};

type NomenclatureCardFormValues = {
  canonical_name: string;
  type: string;
  category: string;
  manufacturer: string;
  article: string;
  base_price: string;
  price_currency: string;
};

const nomenclatureDefaults: NomenclatureCardFormValues = {
  canonical_name: "",
  type: "",
  category: "",
  manufacturer: "",
  article: "",
  base_price: "",
  price_currency: "RUB",
};

type SubmitPayload = {
  formValues: NomenclatureCardFormValues;
  attributes: Record<string, AttributeValue>;
};

const normalizeAttributes = (
  payload?: Record<string, unknown>
): Record<string, AttributeValue> => {
  if (!payload) return {};
  const result: Record<string, AttributeValue> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === "number") {
      result[key] = value;
    } else if (typeof value === "string") {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry);
    } else {
      result[key] = String(value);
    }
  });
  return result;
};

export function NomenclatureDialog({ isOpen, onClose, card, nodeId }: NomenclatureDialogProps) {
  const queryClient = useQueryClient();
  const [attributesValues, setAttributesValues] = useState<Record<string, AttributeValue>>({});
  const { register, handleSubmit, reset } = useForm<NomenclatureCardFormValues>({
    defaultValues: nomenclatureDefaults,
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const generateFieldId = useMemo(
    () =>
      () =>
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
    []
  );

  const effectiveNodeId = card?.node_id ?? nodeId ?? null;

  const { data: cardDetails, isFetching: isCardLoading } = useQuery({
    queryKey: ["nomenclature-card", card?.id],
    enabled: isOpen && Boolean(card?.id),
    queryFn: async () => {
      if (!card?.id) return null;
      const res = await api.get<NomenclatureCard>(`/nomenclature/cards/${card.id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (cardDetails) {
      reset({
        canonical_name: cardDetails.canonical_name,
        type: cardDetails.type ?? "",
        category: cardDetails.category ?? "",
        manufacturer: cardDetails.manufacturer ?? "",
        article: cardDetails.article ?? "",
        base_price: cardDetails.base_price ? String(cardDetails.base_price) : "",
        price_currency: cardDetails.price_currency ?? "RUB",
      });
      startTransition(() => {
        setAttributesValues(normalizeAttributes(cardDetails.attributes_payload));
        setCustomFields(
          Object.entries(cardDetails.tags ?? {}).map(([key, value]) => ({
            id: generateFieldId(),
            key,
            value: value === null || value === undefined ? "" : String(value),
          }))
        );
      });
    } else if (!card) {
      reset(nomenclatureDefaults);
      startTransition(() => {
        setAttributesValues({});
        setCustomFields([]);
      });
    }
  }, [cardDetails, card, generateFieldId, isOpen, reset]);

  const { data: schemaVersions, isLoading: isSchemaLoading } = useQuery({
    queryKey: ["nomenclature-node-schema", effectiveNodeId],
    enabled: isOpen && Boolean(effectiveNodeId),
    queryFn: async () => {
      const res = await api.get<NomenclatureNodeSchemaVersion[]>(
        `/nomenclature/nodes/${effectiveNodeId}/schemas`
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const latestSchema = schemaVersions?.[0]?.json_schema as Record<string, unknown> | undefined;

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ formValues, attributes }: SubmitPayload) => {
      const sanitizedAttributes = Object.fromEntries(
        Object.entries(attributes || {}).filter(([, value]) => value !== undefined)
      );
      const customTags = Object.fromEntries(
        customFields
          .map((field) => [field.key.trim(), field.value])
          .filter(([key]) => key.length > 0)
      );
      const payload = {
        canonical_name: formValues.canonical_name.trim(),
        type: formValues.type || undefined,
        category: formValues.category || undefined,
        manufacturer: formValues.manufacturer || undefined,
        article: formValues.article || undefined,
        base_price: formValues.base_price === "" ? null : Number(formValues.base_price),
        price_currency: formValues.price_currency || "RUB",
        attributes_payload: sanitizedAttributes,
        tags: Object.keys(customTags).length > 0 ? customTags : undefined,
      };

      if (card) {
        const res = await api.patch<NomenclatureCard>(`/nomenclature/cards/${card.id}`, payload);
        return res.data;
      }

      if (!effectiveNodeId) {
        throw new Error("Не выбран узел классификатора");
      }

      const res = await api.post<NomenclatureCard>("/nomenclature/cards", {
        ...payload,
        node_id: effectiveNodeId,
      });
      return res.data;
    },
  });

  if (!isOpen) return null;

  const schemaUnavailable = !latestSchema && !isSchemaLoading;
  const showNodeWarning = !card && !effectiveNodeId;

  const onSubmit = async (values: NomenclatureCardFormValues) => {
    try {
      await mutateAsync({ formValues: values, attributes: attributesValues });
      queryClient.invalidateQueries({ queryKey: ["nomenclature-cards"] });
      onClose();
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse> | Error;
      const detail =
        "response" in (err as AxiosError<ApiErrorResponse>)
          ? (err as AxiosError<ApiErrorResponse>).response?.data?.detail ??
            (err as AxiosError<ApiErrorResponse>).message
          : err.message;
      alert(detail || "Не удалось сохранить карточку");
    }
  };

  const handleClose = () => {
    setAttributesValues({});
    setCustomFields([]);
    onClose();
  };

  const handleAddCustomField = () => {
    setCustomFields((prev) => [...prev, { id: generateFieldId(), key: "", value: "" }]);
  };

  const handleCustomFieldChange = (id: string, patch: Partial<CustomField>) => {
    setCustomFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...patch } : field))
    );
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== id));
  };

  const formTitle = card ? "Редактирование номенклатуры" : "Новая номенклатура";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{formTitle}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Каноническое имя *</label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="canonical_name"
                  {...register("canonical_name", { required: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("type")}
                    placeholder="Например: Редуктор"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("category")}
                    placeholder="Цилиндрический"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Производитель</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("manufacturer")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Артикул</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("article")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Базовая цена</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("base_price")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("price_currency")}
                  >
                    <option value="RUB">RUB</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                {showNodeWarning && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    Выберите узел классификатора слева, чтобы создать карточку.
                  </div>
                )}
                {schemaUnavailable && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Для выбранного узла пока нет опубликованной схемы. Атрибуты будут сохранены как пустые.
                  </div>
                )}
                <NomenclatureAttributesForm
                  schema={latestSchema}
                  isLoading={isSchemaLoading || isCardLoading}
                  values={attributesValues}
                  onChange={setAttributesValues}
                  disabled={showNodeWarning}
                />
              </div>
              <div className="space-y-2 rounded-md border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Дополнительные поля</div>
                    <p className="text-xs text-gray-500">
                      Уникальные характеристики, которые не входят в схему узла. Сохраняются как tags карточки.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    + Поле
                  </button>
                </div>
                {customFields.length === 0 && (
                  <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500">
                    Нет дополнительных полей. Добавьте поле, чтобы зафиксировать собственный параметр.
                  </div>
                )}
                <div className="space-y-2">
                  {customFields.map((field) => (
                    <div key={field.id} className="rounded-md bg-gray-50 p-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={field.key}
                          onChange={(event) =>
                            handleCustomFieldChange(field.id, { key: event.target.value })
                          }
                          placeholder="Ключ (например, service_factor)"
                          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(field.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Удалить
                        </button>
                      </div>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(event) =>
                          handleCustomFieldChange(field.id, { value: event.target.value })
                        }
                        placeholder="Значение"
                        className="mt-2 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending || showNodeWarning}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
