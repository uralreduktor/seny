import { createContext } from "react";
import type { User } from "@/types";
import type { AuthToken } from "@/types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokenData: AuthToken) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
