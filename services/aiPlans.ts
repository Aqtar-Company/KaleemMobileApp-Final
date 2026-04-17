import { apiGet, apiPost } from "./api";

export interface ApiAiPlan {
  id: number;
  name: string;
  name_ar?: string;
  description_ar?: string;
  messages_per_month?: number | null;
  is_unlimited?: boolean;
  price_egp: number;
  price_sar?: number;
  price_usd?: number;
  billing_cycle?: string;
  features_ar?: string[];
}

export interface AiPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  priceEgp: number;
  priceSar: number;
  priceUsd: number;
  messagesPerMonth: number | null;
  isUnlimited: boolean;
  features: string[];
  billingCycle: string;
}

function mapPlan(p: ApiAiPlan): AiPlan {
  return {
    id: String(p.id),
    name: p.name,
    nameAr: p.name_ar ?? p.name,
    description: p.description_ar ?? "",
    priceEgp: p.price_egp ?? 0,
    priceSar: p.price_sar ?? 0,
    priceUsd: p.price_usd ?? 0,
    messagesPerMonth: p.messages_per_month ?? null,
    isUnlimited: p.is_unlimited ?? false,
    features: p.features_ar ?? [],
    billingCycle: p.billing_cycle ?? "monthly",
  };
}

export async function getAiPlansApi(): Promise<AiPlan[]> {
  const res = await apiGet<ApiAiPlan[] | { data: ApiAiPlan[] }>("/ai-plans", false);
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { data?: ApiAiPlan[] })?.data ?? [];
  return list.map(mapPlan);
}

export interface AiSubscription {
  subscribed: boolean;
  planId: string | null;
  planName: string;
  messagesUsed: number;
  messagesLimit: number | null;
  remaining: number | null;
  isUnlimited: boolean;
  expiresAt?: string;
}

interface ApiSubscription {
  subscribed?: boolean;
  plan?: {
    id: number;
    name?: string;
    name_ar?: string;
    messages_per_month?: number | null;
    is_unlimited?: boolean;
  } | null;
  messages_used?: number;
  messages_limit?: number | null;
  remaining?: number | null;
  expires_at?: string;
}

export async function getMySubscriptionApi(): Promise<AiSubscription> {
  const res = await apiGet<ApiSubscription>("/ai-plans/my-subscription");
  if (!res.status) throw new Error(res.message);
  const d = res.data ?? {};
  return {
    subscribed: d.subscribed ?? false,
    planId: d.plan ? String(d.plan.id) : null,
    planName: d.plan?.name_ar ?? d.plan?.name ?? "",
    messagesUsed: d.messages_used ?? 0,
    messagesLimit: d.messages_limit ?? null,
    remaining: d.remaining ?? null,
    isUnlimited: d.plan?.is_unlimited ?? false,
    expiresAt: d.expires_at,
  };
}

export async function subscribeAiPlanApi(plan_id: string | number): Promise<void> {
  const res = await apiPost<unknown>("/ai-plans/subscribe", { plan_id });
  if (!res.status) throw new Error(res.message);
}

export async function cancelAiPlanApi(): Promise<void> {
  const res = await apiPost<unknown>("/ai-plans/cancel", {});
  if (!res.status) throw new Error(res.message);
}
