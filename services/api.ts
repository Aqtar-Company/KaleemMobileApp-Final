import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_BASE_URL, USE_MOCK } from "@/constants/Config";
import { mockDispatch, mockStream } from "./mock";

export const BASE_URL = API_BASE_URL;
export const STORAGE_URL = "https://api.kaleemai.com/storage";
export const TOKEN_KEY = "kaleem_token";

export function imageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${STORAGE_URL}/${path}`;
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function buildHeaders(auth = true): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (auth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(res.status, json.message ?? "حدث خطأ", json.errors);
  }
  return json as ApiResponse<T>;
}

type Method = "GET" | "POST" | "DELETE";

async function dispatchMock<T>(
  method: Method,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const res = await mockDispatch(method, path, body);
  return res as ApiResponse<T>;
}

export async function apiGet<T>(path: string, auth = true): Promise<ApiResponse<T>> {
  if (USE_MOCK) return dispatchMock<T>("GET", path);
  const headers = await buildHeaders(auth);
  const res = await fetch(`${BASE_URL}${path}`, { method: "GET", headers });
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  auth = true
): Promise<ApiResponse<T>> {
  if (USE_MOCK) return dispatchMock<T>("POST", path, body);
  const headers = await buildHeaders(auth);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPostForm<T>(
  path: string,
  formData: FormData,
  auth = true
): Promise<ApiResponse<T>> {
  if (USE_MOCK) return dispatchMock<T>("POST", path, {});
  const token = auth ? await getToken() : null;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string, auth = true): Promise<ApiResponse<T>> {
  if (USE_MOCK) return dispatchMock<T>("DELETE", path);
  const headers = await buildHeaders(auth);
  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers });
  return handleResponse<T>(res);
}

export async function apiStream(
  path: string,
  body: unknown,
  onChunk: (text: string) => void
): Promise<void> {
  if (USE_MOCK) {
    await mockStream(path, body, onChunk);
    return;
  }

  const headers = await buildHeaders(true);
  headers["Accept"] = "text/event-stream";

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const json = await res.json().catch(() => ({ message: "حدث خطأ في الاتصال" }));
    throw new ApiError(res.status, json.message ?? "خطأ");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data && data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            const text =
              parsed.choices?.[0]?.delta?.content ??
              parsed.content ??
              parsed.text ??
              parsed.message ??
              "";
            if (text) onChunk(text);
          } catch {
            if (data) onChunk(data);
          }
        }
      }
    }
  }
}
