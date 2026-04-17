import { apiGet, apiPost } from "./api";

export interface ApiNotification {
  id: number;
  title: string;
  body?: string;
  message?: string;
  icon?: string;
  category?: string;
  is_read?: boolean;
  read?: boolean;
  created_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon: string;
  category: string;
  read: boolean;
  time: string;
}

function mapNotification(n: ApiNotification): Notification {
  return {
    id: String(n.id),
    title: n.title,
    body: n.body ?? n.message ?? "",
    icon: n.icon ?? "bell",
    category: n.category ?? "system",
    read: n.is_read ?? n.read ?? false,
    time: n.created_at ?? "",
  };
}

export async function getNotificationsApi(): Promise<Notification[]> {
  const res = await apiGet<ApiNotification[] | { data: ApiNotification[] }>(
    "/notifications"
  );
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { data: ApiNotification[] })?.data ?? [];
  return list.map(mapNotification);
}

export async function markAsReadApi(id: string | number): Promise<void> {
  const res = await apiPost<void>("/notifications/mark-as-read", { id });
  if (!res.status) throw new Error(res.message);
}
