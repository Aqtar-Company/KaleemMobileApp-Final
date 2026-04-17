import { API_BASE_URL, USE_MOCK as CONFIG_USE_MOCK } from '@/constants/Config';
import { deleteItem, getItem, setItem } from './storage';
import { mockAuth, mockChats, mockConsultants, MOCK_TOKEN } from './mock';
import type {
  AuthSession,
  ChatSummary,
  Consultant,
  Message,
  Paginated,
  User,
} from './types';

export const USE_MOCK: boolean = CONFIG_USE_MOCK;

const TOKEN_KEY = 'kaleem.auth.token';

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const token = await getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  auth?: boolean;
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function request<T>(
  path: string,
  { method = 'GET', body, query, signal, auth = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) Object.assign(headers, await authHeader());

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText) || `HTTP ${res.status}`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function unwrap<T>(res: unknown): T {
  if (
    res &&
    typeof res === 'object' &&
    'data' in (res as Record<string, unknown>) &&
    !Array.isArray(res)
  ) {
    return (res as { data: T }).data;
  }
  return res as T;
}

function normalizePaginated<T>(res: unknown): Paginated<T> {
  if (Array.isArray(res)) {
    return { items: res as T[], total: res.length, page: 1, pageSize: res.length };
  }
  const obj = (res ?? {}) as Record<string, unknown>;
  const items = (obj.data as T[]) ?? [];
  const meta = (obj.meta as Record<string, unknown>) ?? obj;
  const total = Number(meta.total ?? items.length) || items.length;
  const page = Number(meta.current_page ?? 1) || 1;
  const pageSize = Number(meta.per_page ?? items.length) || items.length;
  return { items, total, page, pageSize };
}

function mapConsultant(raw: Record<string, unknown>): Consultant {
  const id = String(raw.id ?? raw.user_id ?? '');
  return {
    id,
    name: String(raw.name ?? raw.full_name ?? 'Consultant'),
    avatarUrl: (raw.avatar ?? raw.avatar_url ?? raw.image ?? null) as string | null,
    specialty: String(raw.specialty ?? raw.service_name ?? raw.title ?? ''),
    bio: (raw.bio ?? raw.about ?? raw.description ?? undefined) as string | undefined,
    rating: toNumber(raw.rating ?? raw.average_rating),
    reviewsCount: toNumber(raw.reviews_count ?? raw.ratings_count),
    pricePerHour: toNumber(raw.price ?? raw.price_per_hour ?? raw.hourly_rate),
    online: Boolean(raw.is_online ?? raw.online ?? false),
    languages: Array.isArray(raw.languages) ? (raw.languages as string[]) : undefined,
  };
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function mapUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? raw.full_name ?? ''),
    email: String(raw.email ?? ''),
    avatarUrl: (raw.avatar ?? raw.avatar_url ?? null) as string | null,
    role: (raw.role as User['role']) ?? 'user',
  };
}

function mapChat(raw: Record<string, unknown>): ChatSummary {
  const other = (raw.receiver ?? raw.sender ?? raw.user ?? raw.consultant ?? {}) as Record<
    string,
    unknown
  >;
  const consultantId = String(
    raw.receiver_id ?? raw.consultant_id ?? raw.user_id ?? other.id ?? raw.id ?? ''
  );
  return {
    id: consultantId,
    consultantId,
    consultantName: String(other.name ?? raw.name ?? 'Consultant'),
    consultantAvatarUrl: (other.avatar ?? other.avatar_url ?? null) as string | null,
    lastMessage: (raw.last_message ?? raw.message ?? undefined) as string | undefined,
    lastMessageAt: (raw.last_message_at ??
      raw.updated_at ??
      raw.created_at ??
      undefined) as string | undefined,
    unreadCount: toNumber(raw.unread_count ?? raw.unread),
  };
}

function mapMessage(raw: Record<string, unknown>, meUserId?: string): Message {
  const senderId = String(raw.sender_id ?? raw.from_id ?? raw.user_id ?? '');
  const receiverId = String(raw.receiver_id ?? raw.to_id ?? '');
  const chatId = senderId && senderId !== meUserId ? senderId : receiverId;
  return {
    id: String(raw.id ?? `${senderId}-${raw.created_at}`),
    chatId,
    senderId,
    content: String(raw.message ?? raw.content ?? raw.text ?? ''),
    createdAt: String(raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
  };
}

export const auth = {
  async login(email: string, password: string): Promise<AuthSession> {
    if (USE_MOCK) {
      const session = await mockAuth.login(email, password);
      await setItem(TOKEN_KEY, session.token);
      return session;
    }
    const res = await request<unknown>('/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    const payload = unwrap<{ token: string; user: Record<string, unknown> }>(res);
    const session: AuthSession = {
      token: String(payload.token),
      user: mapUser(payload.user ?? {}),
    };
    await setItem(TOKEN_KEY, session.token);
    return session;
  },

  async register(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthSession> {
    if (USE_MOCK) {
      const session = await mockAuth.register(input);
      await setItem(TOKEN_KEY, session.token);
      return session;
    }
    const res = await request<unknown>('/register', {
      method: 'POST',
      body: input,
      auth: false,
    });
    const payload = unwrap<{ token: string; user: Record<string, unknown> }>(res);
    const session: AuthSession = {
      token: String(payload.token),
      user: mapUser(payload.user ?? {}),
    };
    await setItem(TOKEN_KEY, session.token);
    return session;
  },

  async me(): Promise<User> {
    if (USE_MOCK) return mockAuth.me();
    const res = await request<unknown>('/user');
    return mapUser(unwrap<Record<string, unknown>>(res));
  },

  async logout(): Promise<void> {
    if (USE_MOCK) {
      await mockAuth.logout();
      await deleteItem(TOKEN_KEY);
      return;
    }
    try {
      await request<void>('/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    await deleteItem(TOKEN_KEY);
  },

  async hasToken(): Promise<boolean> {
    if (USE_MOCK) {
      const t = await getItem(TOKEN_KEY);
      if (!t) await setItem(TOKEN_KEY, MOCK_TOKEN);
      return true;
    }
    return !!(await getItem(TOKEN_KEY));
  },
};

export const consultants = {
  async list(params?: {
    search?: string;
    specialty?: string;
    page?: number;
  }): Promise<Paginated<Consultant>> {
    if (USE_MOCK) return mockConsultants.list({ search: params?.search });
    const res = await request<unknown>('/employees', {
      query: {
        page: params?.page,
        name: params?.search,
        service_id: params?.specialty,
      },
    });
    const paginated = normalizePaginated<Record<string, unknown>>(res);
    return {
      ...paginated,
      items: paginated.items.map(mapConsultant),
    };
  },

  async get(id: string): Promise<Consultant> {
    if (USE_MOCK) return mockConsultants.get(id);
    const res = await request<unknown>(`/employees/${id}`);
    return mapConsultant(unwrap<Record<string, unknown>>(res));
  },

  async featured(): Promise<Consultant[]> {
    if (USE_MOCK) return mockConsultants.featured();
    const res = await request<unknown>('/employees', { query: { page: 1 } });
    const paginated = normalizePaginated<Record<string, unknown>>(res);
    return paginated.items.slice(0, 6).map(mapConsultant);
  },
};

export const chats = {
  async list(): Promise<Paginated<ChatSummary>> {
    if (USE_MOCK) return mockChats.list();
    const res = await request<unknown>('/chat');
    const paginated = normalizePaginated<Record<string, unknown>>(res);
    return { ...paginated, items: paginated.items.map(mapChat) };
  },

  async open(consultantId: string): Promise<ChatSummary> {
    if (USE_MOCK) return mockChats.open(consultantId);
    // Backend has no "create chat" endpoint — chats are implicit per consultant.
    // We return a stub keyed by consultantId; messages endpoint uses this id as userId.
    try {
      const consultant = await consultants.get(consultantId);
      return {
        id: consultantId,
        consultantId,
        consultantName: consultant.name,
        consultantAvatarUrl: consultant.avatarUrl ?? null,
      };
    } catch {
      return {
        id: consultantId,
        consultantId,
        consultantName: 'Consultant',
        consultantAvatarUrl: null,
      };
    }
  },

  async messages(
    chatId: string,
    _params?: { before?: string; limit?: number }
  ): Promise<Paginated<Message>> {
    if (USE_MOCK) return mockChats.messages(chatId);
    const res = await request<unknown>(`/chat/messages/${chatId}`);
    const paginated = normalizePaginated<Record<string, unknown>>(res);
    const me = await authApi_me_cached();
    return {
      ...paginated,
      items: paginated.items.map((m) => mapMessage(m, me?.id)),
    };
  },

  async send(chatId: string, content: string): Promise<Message> {
    if (USE_MOCK) return mockChats.send(chatId, content);
    const res = await request<unknown>('/chat/send-message', {
      method: 'POST',
      body: { receiver_id: chatId, message: content },
    });
    const data = unwrap<Record<string, unknown>>(res);
    const me = await authApi_me_cached();
    return mapMessage(data, me?.id);
  },
};

let _meCache: User | null = null;
async function authApi_me_cached(): Promise<User | null> {
  if (_meCache) return _meCache;
  try {
    _meCache = await auth.me();
    return _meCache;
  } catch {
    return null;
  }
}
