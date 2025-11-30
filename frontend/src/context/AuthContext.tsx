import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { api } from "@/lib/api";
import type { User, AuthToken } from "@/types";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(
    async (accessToken?: string) => {
      const t = accessToken ?? token;
      try {
        if (!t) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const res = await api.get<User>("/users/me");
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    },
    [token, logout]
  );

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (tokenData: AuthToken) => {
      localStorage.setItem("token", tokenData.access_token);
      setToken(tokenData.access_token);
      await fetchUser(tokenData.access_token);
    },
    [fetchUser]
  );

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
