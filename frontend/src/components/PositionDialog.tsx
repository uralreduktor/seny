import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { useForm, useWatch } from "react-hook-form";
import { api } from "@/lib/api";
import type { ApiErrorResponse, Nomenclature, Position } from "@/types";

interface PositionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  tenderId?: number; // Used for refresh if needed
}

type PositionFormValues = {
  name: string;
  description: string;
  quantity: string;
  unit: string;
  price_per_unit: string;
  nomenclature_id: number | null;
};

const positionDefaults: PositionFormValues = {
  name: "",
  description: "",
  quantity: "",
  unit: "",
  price_per_unit: "",
  nomenclature_id: null,
};

export function PositionDialog({ isOpen, onClose, position }: PositionDialogProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const { register, handleSubmit, reset, setValue, control } = useForm<PositionFormValues>({
    defaultValues: positionDefaults,
  });

  // Fetch nomenclatures for search
  const { data: nomenclatures } = useQuery({
    queryKey: ["nomenclatures"],
    queryFn: async () => {
      const res = await api.get<Nomenclature[]>("/nomenclatures/");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  useEffect(() => {
    if (position) {
      reset({
        name: position.name,
        description: position.description || "",
        quantity: position.quantity.toString(),
        unit: position.unit,
        price_per_unit: position.price_per_unit?.toString() || "",
        nomenclature_id: position.nomenclature_id || null,
      });
    } else {
      reset(positionDefaults);
    }
  }, [position, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (data: PositionFormValues) => {
      if (!position) return; // Only edit mode for now

      const payload = {
        ...data,
        quantity: Number(data.quantity),
        price_per_unit: data.price_per_unit ? Number(data.price_per_unit) : null,
        nomenclature_id: data.nomenclature_id,
      };

      const res = await api.put<Position>(`/positions/${position.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tender", position?.tender_id?.toString()] });
      onClose();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const message = err.response?.data?.detail ?? err.message ?? "Неизвестная ошибка";
      alert("Ошибка сохранения: " + message);
    },
  });

  const selectedNomenclatureId = useWatch({
    control,
    name: "nomenclature_id",
  });
  const selectedNomenclature = selectedNomenclatureId
    ? nomenclatures?.find((n) => n.id === selectedNomenclatureId)
    : null;

  if (!isOpen || !position) return null;

  const onSubmit = (values: PositionFormValues) => {
    mutation.mutate(values);
  };

  const filteredNomenclatures = nomenclatures
    ?.filter(
      (n) =>
        n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.article && n.article.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .slice(0, 5);

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            Редактирование позиции
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Наименование позиции *</label>
            <input
              required
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("name", { required: true })}
            />
            <p className="text-xs text-gray-500 mt-1">Как указано в тендере</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание / Тех. требования</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
              placeholder="Дополнительная информация о позиции"
              {...register("description")}
            />
          </div>

          {/* Nomenclature Search/Select */}
          <div className="relative">
             <label className="block text-sm font-medium text-gray-700 mb-1">Привязка к номенклатуре</label>
             <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    placeholder="Поиск номенклатуры..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             {searchTerm && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredNomenclatures?.map(n => (
                        <div
                            key={n.id}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex justify-between"
                            onClick={() => {
                                setValue("nomenclature_id", n.id);
                                setSearchTerm("");
                            }}
                        >
                            <span>{n.name}</span>
                            <span className="text-gray-500 text-xs">{n.article}</span>
                        </div>
                    ))}
                </div>
             )}

             {selectedNomenclature ? (
                 <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md border border-blue-100">
                    <div className="text-sm text-blue-900 font-medium">
                        {selectedNomenclature.name || "Загрузка..."}
                    </div>
                    <button
                        type="button"
                        onClick={() => setValue("nomenclature_id", null)}
                        className="text-blue-400 hover:text-blue-600"
                    >
                        ✕
                    </button>
                 </div>
             ) : (
                 <div className="text-xs text-gray-500 italic">Номенклатура не выбрана</div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Количество *</label>
              <input
                required
                type="number"
                step="any"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("quantity", { required: true })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ед. изм.</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("unit")}
              />
            </div>
          </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена за ед. (план)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("price_per_unit")}
              />
            </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
