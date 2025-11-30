import { useMutation } from "@tanstack/react-query";
import { isAxiosError, type AxiosError } from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usersApi } from "@/lib/api";
import type { ApiErrorResponse } from "@/types";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Укажите текущий пароль"),
    new_password: z
      .string()
      .min(8, "Минимум 8 символов")
      .regex(/[A-ZА-Я]/, "Добавьте заглавную букву")
      .regex(/[0-9]/, "Добавьте цифру"),
    confirm_password: z.string().min(1, "Подтвердите пароль"),
  })
  .refine(
    (data) => data.new_password === data.confirm_password,
    {
      path: ["confirm_password"],
      message: "Пароли не совпадают",
    }
  );

type ChangePasswordForm = z.infer<typeof passwordSchema>;
type UpdatePasswordPayload = Pick<ChangePasswordForm, "current_password" | "new_password">;

const extractErrorMessage = (error: unknown): string => {
  if (!error) return "";
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail ?? error.message ?? "Ошибка при смене пароля";
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string"
  ) {
    return (error as { response?: { data?: { detail?: string } } }).response?.data?.detail as string;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ошибка при смене пароля";
};

export function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const {
    mutate,
    isPending,
    error: mutationError,
    reset: resetMutation,
  } = useMutation({
    mutationFn: (payload: UpdatePasswordPayload) =>
      usersApi.updateUserPasswordApiV1UsersMePasswordPost(payload),
    onSuccess: () => {
      reset();
      onClose();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      console.error(err);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      resetMutation();
    }
  }, [isOpen, reset, resetMutation]);

  if (!isOpen) return null;

  const onSubmit = (values: ChangePasswordForm) => {
    resetMutation();
    const payload: UpdatePasswordPayload = {
      current_password: values.current_password,
      new_password: values.new_password,
    };
    mutate(payload);
  };

  const serverError = extractErrorMessage(mutationError);

  const handleClose = () => {
    reset();
    resetMutation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Смена пароля</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700" aria-label="Закрыть">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4" noValidate>
          {serverError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm" role="alert">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="current_password">
              Текущий пароль
            </label>
            <input
              id="current_password"
              type="password"
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
              {...register("current_password")}
            />
            {errors.current_password && (
              <p className="mt-1 text-sm text-red-600">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="new_password">
              Новый пароль
            </label>
            <input
              id="new_password"
              type="password"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
              {...register("new_password")}
            />
            {errors.new_password && (
              <p className="mt-1 text-sm text-red-600">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm_password">
              Подтверждение пароля
            </label>
            <input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Сохранение..." : "Изменить пароль"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
