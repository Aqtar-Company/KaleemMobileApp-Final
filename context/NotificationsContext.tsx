import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getNotificationsApi,
  markAllAsReadApi,
  markAsReadApi,
  type Notification,
} from "@/services/notifications";
import { useAuth } from "@/context/AuthContext";

export type AppNotification = Notification;

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  refetch: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getNotificationsApi();
      setNotifications(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markAsReadApi(id);
    } catch {
      // Keep local optimistic state; background sync will self-correct next refetch.
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const hasUnread = notifications.some((n) => !n.read);
    if (!hasUnread) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllAsReadApi();
    } catch {
      // Optimistic; next refetch will reconcile with server.
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, error, refetch, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
