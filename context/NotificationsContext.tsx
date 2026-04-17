import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: string;
  read: boolean;
  category: "session" | "ai" | "wallet" | "system";
}

const INITIAL: AppNotification[] = [
  { id: "1", title: "تذكير بجلستك", body: "جلستك مع د. محمد الشريف غداً الساعة 10:00 ص", time: "منذ ساعة", icon: "calendar", read: false, category: "session" },
  { id: "2", title: "تم قبول الحجز", body: "تم تأكيد حجزك مع أ. سارة القحطاني بنجاح", time: "منذ 3 ساعات", icon: "check-circle", read: false, category: "session" },
  { id: "3", title: "رسالة من كليم AI", body: "هل تريد متابعة جلستك السابقة؟", time: "أمس", icon: "cpu", read: false, category: "ai" },
  { id: "4", title: "شحن المحفظة", body: "تمت إضافة $75 لمحفظتك بنجاح", time: "أمس", icon: "credit-card", read: true, category: "wallet" },
  { id: "5", title: "مستشار جديد", body: "انضم مستشار جديد في خدمة مستقر", time: "قبل يومين", icon: "user-plus", read: true, category: "system" },
];

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: INITIAL,
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL);

  useEffect(() => {
    AsyncStorage.getItem("kaleem_notif_read").then((val) => {
      if (val) {
        const readIds: string[] = JSON.parse(val);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: readIds.includes(n.id) ? true : n.read }))
        );
      }
    });
  }, []);

  const persist = (updated: AppNotification[]) => {
    const readIds = updated.filter((n) => n.read).map((n) => n.id);
    AsyncStorage.setItem("kaleem_notif_read", JSON.stringify(readIds));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persist(updated);
      return updated;
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
