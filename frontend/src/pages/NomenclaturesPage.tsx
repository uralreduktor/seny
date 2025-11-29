import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import type {
  LifecycleStatus,
  Nomenclature,
  NomenclatureCardListItem,
  PaginatedNomenclatureCards,
} from "@/types";
import { NomenclatureDialog } from "@/components/NomenclatureDialog";

const STATUS_OPTIONS: { label: string; value: "all" | LifecycleStatus }[] = [
  { label: "Все статусы", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Review", value: "review" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { label: "По дате обновления", value: "updated_at" },
  { label: "По коду", value: "code" },
  { label: "По базовой цене", value: "base_price" },
  { label: "По использованию", value: "usage_count" },
];

const mapCardToLegacy = (item: NomenclatureCardListItem): Nomenclature => ({
  id: item.id,
  name: item.canonical_name,
  type: item.type,
  category: item.category,
  manufacturer: item.manufacturer,
  article: item.article,
  base_price: item.base_price,
  price_currency: item.price_currency,
  is_active: item.lifecycle_status === "active",
  created_at: item.audit.created_at,
  updated_at: item.audit.last_reviewed_at ?? item.audit.created_at,
});

export function NomenclaturesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<NomenclatureCardListItem | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLifecycleModalOpen, setLifecycleModalOpen] = useState(false);
  const [isMethodologyModalOpen, setMethodologyModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all" as "all" | LifecycleStatus,
    manufacturer: "",
    code: "",
    hasMethodology: "all" as "all" | "yes" | "no",
    basePriceMin: "",
    basePriceMax: "",
    sortBy: "updated_at",
    sortOrder: "desc" as "asc" | "desc",
  });

  const { data, isLoading, isFetching, error } = useQuery<PaginatedNomenclatureCards>({
    queryKey: ["nomenclature-cards", filters, page],
    queryFn: async () => {
      const params = {
        page,
        page_size: PAGE_SIZE,
        search: filters.search.trim() || undefined,
        lifecycle_status: filters.status === "all" ? undefined : filters.status,
        manufacturer: filters.manufacturer.trim() || undefined,
        code: filters.code.trim() || undefined,
        has_methodology:
          filters.hasMethodology === "all"
            ? undefined
            : filters.hasMethodology === "yes",
        base_price_min:
          filters.basePriceMin !== "" ? Number(filters.basePriceMin) : undefined,
        base_price_max:
          filters.basePriceMax !== "" ? Number(filters.basePriceMax) : undefined,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      };
      const res = await api.get<PaginatedNomenclatureCards>("/nomenclature/cards", {
        params,
      });
      return res.data;
    },
    placeholderData: (prevData) => prevData,
  });

  const cards: NomenclatureCardListItem[] = data?.items ?? [];
  const meta =
    data?.meta ?? { page: 1, page_size: PAGE_SIZE, total: 0, pages: 1 };

  const handleCreate = () => {
    setSelectedCard(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: NomenclatureCardListItem) => {
    setSelectedCard(item);
    setIsDialogOpen(true);
  };

  const handleFilterChange = (updates: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cards.map((item) => item.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedLegacy = useMemo(
    () => (selectedCard ? mapCardToLegacy(selectedCard) : null),
    [selectedCard]
  );

  if (isLoading) return <div className="p-8 text-center">Загрузка...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Ошибка загрузки</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Номенклатура</h1>
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            placeholder="Поиск по названию или коду..."
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => handleFilterChange({ status: e.target.value as LifecycleStatus | "all" })}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Производитель"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.manufacturer}
            onChange={(e) => handleFilterChange({ manufacturer: e.target.value })}
          />
          <input
            type="text"
            placeholder="Код карточки"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.code}
            onChange={(e) => handleFilterChange({ code: e.target.value })}
          />
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + Создать
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.hasMethodology}
          onChange={(e) =>
            handleFilterChange({ hasMethodology: e.target.value as "all" | "yes" | "no" })
          }
        >
          <option value="all">Все карточки</option>
          <option value="yes">Есть методики</option>
          <option value="no">Без методик</option>
        </select>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Цена от"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.basePriceMin}
            onChange={(e) => handleFilterChange({ basePriceMin: e.target.value })}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Цена до"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.basePriceMax}
            onChange={(e) => handleFilterChange({ basePriceMax: e.target.value })}
          />
        </div>
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange({ sortOrder: e.target.value as "asc" | "desc" })}
        >
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={cards.length > 0 && selectedIds.length === cards.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-3 font-medium text-gray-500">Код</th>
              <th className="px-6 py-3 font-medium text-gray-500">Наименование</th>
              <th className="px-6 py-3 font-medium text-gray-500">Тип / Категория</th>
              <th className="px-6 py-3 font-medium text-gray-500">Производитель</th>
              <th className="px-6 py-3 font-medium text-gray-500">Статус</th>
              <th className="px-6 py-3 font-medium text-gray-500">Цена</th>
              <th className="px-6 py-3 font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cards.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  Ничего не найдено
                </td>
              </tr>
            )}
            {cards.map((item: NomenclatureCardListItem) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.code}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{item.canonical_name}</td>
                <td className="px-6 py-4">
                  {item.type && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                      {item.type}
                    </span>
                  )}
                  {item.category}
                </td>
                <td className="px-6 py-4">{item.manufacturer || "—"}</td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                  >
                    {item.lifecycle_status}
                  </span>
                </td>
                <td className="px-6 py-4 tabular-nums">
                  {item.base_price
                    ? new Intl.NumberFormat("ru-RU", {
                        style: "currency",
                        currency: item.price_currency,
                      }).format(Number(item.base_price))
                    : "—"}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Изменить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedIds.length > 0 && (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-4 border-t bg-gray-50 text-sm">
            <div>{selectedIds.length} карточек выбрано</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLifecycleModalOpen(true)}
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Изменить статус
              </button>
              <button
                onClick={() => setMethodologyModalOpen(true)}
                className="px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
              >
                Обновить методики
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-2 text-xs font-medium border rounded-md"
              >
                Снять выделение
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-6 py-4 border-t text-sm text-gray-600">
          <div>
            Страница {meta.page} из {meta.pages} · всего {meta.total} карточек
            {isFetching && <span className="ml-2 text-blue-500">Обновление…</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={meta.page <= 1 || isFetching}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Назад
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(meta.pages, prev + 1))}
              disabled={meta.page >= meta.pages || isFetching}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Вперёд
            </button>
          </div>
        </div>
      </div>

      <NomenclatureDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        nomenclature={selectedLegacy}
      />
      <BulkLifecycleModal
        isOpen={isLifecycleModalOpen}
        onClose={() => setLifecycleModalOpen(false)}
        cardIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([]);
          setLifecycleModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["nomenclature-cards"] });
        }}
      />
      <BulkMethodologyModal
        isOpen={isMethodologyModalOpen}
        onClose={() => setMethodologyModalOpen(false)}
        cardIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([]);
          setMethodologyModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["nomenclature-cards"] });
        }}
      />
    </div>
  );
}

type BulkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cardIds: number[];
  onSuccess: () => void;
};

function BulkLifecycleModal({ isOpen, onClose, cardIds, onSuccess }: BulkModalProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LifecycleStatus>("draft");
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post("/nomenclature/cards/bulk/lifecycle", {
        card_ids: cardIds,
        change: {
          target_status: status,
          reason: reason || undefined,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nomenclature-cards"] });
      onSuccess();
    },
    onError: (err: any) => {
      alert("Ошибка: " + (err.response?.data?.detail || err.message));
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b font-semibold">Массовое изменение статуса</div>
        <form
          className="p-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Новый статус</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as LifecycleStatus)}
            >
              {STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Комментарий</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Причина изменения (опционально)"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded-md text-sm">
              Отмена
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md disabled:opacity-50"
            >
              {mutation.isPending ? "Применение..." : "Применить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkMethodologyModal({ isOpen, onClose, cardIds, onSuccess }: BulkModalProps) {
  const queryClient = useQueryClient();
  const [methodologyIds, setMethodologyIds] = useState("");
  const [mode, setMode] = useState<"replace" | "append" | "remove">("replace");

  const mutation = useMutation({
    mutationFn: async () => {
      const ids = methodologyIds
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value));

      await api.post("/nomenclature/cards/bulk/methodology", {
        card_ids: cardIds,
        methodology_ids: ids,
        mode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nomenclature-cards"] });
      onSuccess();
    },
    onError: (err: any) => {
      alert("Ошибка: " + (err.response?.data?.detail || err.message));
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b font-semibold">Массовое обновление методик</div>
        <form
          className="p-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">ID методик (через запятую)</label>
            <input
              type="text"
              value={methodologyIds}
              onChange={(e) => setMethodologyIds(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Например: 1,2,3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Режим</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={mode}
              onChange={(e) => setMode(e.target.value as "replace" | "append" | "remove")}
            >
              <option value="replace">Заменить</option>
              <option value="append">Добавить</option>
              <option value="remove">Удалить</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded-md text-sm">
              Отмена
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md disabled:opacity-50"
            >
              {mutation.isPending ? "Применение..." : "Применить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
