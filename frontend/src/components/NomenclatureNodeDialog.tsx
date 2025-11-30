import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import type { ApiErrorResponse, NomenclatureNode, NodeType } from "@/types";

const NODE_TYPE_ORDER: NodeType[] = ["segment", "family", "class", "category"];

const getChildType = (parent?: NodeType | null): NodeType => {
  if (!parent) return "segment";
  const idx = NODE_TYPE_ORDER.indexOf(parent);
  return NODE_TYPE_ORDER[idx + 1] ?? parent;
};

type FormValues = {
  code: string;
  name: string;
  node_type: NodeType;
  description?: string;
};

type NomenclatureNodeDialogMode = "create" | "edit";

type NomenclatureNodeDialogProps = {
  isOpen: boolean;
  mode: NomenclatureNodeDialogMode;
  onClose: () => void;
  parentNode?: NomenclatureNode | null;
  node?: NomenclatureNode | null;
  onCreated?: (node: NomenclatureNode) => void;
  onUpdated?: (node: NomenclatureNode) => void;
};

export function NomenclatureNodeDialog({
  isOpen,
  mode,
  onClose,
  parentNode,
  node,
  onCreated,
  onUpdated,
}: NomenclatureNodeDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = mode === "edit" && Boolean(node);
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      code: node?.code ?? "",
      name: node?.name ?? "",
      node_type: node?.node_type ?? getChildType(parentNode?.node_type),
      description: node?.description ?? "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      code: node?.code ?? "",
      name: node?.name ?? "",
      node_type: node?.node_type ?? getChildType(parentNode?.node_type),
      description: node?.description ?? "",
    });
  }, [isOpen, node, parentNode, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        code: values.code.trim(),
        name: values.name.trim(),
        node_type: values.node_type,
        description: values.description?.trim() || undefined,
      };

      if (isEditMode && node) {
        const res = await api.patch<NomenclatureNode>(`/nomenclature/nodes/${node.id}`, payload);
        return res.data;
      }

      const res = await api.post<NomenclatureNode>("/nomenclature/nodes", {
        ...payload,
        parent_id: parentNode?.id ?? null,
      });
      return res.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["nomenclature-nodes"] });
      if (isEditMode) {
        onUpdated?.(result);
      } else {
        onCreated?.(result);
      }
      onClose();
    },
    onError: (error: AxiosError<ApiErrorResponse> | Error) => {
      const message =
        "response" in error
          ? error.response?.data?.detail ?? error.message
          : error.message;
      alert(message || "Не удалось сохранить узел");
    },
  });

  if (!isOpen) return null;

  const parentLabel = parentNode
    ? `${parentNode.name} (${parentNode.code})`
    : "Корневой уровень (segment)";
  const title = isEditMode ? "Редактирование узла классификатора" : "Новый узел классификатора";
  const submitLabel = isEditMode
    ? mutation.isPending
      ? "Сохраняем..."
      : "Сохранить"
    : mutation.isPending
      ? "Создаём..."
      : "Создать";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 transition hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4 px-4 py-5"
        >
          {!isEditMode && (
            <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              Родительский узел: <span className="font-medium text-gray-900">{parentLabel}</span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="node_code">
              Код *
            </label>
            <input
              id="node_code"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("code", { required: true })}
              placeholder="Например: SEG-001"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="node_name">
              Наименование *
            </label>
            <input
              id="node_name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("name", { required: true })}
              placeholder="Например: Приводные механизмы"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Тип узла</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("node_type")}
            >
              {NODE_TYPE_ORDER.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              По умолчанию выбран следующий уровень относительно родителя.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Описание (опционально)
            </label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("description")}
              placeholder="Для чего используется узел/класс"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
