import { apiGet, apiPost } from "./api";

export interface ApiAiPlan {
  id: number;
  name: string;
  description?: string;
  price_egp: number;
  price_sar?: number;
  price_usd?: number;
  messages_limit?: number | null;
  has_extended_chat?: boolean;
  features?: string[];
  is_popular?: boolean;
}

export interface AiPlan {
  id: string;
  name: string;
  description?: string;
  priceEgp: number;
  priceSar: number;
  priceUsd: number;
  messagesLimit: number | null;
  hasExtendedChat: boolean;
  features: string[];
  isPopular: boolean;
}

function mapPlan(p: ApiAiPlan): AiPlan {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    priceEgp: p.price_egp ?? 0,
    priceSar: p.price_sar ?? 0,
    priceUsd: p.price_usd ?? 0,
    messagesLimit: p.messages_limit ?? null,
    hasExtendedChat: p.has_extended_chat ?? false,
    features: p.features ?? [],
    isPopular: p.is_popular ?? false,
  };
}

export async function getAiPlansApi(): Promise<AiPlan[]> {
  const res = await apiGet<ApiAiPlan[] | { data: ApiAiPlan[] }>("/ai-plans");
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { data: ApiAiPlan[] })?.data ?? [];
  return list.map(mapPlan);
}

export interface AiSubscription {
  planId: string;
  planName: string;
  status: "active" | "cancelled" | "expired";
  messagesUsed: number;
  messagesLimit: number | null;
  renewsAt?: string;
}

interface ApiSubscription {
  plan_id?: number;
  plan_name?: string;
  status?: "active" | "cancelled" | "expired";
  messages_used?: number;
  messages_limit?: number | null;
  renews_at?: string;
}

export async function getMySubscriptionApi(): Promise<AiSubscription | null> {
  const res = await apiGet<ApiSubscription>("/ai-plans/my-subscription");
  if (!res.status) throw new Error(res.message);
  const d = res.data;
  if (!d || !d.plan_id) return null;
  return {
    planId: String(d.plan_id),
    planName: d.plan_name ?? "",
    status: d.status ?? "active",
    messagesUsed: d.messages_used ?? 0,
    messagesLimit: d.messages_limit ?? null,
    renewsAt: d.renews_at,
  };
}

export async function subscribeAiPlanApi(plan_id: string | number): Promise<void> {
  const res = await apiPost<void>("/ai-plans/subscribe", { plan_id });
  if (!res.status) throw new Error(res.message);
}

export async function cancelAiPlanApi(): Promise<void> {
  const res = await apiPost<void>("/ai-plans/cancel", {});
  if (!res.status) throw new Error(res.message);
}
