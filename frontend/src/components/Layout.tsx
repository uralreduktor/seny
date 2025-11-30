import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { useState } from "react";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";

export function Layout() {
  const { user, logout } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="flex h-16 items-center px-4 gap-8 container mx-auto justify-between">
          <div className="flex items-center gap-8">
            <div className="font-bold text-xl text-blue-600">SENY</div>
            <nav className="flex gap-6 text-sm font-medium">
              <Link to="/" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <Link to="/tenders" className="hover:text-blue-600 transition-colors">Tenders</Link>
              <Link to="/nomenclatures" className="hover:text-blue-600 transition-colors">Nomenclatures</Link>
              <Link to="/nomenclatures/presets" className="hover:text-blue-600 transition-colors">Presets</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>{user.full_name || user.email}</span>
                    <button
                        onClick={() => setIsPasswordDialogOpen(true)}
                        className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-gray-600"
                        title="Сменить пароль"
                    >
                        🔑
                    </button>
                </div>
            )}
            <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
                Выйти
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        <Outlet />
      </main>

      <ChangePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      />
    </div>
  );
}
