import type { AuditLog } from "@/types";

interface TenderAuditProps {
    auditLogs: AuditLog[];
}

export function TenderAudit({ auditLogs }: TenderAuditProps) {
    if (!auditLogs || auditLogs.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg bg-white">
                История активности пуста
            </div>
        );
    }

    const formatAction = (action: string) => {
        switch(action) {
            case 'stage_changed': return 'Смена этапа';
            case 'file_uploaded': return 'Загрузка файла';
            case 'tender_created': return 'Тендер создан';
            default: return action;
        }
    };

    const toText = (value: unknown) => {
        if (value === null || value === undefined) {
            return "—";
        }
        return typeof value === "string" ? value : JSON.stringify(value);
    };

    const renderDetails = (details: Record<string, unknown>, action: string) => {
        if (action === 'stage_changed') {
            return (
                <span>
                    с <span className="font-mono bg-gray-100 px-1 rounded">{toText(details.from)}</span> на <span className="font-mono bg-blue-50 text-blue-700 px-1 rounded">{toText(details.to)}</span>
                </span>
            );
        }
        if (action === 'file_uploaded') {
            return (
                <span>
                    файл <span className="font-medium">{toText(details.filename)}</span> ({toText(details.category)})
                </span>
            );
        }
        return JSON.stringify(details);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">История активности</h3>
            </div>
            <div className="flow-root">
                <ul className="divide-y divide-gray-200">
                    {auditLogs.map((log) => (
                        <li key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-3">
                                <div className="shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                        ID{log.user_id || '?'}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatAction(log.action)}
                                    </p>
                                    <div className="text-sm text-gray-500 mt-0.5">
                                        {renderDetails(log.details, log.action)}
                                    </div>
                                </div>
                                <div className="shrink-0 text-xs text-gray-400 whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString("ru-RU")}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
