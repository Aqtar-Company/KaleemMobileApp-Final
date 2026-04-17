import { apiGet, apiPost } from "./api";

export type PackType = "wallet_bundle" | "consultant_pack";
export type PackContentType = "online" | "written";

export interface ApiSessionPack {
  id: number;
  name: string;
  description?: string;
  pack_type: PackType;
  type?: PackContentType;
  price_egp: number;
  price_sar?: number;
  price_usd?: number;
  online_sessions?: number;
  written_consultations?: number;
  ai_messages?: number;
  discount_percent?: number;
  has_follow_up?: boolean;
  is_popular?: boolean;
}

export interface SessionPack {
  id: string;
  name: string;
  description?: string;
  packType: PackType;
  type?: PackContentType;
  priceEgp: number;
  priceSar: number;
  priceUsd: number;
  onlineSessions: number;
  writtenConsultations: number;
  aiMessages: number;
  discountPercent: number;
  hasFollowUp: boolean;
  isPopular: boolean;
}

function mapPack(p: ApiSessionPack): SessionPack {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    packType: p.pack_type,
    type: p.type,
    priceEgp: p.price_egp ?? 0,
    priceSar: p.price_sar ?? 0,
    priceUsd: p.price_usd ?? 0,
    onlineSessions: p.online_sessions ?? 0,
    writtenConsultations: p.written_consultations ?? 0,
    aiMessages: p.ai_messages ?? 0,
    discountPercent: p.discount_percent ?? 0,
    hasFollowUp: p.has_follow_up ?? false,
    isPopular: p.is_popular ?? false,
  };
}

export async function getSessionPacksApi(params?: {
  pack_type?: PackType;
  type?: PackContentType;
}): Promise<SessionPack[]> {
  const q = new URLSearchParams();
  if (params?.pack_type) q.set("pack_type", params.pack_type);
  if (params?.type) q.set("type", params.type);
  const qs = q.toString() ? `?${q}` : "";
  const res = await apiGet<ApiSessionPack[] | { data: ApiSessionPack[] }>(
    `/session-packs${qs}`
  );
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { data: ApiSessionPack[] })?.data ?? [];
  return list.map(mapPack);
}

export interface PurchaseResult {
  purchase_id: string | number;
  new_balance?: number;
}

export async function purchasePackApi(pack_id: string | number): Promise<PurchaseResult> {
  const res = await apiPost<PurchaseResult>("/session-packs/purchase", { pack_id });
  if (!res.status || !res.data) throw new Error(res.message);
  return res.data;
}

export async function purchaseConsultantPackApi(
  employeeId: string | number,
  body: { sessions_count: 4 | 6 | 10 }
): Promise<PurchaseResult> {
  const res = await apiPost<PurchaseResult>(
    `/session-packs/consultant/${employeeId}/purchase`,
    body
  );
  if (!res.status || !res.data) throw new Error(res.message);
  return res.data;
}

export interface SessionBalance {
  online: { total: number; used: number };
  written: { total: number; used: number };
  aiMessages: { total: number; used: number };
}

interface ApiBalance {
  online?: { total: number; used: number };
  written?: { total: number; used: number };
  ai_messages?: { total: number; used: number };
}

export async function getMySessionBalanceApi(): Promise<SessionBalance> {
  const res = await apiGet<ApiBalance>("/session-packs/my-balance");
  if (!res.status) throw new Error(res.message);
  const d = res.data ?? {};
  return {
    online: d.online ?? { total: 0, used: 0 },
    written: d.written ?? { total: 0, used: 0 },
    aiMessages: d.ai_messages ?? { total: 0, used: 0 },
  };
}
