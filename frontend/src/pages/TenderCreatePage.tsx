import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { tendersApi } from "@/lib/api";
import { tenderKeys } from "@/lib/queryKeys";
import type { TenderCreate, TenderResponse, TenderUpdate } from "@/api/generated/models";

const SOURCE_OPTIONS = [
  { value: "manual", label: "Ручной ввод" },
  { value: "eis", label: "ЕИС" },
  { value: "sberbank_ast", label: "Сбербанк-АСТ" },
  { value: "roseltorg", label: "Росэлторг" },
];

type FormState = {
  number: string;
  title: string;
  customer: string;
  description: string;
  source: string;
  sourceUrl: string;
  deadlineDate: string;
  deadlineTime: string;
  initialMaxPrice: string;
  currency: string;
  paymentTerms: string;
  deliveryConditions: string;
  warranty: string;
  validityDays: string;
};

const generateTenderNumber = () =>
  `TN-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)}`;

const createInitialState = (): FormState => ({
  number: generateTenderNumber(),
  title: "",
  customer: "",
  description: "",
  source: "manual",
  sourceUrl: "",
  deadlineDate: "",
  deadlineTime: "",
  initialMaxPrice: "",
  currency: "RUB",
  paymentTerms: "",
  deliveryConditions: "",
  warranty: "",
  validityDays: "",
});

export function TenderCreatePage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState<FormState>(createInitialState);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isLoading: isFormLoading } = useQuery({
    queryKey: id ? tenderKeys.detail(Number(id)) : ["tender-form"],
    queryFn: async () => {
      if (!id) {
        return null;
      }
      const response = await tendersApi.readTenderApiV1TendersIdGet(Number(id));
      const tender = response.data as TenderResponse;
      setForm({
        number: tender.number ?? "",
        title: tender.title ?? "",
        customer: tender.customer ?? "",
        description: tender.description ?? "",
        source: tender.source ?? "manual",
        sourceUrl: tender.source_url ?? "",
        deadlineDate: tender.deadline_at
          ? new Date(tender.deadline_at).toISOString().substring(0, 10)
          : "",
        deadlineTime: tender.deadline_at
          ? new Date(tender.deadline_at).toISOString().substring(11, 16)
          : "",
        initialMaxPrice: tender.initial_max_price
          ? String(tender.initial_max_price)
          : "",
        currency: tender.currency ?? "RUB",
        paymentTerms: tender.terms?.payment_terms ?? "",
        deliveryConditions: tender.terms?.delivery_conditions ?? "",
        warranty: tender.terms?.warranty ?? "",
        validityDays: tender.terms?.validity_days
          ? String(tender.terms.validity_days)
          : "",
      });
      return tender;
    },
    enabled: isEditMode,
  });

  const createTenderMutation = useMutation({
    mutationFn: async (payload: TenderCreate) => {
      const response = await tendersApi.createTenderApiV1TendersPost(payload);
      return response.data as TenderResponse;
    },
    onSuccess: (tender) => {
      queryClient.invalidateQueries({ queryKey: tenderKeys.lists() });
      navigate(`/tenders/${tender.id}`);
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      setFormError(
        error.response?.data?.detail ??
          "Не удалось создать тендер. Попробуйте ещё раз."
      );
    },
  });

  const updateTenderMutation = useMutation({
    mutationFn: async (payload: TenderUpdate) => {
      if (!id) throw new Error("No ID");
      const response = await tendersApi.updateTenderApiV1TendersIdPut(
        Number(id),
        payload
      );
      return response.data as TenderResponse;
    },
    onSuccess: (tender) => {
      queryClient.invalidateQueries({ queryKey: tenderKeys.detail(tender.id) });
      queryClient.invalidateQueries({ queryKey: tenderKeys.lists() });
      navigate(`/tenders/${tender.id}`);
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      setFormError(
        error.response?.data?.detail ??
          "Не удалось обновить тендер. Попробуйте ещё раз."
      );
    },
  });

  const handleChange = (
    field: keyof FormState,
    value: FormState[keyof FormState]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = (): TenderCreate | TenderUpdate => {
    if (!form.deadlineDate) {
      throw new Error("Укажите дату дедлайна");
    }

    const deadline_at = new Date(
      `${form.deadlineDate}T${form.deadlineTime || "12:00"}`
    ).toISOString();

    const terms: Record<string, unknown> = {};
    if (form.paymentTerms) terms.payment_terms = form.paymentTerms;
    if (form.deliveryConditions) terms.delivery_conditions = form.deliveryConditions;
    if (form.warranty) terms.warranty = form.warranty;
    if (form.validityDays) terms.validity_days = Number(form.validityDays);

    const basePayload = {
      number: form.number,
      title: form.title,
      customer: form.customer,
      description: form.description || undefined,
      source: form.source as TenderCreate["source"],
      source_url: form.sourceUrl || undefined,
      deadline_at,
      initial_max_price: form.initialMaxPrice
        ? Number(form.initialMaxPrice)
        : undefined,
      currency: form.currency || "RUB",
      terms: Object.keys(terms).length ? terms : {},
      published_at: undefined,
      responsible_id: undefined,
      engineer_id: undefined,
    };

    if (isEditMode) {
      return basePayload;
    }

    return basePayload as TenderCreate;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    try {
      const payload = buildPayload();
      if (isEditMode) {
        updateTenderMutation.mutate(payload as TenderUpdate);
      } else {
        createTenderMutation.mutate(payload as TenderCreate);
      }
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Некорректные данные формы.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link
          to="/tenders"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
        >
          ← Назад к списку тендеров
        </Link>
        {isEditMode && (
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            ID #{id}
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Редактирование тендера" : "Новый тендер"}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {isEditMode
              ? "Обновите данные и сохраните изменения."
              : "Заполните обязательные поля. После сохранения вы сможете добавить позиции и файлы."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Основная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Номер *{" "}
                  <span className="text-xs text-gray-400">
                    {isEditMode
                      ? "измените, если тендер переименовали"
                      : "можно сгенерировать автоматически или ввести вручную"}
                  </span>
                </label>
                <div className="flex gap-2 items-start">
                  <input
                    className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={form.number}
                    onChange={(e) => handleChange("number", e.target.value)}
                    required
                    disabled={isFormLoading}
                  />
                  {!isEditMode && (
                    <button
                      type="button"
                      className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                      onClick={() => handleChange("number", generateTenderNumber())}
                      disabled={isFormLoading}
                    >
                      Сгенерировать
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Название *</label>
                <input
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  disabled={isFormLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Заказчик *</label>
                <input
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={form.customer}
                  onChange={(e) => handleChange("customer", e.target.value)}
                  required
                  disabled={isFormLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Источник</label>
                <select
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={form.source}
                  onChange={(e) => handleChange("source", e.target.value)}
                >
                  {SOURCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Описание</label>
                <textarea
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={isFormLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ссылка на источник</label>
                <input
                  type="url"
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={form.sourceUrl}
                  onChange={(e) => handleChange("sourceUrl", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Дата дедлайна *</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={form.deadlineDate}
                  onChange={(e) => handleChange("deadlineDate", e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="mt-2 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={form.deadlineTime}
                  onChange={(e) => handleChange("deadlineTime", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Финансы</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Начальная цена</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={form.initialMaxPrice}
                  onChange={(e) => handleChange("initialMaxPrice", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Валюта</label>
                <input
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Коммерческие условия</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Оплата</label>
                <textarea
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={form.paymentTerms}
                  onChange={(e) => handleChange("paymentTerms", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Условия поставки</label>
                <textarea
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={form.deliveryConditions}
                  onChange={(e) =>
                    handleChange("deliveryConditions", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Гарантия</label>
                <textarea
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={form.warranty}
                  onChange={(e) => handleChange("warranty", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Срок действия КП (дней)</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={form.validityDays}
                  onChange={(e) => handleChange("validityDays", e.target.value)}
                />
              </div>
            </div>
          </section>

          {formError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => navigate("/tenders")}
              disabled={isFormLoading || createTenderMutation.isPending || updateTenderMutation.isPending}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              disabled={isFormLoading || createTenderMutation.isPending || updateTenderMutation.isPending}
            >
              {isEditMode
                ? updateTenderMutation.isPending ? "Сохранение..." : "Сохранить изменения"
                : createTenderMutation.isPending ? "Сохранение..." : "Создать тендер"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
