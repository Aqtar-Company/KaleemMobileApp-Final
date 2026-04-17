import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  clearToken,
  getProfileApi,
  loginApi,
  logoutApi,
  mapApiUser,
  registerApi,
  saveToken,
} from "@/services/auth";
import { TOKEN_KEY } from "@/services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  walletBalance: number;
  walletCurrency: string;
  aiMessages: number;
  aiMessagesTotal: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_CACHE_KEY = "kaleem_user_cache";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) {
          setIsLoading(false);
          return;
        }
        const cached = await AsyncStorage.getItem(USER_CACHE_KEY);
        if (cached) setUser(JSON.parse(cached));
        try {
          const apiUser = await getProfileApi();
          const mapped: User = { ...mapApiUser(apiUser), aiMessages: 0, aiMessagesTotal: 0 };
          setUser(mapped);
          await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(mapped));
        } catch {
          if (!cached) setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const data = await loginApi(email, password);
    await saveToken(data.token);
    const mapped: User = { ...mapApiUser(data.user), aiMessages: 0, aiMessagesTotal: 0 };
    setUser(mapped);
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(mapped));
    return true;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<boolean> => {
    const data = await registerApi(name, email, password, phone);
    await saveToken(data.token);
    const mapped: User = { ...mapApiUser(data.user), aiMessages: 0, aiMessagesTotal: 0 };
    setUser(mapped);
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(mapped));
    return true;
  };

  const logout = async () => {
    await logoutApi();
    await clearToken();
    await AsyncStorage.removeItem(USER_CACHE_KEY);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(updated));
  };

  const refreshProfile = async () => {
    try {
      const apiUser = await getProfileApi();
      const mapped: User = { ...mapApiUser(apiUser), aiMessages: 0, aiMessagesTotal: 0 };
      setUser(mapped);
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(mapped));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateUser, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
