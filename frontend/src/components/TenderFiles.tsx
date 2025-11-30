import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api";
import type { TenderFile } from "@/types";

interface TenderFilesProps {
  tenderId: number;
  files: TenderFile[];
}

export function TenderFiles({ tenderId, files }: TenderFilesProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("technical_task");

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", selectedCategory);

      const res = await api.post<TenderFile>(`/tenders/${tenderId}/files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tender", String(tenderId)] });
      setIsUploading(false);
    },
    onError: (err: AxiosError<{ detail?: string }>) => {
      alert("Ошибка загрузки файла: " + (err.response?.data?.detail || err.message));
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
        if (!confirm("Вы уверены, что хотите удалить этот файл?")) throw new Error("Cancelled");
        await api.delete(`/tenders/${tenderId}/files/${fileId}`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tender", String(tenderId)] });
    },
    onError: (err: Error | AxiosError<{ detail?: string }>) => {
        if (err.message !== "Cancelled") {
            const detailMessage =
              "response" in err && err.response?.data?.detail
                ? err.response.data.detail
                : err.message;
            alert("Ошибка удаления: " + detailMessage);
        }
    }
  });

  const downloadFile = async (file: TenderFile) => {
    try {
      const res = await api.get<{ url: string }>(`/tenders/${tenderId}/files/${file.id}/url`);
      window.open(res.data.url, "_blank");
    } catch {
      alert("Не удалось получить ссылку на скачивание");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      uploadMutation.mutate(e.target.files[0]);
      e.target.value = ""; // Reset
    }
  };

  const categories = [
    { id: "technical_task", label: "Техническое задание" },
    { id: "commercial_proposal", label: "КП" },
    { id: "contract", label: "Договор" },
    { id: "other", label: "Прочее" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Документы ({files.length})</h2>
        <div className="flex items-center gap-2">
           <select
             value={selectedCategory}
             onChange={(e) => setSelectedCategory(e.target.value)}
             className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
           >
             {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
           </select>
           <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {isUploading ? "Загрузка..." : "Загрузить файл"}
              <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
           </label>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          Нет загруженных документов
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-bold uppercase">
                  {file.filename.split('.').pop()?.slice(0, 3)}
                </div>
                <div className="min-w-0">
                  <div
                    className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 hover:underline"
                    onClick={() => downloadFile(file)}
                    title={file.filename}
                  >
                    {file.filename}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] uppercase">
                       {categories.find(c => c.id === file.category)?.label || file.category}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteMutation.mutate(file.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 transition-opacity"
                title="Удалить файл"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
