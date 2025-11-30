import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { usersApi } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  usersApi: {
    updateUserPasswordApiV1UsersMePasswordPost: vi.fn(),
  },
}));

const mockedUsersApi = vi.mocked(usersApi);

const renderWithProviders = (ui: ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("ChangePasswordDialog", () => {
  afterEach(() => {
    mockedUsersApi.updateUserPasswordApiV1UsersMePasswordPost.mockReset();
  });

  it("не рендерится, когда закрыт", () => {
    renderWithProviders(<ChangePasswordDialog isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText("Смена пароля")).not.toBeInTheDocument();
  });

  it("показывает ошибку, если пароли не совпадают", async () => {
    renderWithProviders(<ChangePasswordDialog isOpen onClose={vi.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Текущий пароль"), "CurrentPass1");
    await user.type(screen.getByLabelText("Новый пароль"), "NewPass1A");
    await user.type(screen.getByLabelText("Подтверждение пароля"), "Different1A");
    await user.click(screen.getByRole("button", { name: "Изменить пароль" }));

    expect(await screen.findByText("Пароли не совпадают")).toBeInTheDocument();
    expect(mockedUsersApi.updateUserPasswordApiV1UsersMePasswordPost).not.toHaveBeenCalled();
  });

  it("отправляет данные и закрывает диалог при успехе", async () => {
    const onClose = vi.fn();
    mockedUsersApi.updateUserPasswordApiV1UsersMePasswordPost.mockResolvedValue({ data: {} });

    renderWithProviders(<ChangePasswordDialog isOpen onClose={onClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Текущий пароль"), "CurrentPass1");
    await user.type(screen.getByLabelText("Новый пароль"), "NewPass1A");
    await user.type(screen.getByLabelText("Подтверждение пароля"), "NewPass1A");
    await user.click(screen.getByRole("button", { name: "Изменить пароль" }));

    await waitFor(() => {
      expect(mockedUsersApi.updateUserPasswordApiV1UsersMePasswordPost).toHaveBeenCalledWith({
        current_password: "CurrentPass1",
        new_password: "NewPass1A",
      });
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("отображает сообщение об ошибке сервера", async () => {
    mockedUsersApi.updateUserPasswordApiV1UsersMePasswordPost.mockRejectedValue({
      response: { data: { detail: "Неверный текущий пароль" } },
      message: "Request failed",
    });

    renderWithProviders(<ChangePasswordDialog isOpen onClose={vi.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Текущий пароль"), "CurrentPass1");
    await user.type(screen.getByLabelText("Новый пароль"), "NewPass1A");
    await user.type(screen.getByLabelText("Подтверждение пароля"), "NewPass1A");
    await user.click(screen.getByRole("button", { name: "Изменить пароль" }));

    expect(
      await screen.findByText("Неверный текущий пароль", undefined, { timeout: 2000 })
    ).toBeInTheDocument();
  });
});
