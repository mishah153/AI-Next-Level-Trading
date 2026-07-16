"use client";

import * as React from "react";
import { USE_API } from "./config";
import { authApi } from "./services";
import { tokenStore } from "./tokens";
import type { User } from "../types";
import { currentUser as mockUser } from "../mock/data";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(
    USE_API ? null : mockUser,
  );
  const [ready, setReady] = React.useState(!USE_API);

  React.useEffect(() => {
    if (!USE_API) return;
    let active = true;
    const hydrate = async () => {
      if (!tokenStore.getAccess()) {
        if (active) setReady(true);
        return;
      }
      try {
        const me = await authApi.me();
        if (active) setUser(me);
      } catch {
        tokenStore.clear();
      } finally {
        if (active) setReady(true);
      }
    };
    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    if (!USE_API) {
      setUser(mockUser);
      return;
    }
    const res = await authApi.login({ email, password });
    tokenStore.set(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const register = React.useCallback(
    async (name: string, email: string, password: string) => {
      if (!USE_API) {
        setUser(mockUser);
        return;
      }
      const res = await authApi.register({ name, email, password });
      tokenStore.set(res.accessToken, res.refreshToken);
      setUser(res.user);
    },
    [],
  );

  const logout = React.useCallback(async () => {
    if (USE_API) {
      const refresh = tokenStore.getRefresh();
      if (refresh) await authApi.logout(refresh).catch(() => undefined);
      tokenStore.clear();
    }
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
