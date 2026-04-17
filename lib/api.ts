import { API_BASE_URL } from '@/constants/Config';
import { deleteItem, getItem, setItem } from './storage';
import type {
  AuthSession,
  ChatSummary,
  Consultant,
  Message,
  Paginated,
  User,
} from './types';

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

export const auth = {
  async login(email: string, password: string): Promise<AuthSession> {
    const session = await request<AuthSession>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    await setItem(TOKEN_KEY, session.token);
    return session;
  },
  async register(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthSession> {
    const session = await request<AuthSession>('/auth/register', {
      method: 'POST',
      body: input,
      auth: false,
    });
    await setItem(TOKEN_KEY, session.token);
    return session;
  },
  async me(): Promise<User> {
    return request<User>('/auth/me');
  },
  async logout(): Promise<void> {
    try {
      await request<void>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout
    }
    await deleteItem(TOKEN_KEY);
  },
  async hasToken(): Promise<boolean> {
    return !!(await getItem(TOKEN_KEY));
  },
};

export const consultants = {
  list(params?: { search?: string; specialty?: string; page?: number }) {
    return request<Paginated<Consultant>>('/consultants', { query: params });
  },
  get(id: string) {
    return request<Consultant>(`/consultants/${id}`);
  },
  featured() {
    return request<Consultant[]>('/consultants/featured');
  },
};

export const chats = {
  list() {
    return request<Paginated<ChatSummary>>('/chats');
  },
  open(consultantId: string) {
    return request<ChatSummary>('/chats', {
      method: 'POST',
      body: { consultantId },
    });
  },
  messages(chatId: string, params?: { before?: string; limit?: number }) {
    return request<Paginated<Message>>(`/chats/${chatId}/messages`, {
      query: params,
    });
  },
  send(chatId: string, content: string) {
    return request<Message>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: { content },
    });
  },
};
