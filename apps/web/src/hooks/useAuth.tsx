"use client";

import { authApi } from "@/lib/api";
import { User } from "@/types";
import Cookies from "js-cookie";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    churchName?: string;
    inviteToken?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión desde cookies al cargar
  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Decodificar JWT para obtener el usuario (sin verificar firma — solo para UI)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        setUser({
          id: payload.sub,
          email: payload.email,
          name: payload.name ?? payload.email,
          churchId: payload.churchId,
          currentRole: payload.role,
        });
      } else {
        Cookies.remove("accessToken");
      }
    } catch {
      Cookies.remove("accessToken");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    Cookies.set("accessToken", data.accessToken, {
      secure: true,
      sameSite: "Strict",
    });
    Cookies.set("refreshToken", data.refreshToken, {
      secure: true,
      sameSite: "Strict",
    });

    const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
    setUser({
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? email,
      churchId: payload.churchId,
      currentRole: payload.role,
    });
  }, []);

  const register = useCallback(
    async (formData: {
      name: string;
      email: string;
      password: string;
      churchName?: string;
      inviteToken?: string;
    }) => {
      const { data } = await authApi.register(formData);
      Cookies.set("accessToken", data.accessToken, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("refreshToken", data.refreshToken, {
        secure: true,
        sameSite: "Strict",
      });

      const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
      setUser({
        id: payload.sub,
        email: formData.email,
        name: formData.name,
        churchId: payload.churchId,
        currentRole: payload.role,
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    const refreshToken = Cookies.get("refreshToken") ?? "";
    try {
      await authApi.logout(refreshToken);
    } catch {
      /* silencioso */
    }

    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
