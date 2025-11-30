import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import type {
  ApiErrorResponse,
  LifecycleStatus,
  NomenclatureCardListItem,
  NomenclatureNode,
  PaginatedNomenclatureCards,
  SearchMode,
} from "@/types";
import { NomenclatureDialog } from "@/components/NomenclatureDialog";
import { NomenclatureSchemaEditor } from "@/components/NomenclatureSchemaEditor";
import { NomenclatureNodeDialog } from "@/components/NomenclatureNodeDialog";

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

const SEARCH_MODE_OPTIONS: { label: string; value: SearchMode }[] = [
  { label: "Текстовый", value: "text" },
  { label: "Семантический", value: "semantic" },
  { label: "Комбинированный", value: "combined" },
];

type TreeNode = {
  id: number;
  code: string;
  name: string;
  raw: NomenclatureNode;
  children?: TreeNode[];
};

const buildTree = (nodes: NomenclatureNode[]): TreeNode[] => {
  const byParent: Record<number | "root", TreeNode[]> = { root: [] };
  nodes.forEach((node) => {
    const entry: TreeNode = {
      id: node.id,
      code: node.code,
      name: node.name,
      raw: node,
      children: [],
    };
    const key = node.parent_id ?? "root";
    if (!byParent[key]) byParent[key] = [];
    byParent[key].push(entry);
  });

  const attachChildren = (node: TreeNode) => {
    node.children = byParent[node.id] ?? [];
    node.children.forEach(attachChildren);
  };

  const rootNodes = byParent["root"] ?? [];
  rootNodes.forEach(attachChildren);
  return rootNodes;
};

export function NomenclaturesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [nodeDialogMode, setNodeDialogMode] = useState<"create" | "edit">("create");
  const [nodeDialogParent, setNodeDialogParent] = useState<NomenclatureNode | null>(null);
  const [nodeDialogNode, setNodeDialogNode] = useState<NomenclatureNode | null>(null);
  const [selectedCard, setSelectedCard] = useState<NomenclatureCardListItem | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLifecycleModalOpen, setLifecycleModalOpen] = useState(false);
  const [isMethodologyModalOpen, setMethodologyModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
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
    searchMode: "text" as SearchMode,
  });

  const openCreateNodeDialog = (parent?: NomenclatureNode | null) => {
    setNodeDialogMode("create");
    setNodeDialogParent(parent ?? selectedNode ?? null);
    setNodeDialogNode(null);
    setNodeDialogOpen(true);
  };

  const openEditNodeDialog = (node: NomenclatureNode) => {
    setNodeDialogMode("edit");
    setNodeDialogNode(node);
    setNodeDialogParent(null);
    setNodeDialogOpen(true);
  };

  const nodeArchiveMutation = useMutation<
    void,
    AxiosError<ApiErrorResponse> | Error,
    number
  >({
    mutationFn: async (nodeId: number) => {
      await api.delete(`/nomenclature/nodes/${nodeId}`);
    },
    onSuccess: (_, nodeId) => {
      queryClient.invalidateQueries({ queryKey: ["nomenclature-nodes"] });
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    onError: (error: AxiosError<ApiErrorResponse> | Error) => {
      const message =
        "response" in error
          ? error.response?.data?.detail ?? error.message
          : error.message;
      alert(message || "Не удалось архивировать узел");
    },
  });

  const { data: nodesData, isLoading: isNodesLoading, error: nodesError } = useQuery<NomenclatureNode[]>({
    queryKey: ["nomenclature-nodes"],
    queryFn: async () => {
      const res = await api.get<NomenclatureNode[]>("/nomenclature/nodes");
      return res.data;
    },
  });

  const treeNodes = useMemo(() => buildTree(nodesData ?? []), [nodesData]);
  const selectedNode =
    nodesData?.find((node) => node.id === selectedNodeId) ?? null;

  const { data, isLoading, isFetching, error } = useQuery<PaginatedNomenclatureCards>({
    queryKey: ["nomenclature-cards", filters, page, selectedNodeId],
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
        search_mode: filters.searchMode,
        node_id: selectedNodeId || undefined,
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

  const handleArchiveNode = (node: NomenclatureNode) => {
    const confirmed = window.confirm(
      `Архивировать узел «${node.name}» (${node.code})? Дочерние элементы сохранятся, но сам узел станет недоступен для выбора.`
    );
    if (!confirmed) return;
    nodeArchiveMutation.mutate(node.id);
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

  const renderTree = (nodes: TreeNode[], depth = 0) =>
    nodes.map((node) => {
      const isSelected = selectedNodeId === node.id;
      const isArchiving =
        nodeArchiveMutation.isPending && nodeArchiveMutation.variables === node.id;
      return (
        <div key={node.id} className="space-y-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedNodeId(node.id)}
              className={`flex-1 rounded-md px-2 py-1 text-left text-sm transition hover:bg-blue-50 ${
                isSelected ? "bg-blue-100 text-blue-900" : "text-gray-700"
              }`}
              style={{ paddingLeft: depth * 12 + 8 }}
            >
              <span className="flex items-center justify-between gap-3">
                <span>
                  <span className="font-mono text-xs text-gray-500">{node.code}</span> ·{" "}
                  {node.name}
                </span>
                {node.children && node.children.length > 0 && (
                  <span className="text-xs text-gray-400">{node.children.length}</span>
                )}
              </span>
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md border border-gray-200 p-1 text-xs text-gray-600 hover:bg-gray-50"
                title="Добавить дочерний узел"
                onClick={() => openCreateNodeDialog(node.raw)}
              >
                +
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-200 p-1 text-xs text-gray-600 hover:bg-gray-50"
                title="Редактировать узел"
                onClick={() => openEditNodeDialog(node.raw)}
              >
                ✎
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-200 p-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                title="Архивировать узел"
                onClick={() => handleArchiveNode(node.raw)}
                disabled={isArchiving}
              >
                🗑
              </button>
            </div>
          </div>
          {node.children && node.children.length > 0 && (
            <div className="space-y-1">{renderTree(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });

  if (isLoading || isNodesLoading) return <div className="p-8 text-center">Загрузка...</div>;
  if (error || nodesError)
    return (
      <div className="p-8 text-center text-red-500">
        Ошибка загрузки данных
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-gray-800">Дерево классификатора</div>
          {treeNodes.length === 0 ? (
            <div className="text-xs text-gray-500">Узлы не найдены</div>
          ) : (
            <div className="space-y-1">{renderTree(treeNodes)}</div>
          )}
          <button
            type="button"
            onClick={() => openCreateNodeDialog(selectedNode)}
            className="w-full rounded-md border border-dashed border-blue-300 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            + Добавить узел
          </button>
          {selectedNode && (
            <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              Выбран узел <strong>{selectedNode.name}</strong> ({selectedNode.code}) · версия {selectedNode.version}
            </div>
          )}
        </aside>

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
                value={filters.searchMode}
                onChange={(e) =>
                  handleFilterChange({ searchMode: e.target.value as SearchMode })
                }
              >
                {SEARCH_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
              <Link
                to="/nomenclatures/presets"
                className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline"
              >
                Управление пресетами
              </Link>
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
                  <th className="px-6 py-3 font-medium текст-gray-500">Производитель</th>
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
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-gray-500">{item.code}</span>
                        {filters.search.trim() && typeof item.search_confidence === "number" && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            score {item.search_confidence.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
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
        </div>
      </div>

      <NomenclatureSchemaEditor nodeId={selectedNodeId} />

      <NomenclatureDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedCard(null);
        }}
        card={selectedCard}
        nodeId={selectedNodeId}
      />
      <NomenclatureNodeDialog
        isOpen={isNodeDialogOpen}
        mode={nodeDialogMode}
        onClose={() => setNodeDialogOpen(false)}
        parentNode={nodeDialogParent}
        node={nodeDialogNode}
        onCreated={(node) => {
          setSelectedNodeId(node.id);
        }}
        onUpdated={(updatedNode) => {
          if (selectedNodeId === updatedNode.id) {
            setSelectedNodeId(updatedNode.id);
          }
        }}
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
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const message = err.response?.data?.detail ?? err.message ?? "Неизвестная ошибка";
      alert("Ошибка: " + message);
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
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const message = err.response?.data?.detail ?? err.message ?? "Неизвестная ошибка";
      alert("Ошибка: " + message);
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
