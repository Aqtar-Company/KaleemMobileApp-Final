import { apiGet, apiPost } from "./api";

export interface ApiNotification {
  id: number | string;
  title?: string;
  body?: string;
  message?: string;
  icon?: string;
  category?: string;
  is_read?: boolean;
  read?: boolean;
  read_at?: string | null;
  created_at?: string;
  formatted_date?: string;
  action?: string;
  type?: string;
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
    title: n.title ?? titleFromAction(n.action) ?? "إشعار",
    body: n.body ?? n.message ?? "",
    icon: n.icon ?? iconFromType(n.type ?? n.action),
    category: n.category ?? (n.action ?? n.type ?? "system"),
    read: n.is_read ?? n.read ?? !!n.read_at,
    time: n.formatted_date ?? n.created_at ?? "",
  };
}

function titleFromAction(action?: string): string | undefined {
  switch (action) {
    case "NEW_MESSAGE":
      return "رسالة جديدة";
    case "NEW_CALL":
      return "موعد جديد";
    case "UPDATE_CALL":
      return "تحديث موعد";
    case "PAYMENT":
      return "دفعة مالية";
    case "REPORT_ADDED":
      return "تقرير جديد";
    case "NEW_CONSULTATION":
      return "استشارة جديدة";
    case "COURSE_SUBSCRIPTION":
      return "اشتراك دورة";
    default:
      return undefined;
  }
}

function iconFromType(kind?: string): string {
  switch (kind) {
    case "NEW_MESSAGE":
    case "chat":
      return "message-circle";
    case "NEW_CALL":
    case "UPDATE_CALL":
    case "appointment":
    case "schedule":
      return "calendar";
    case "PAYMENT":
    case "payment":
      return "credit-card";
    case "REPORT_ADDED":
    case "consultation":
    case "NEW_CONSULTATION":
      return "file-text";
    case "COURSE_SUBSCRIPTION":
    case "COURSE_ACCEPTED":
      return "book-open";
    default:
      return "bell";
  }
}

export async function getNotificationsApi(): Promise<Notification[]> {
  const res = await apiGet<ApiNotification[] | { data: ApiNotification[] }>(
    "/notifications"
  );
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { data?: ApiNotification[] })?.data ?? [];
  return list.map(mapNotification);
}

// Backend: POST /notifications/mark-as-read/{notification} marks a single one.
export async function markAsReadApi(id: string | number): Promise<void> {
  const res = await apiPost<unknown>(`/notifications/mark-as-read/${id}`, {});
  if (!res.status) throw new Error(res.message);
}

// Backend: POST /notifications/mark-as-read (no body) marks everything read.
export async function markAllAsReadApi(): Promise<void> {
  const res = await apiPost<unknown>("/notifications/mark-as-read", {});
  if (!res.status) throw new Error(res.message);
}
