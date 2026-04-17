import { apiGet, apiPost, apiPostForm, imageUrl } from "./api";

export interface ApiChatSummary {
  id?: number;
  user_id?: number;
  receiver_id?: number;
  consultant_id?: number;
  name?: string;
  avatar?: string;
  image?: string;
  last_message?: string;
  last_message_at?: string;
  updated_at?: string;
  unread_count?: number;
  receiver?: { id: number; name: string; image?: string };
}

export interface ApiMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message?: string;
  content?: string;
  file_url?: string;
  created_at: string;
}

export interface ChatSummary {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
}

function mapChat(c: ApiChatSummary): ChatSummary {
  const other =
    c.receiver ??
    ({ id: c.user_id ?? c.receiver_id ?? c.consultant_id ?? c.id ?? 0, name: c.name ?? "" } as {
      id: number;
      name: string;
      image?: string;
    });
  const userId = String(other.id);
  return {
    id: userId,
    userId,
    name: other.name ?? c.name ?? "مستشار",
    avatar: imageUrl(other.image ?? c.image ?? c.avatar),
    lastMessage: c.last_message,
    lastMessageAt: c.last_message_at ?? c.updated_at,
    unreadCount: c.unread_count ?? 0,
  };
}

function mapMessage(m: ApiMessage): ChatMessage {
  return {
    id: String(m.id),
    senderId: String(m.sender_id),
    receiverId: String(m.receiver_id),
    content: m.message ?? m.content ?? "",
    fileUrl: imageUrl(m.file_url),
    createdAt: m.created_at,
  };
}

export async function getChatsApi(): Promise<ChatSummary[]> {
  const res = await apiGet<ApiChatSummary[] | { data: ApiChatSummary[] }>("/chat");
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { data: ApiChatSummary[] })?.data ?? [];
  return list.map(mapChat);
}

export async function getMessagesApi(
  userId: string | number,
  opts?: { before?: string | number }
): Promise<ChatMessage[]> {
  const q = opts?.before ? `?before=${opts.before}` : "";
  const res = await apiGet<ApiMessage[] | { data: ApiMessage[] }>(
    `/chat/messages/${userId}${q}`
  );
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { data: ApiMessage[] })?.data ?? [];
  return list.map(mapMessage);
}

export async function sendMessageApi(
  receiver_id: string | number,
  message: string
): Promise<ChatMessage> {
  const res = await apiPost<ApiMessage>("/chat/send-message", { receiver_id, message });
  if (!res.status || !res.data) throw new Error(res.message);
  return mapMessage(res.data);
}

export async function sendMessageWithFileApi(
  receiver_id: string | number,
  file: { uri: string; name: string; type: string },
  message?: string
): Promise<ChatMessage> {
  const form = new FormData();
  form.append("receiver_id", String(receiver_id));
  if (message) form.append("message", message);
  // @ts-expect-error RN FormData file shape
  form.append("file", { uri: file.uri, name: file.name, type: file.type });
  const res = await apiPostForm<ApiMessage>("/chat/send-message", form);
  if (!res.status || !res.data) throw new Error(res.message);
  return mapMessage(res.data);
}

export async function sendTypingApi(receiver_id: string | number): Promise<void> {
  const res = await apiPost<void>("/chat/typing", { receiver_id });
  if (!res.status) throw new Error(res.message);
}
