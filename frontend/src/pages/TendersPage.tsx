import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { tendersApi } from "@/lib/api";
import { tenderKeys } from "@/lib/queryKeys";
import type { Tender } from "@/types";

export function TendersPage() {
  const navigate = useNavigate();
  const { data: tenders, isLoading, error } = useQuery({
    queryKey: tenderKeys.lists(),
    queryFn: async () => {
      const response = await tendersApi.readTendersApiV1TendersGet();
      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload as Tender[];
      }
      return [];
    },
  });

  if (isLoading) return <div className="p-4 text-center text-gray-500">Загрузка тендеров...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Ошибка загрузки данных</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Тендеры</h1>
        <button
          type="button"
          onClick={() => navigate("/tenders/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Добавить тендер
        </button>
      </div>

      <div className="grid gap-4">
        {tenders?.length === 0 && <div className="text-gray-500">Нет активных тендеров</div>}

        {tenders?.map((tender) => (
          <div
            key={tender.id}
            onClick={() => navigate(`/tenders/${tender.id}`)}
            className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit">
                  {tender.number}
                </div>
                <h3 className="font-semibold text-lg leading-tight">{tender.title}</h3>
                <div className="text-sm text-gray-600">
                  {tender.customer}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-bold text-lg tabular-nums">
                  {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: tender.currency }).format(Number(tender.initial_max_price ?? 0))}
                </div>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tender.stage?.name ?? 'Неизвестно'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
