import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { AxiosError } from "axios";
import { api, tendersApi } from "@/lib/api";
import { tenderKeys } from "@/lib/queryKeys";
import type { Tender, Stage, Position } from "@/types";
import { cn } from "@/lib/utils";
import { PositionDialog } from "@/components/PositionDialog";
import { TenderFiles } from "@/components/TenderFiles";
import { TenderAudit } from "@/components/TenderAudit";

export function TenderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);

  const { data: tender, isLoading, error } = useQuery({
    queryKey: id ? tenderKeys.detail(Number(id)) : tenderKeys.detail(0),
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const response = await tendersApi.readTenderApiV1TendersIdGet(Number(id));
      const payload = response.data;
      return payload as Tender;
    },
    enabled: !!id,
  });

  const { data: stages } = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const res = await tendersApi.readStagesApiV1TendersStagesGet();
      return res.data as Stage[];
    }
  });

  const changeStageMutation = useMutation({
    mutationFn: async (targetStageCode: string) => {
      if (!id) throw new Error("No ID");
      await api.post(`/tenders/${id}/change-stage`, null, {
        params: { target_stage_code: targetStageCode }
      });
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: tenderKeys.detail(Number(id)) });
      }
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      alert(error.response?.data?.detail || "Ошибка смены статуса");
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Загрузка информации о тендере...</div>;
  }

  if (error || !tender) {
    return (
      <div className="p-8 text-center text-red-500">
        Ошибка загрузки тендера или тендер не найден.
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price?: string | number | null, currency: string = "RUB") => {
    if (price === null || price === undefined) return "—";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency,
    }).format(Number(price));
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs / Back link */}
      <div>
        <Link
          to="/tenders"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
        >
          ← Назад к списку
        </Link>
      </div>

      {/* Header Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                ID #{tender.id}
              </span>
              <span className="font-mono text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {tender.number}
              </span>
              <span className="text-sm text-blue-800 bg-blue-50 px-2 py-1 rounded font-medium">
                {tender.customer}
              </span>

              <div className="relative">
                <select
                  className={cn(
                    "appearance-none pl-3 pr-7 py-1 rounded-full text-xs font-medium border-none focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none transition-colors",
                    "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  )}
                  value={tender.stage.code}
                  onChange={(e) => {
                    if (confirm(`Вы уверены, что хотите сменить этап на "${e.target.options[e.target.selectedIndex].text}"?`)) {
                      changeStageMutation.mutate(e.target.value);
                    } else {
                        e.target.value = tender.stage.code; // Reset
                    }
                  }}
                  disabled={changeStageMutation.isPending}
                >
                  {stages?.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-800">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>

              {changeStageMutation.isPending && <span className="text-xs text-gray-500">Updating...</span>}

              {tender.is_archived && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Архив
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{tender.title}</h1>
            {tender.description && (
              <p className="text-gray-600 max-w-3xl">{tender.description}</p>
            )}
          </div>

          <div className="shrink-0 text-right space-y-2">
            <div className="text-sm text-gray-500">Начальная макс. цена</div>
            <div className="text-xl font-bold">
              {formatPrice(tender.initial_max_price, tender.currency)}
            </div>
            <button
              type="button"
              onClick={() => navigate(`/tenders/${tender.id}/edit`)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              ✏️ Редактировать
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Источник</div>
            <div className="font-medium">
              {tender.source === 'eis' ? 'ЕИС Закупки' :
               tender.source === 'sberbank_ast' ? 'Сбербанк-АСТ' :
               tender.source === 'manual' ? 'Вручную' : tender.source}
            </div>
            {tender.source_url && (
              <a href={tender.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block mt-1">
                Ссылка на источник ↗
              </a>
            )}
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Дедлайн подачи</div>
            <div className="font-medium">{formatDate(tender.deadline_at)}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ответственный</div>
            <div className="font-medium text-gray-900">
              {tender.responsible_id ? `ID: ${tender.responsible_id}` : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Инженер</div>
            <div className="font-medium text-gray-900">
              {tender.engineer_id ? `ID: ${tender.engineer_id}` : "—"}
            </div>
          </div>
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Коммерческие условия</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Оплата</div>
                <div className="text-sm">{tender.terms?.payment_terms || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Поставка</div>
                <div className="text-sm">{tender.terms?.delivery_conditions || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Гарантия</div>
                <div className="text-sm">{tender.terms?.warranty || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Срок действия КП</div>
                <div className="text-sm">{tender.terms?.validity_days ? `${tender.terms.validity_days} дней` : "—"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Files Section */}
      <TenderFiles tenderId={tender.id} files={tender.files || []} />

      {/* Positions Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Позиции ({tender.positions.length})</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-500">№</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Наименование</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Кол-во</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Цена за ед.</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Сумма</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tender.positions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Позиции отсутствуют
                    </td>
                  </tr>
                ) : (
                  tender.positions.map((position, index) => (
                    <tr
                      key={position.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedPosition(position);
                        setIsPositionDialogOpen(true);
                      }}
                    >
                      <td className="px-6 py-4 font-mono text-gray-500 w-12">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{position.name}</div>
                        {position.description && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {position.description}
                          </div>
                        )}
                        {position.nomenclature_id && (
                             <div className="mt-1 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">
                                🔗 Привязан к номенклатуре
                             </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {Number(position.quantity)} {position.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPrice(position.price_per_unit, position.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatPrice(
                          Number(position.quantity) * Number(position.price_per_unit || 0),
                          position.currency
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          position.status === 'new' ? "bg-gray-100 text-gray-800" :
                          position.status === 'calculated' ? "bg-green-100 text-green-800" :
                          "bg-blue-100 text-blue-800"
                        )}>
                          {position.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Logs Section */}
      <TenderAudit auditLogs={tender.audit_logs || []} />

      <PositionDialog
        isOpen={isPositionDialogOpen}
        onClose={() => setIsPositionDialogOpen(false)}
        position={selectedPosition}
        tenderId={tender.id}
      />
    </div>
  );
}
