import { apiGet, apiPost } from "./api";

export type PackType = "wallet_bundle" | "consultant_pack";
export type PackContentType = "online" | "written" | "both";

// Raw shape as returned by /session-packs. Matches
// Api\SessionPackController::index() field-for-field.
export interface ApiSessionPack {
  id: number;
  slug?: string;
  name_ar: string;
  description_ar?: string;
  session_type?: PackContentType;
  pack_type: PackType;
  sessions_count?: number;
  free_written_sessions?: number;
  ai_messages_credit?: number;
  ai_access_label?: string;
  has_extended_chat?: boolean;
  is_popular?: boolean;
  discount_percent?: number;
  price_sar: number;
  price_egp: number;
  price_usd: number;
  original_price_sar?: number;
  original_price_egp?: number;
  original_price_usd?: number;
}

export interface SessionPack {
  id: string;
  slug?: string;
  name: string;
  description: string;
  packType: PackType;
  sessionType?: PackContentType;
  priceEgp: number;
  priceSar: number;
  priceUsd: number;
  originalPriceEgp: number;
  originalPriceSar: number;
  originalPriceUsd: number;
  sessionsCount: number;
  freeWrittenSessions: number;
  aiMessagesCredit: number;
  aiAccessLabel?: string;
  hasExtendedChat: boolean;
  isPopular: boolean;
  discountPercent: number;
}

function mapPack(p: ApiSessionPack): SessionPack {
  return {
    id: String(p.id),
    slug: p.slug,
    name: p.name_ar,
    description: p.description_ar ?? "",
    packType: p.pack_type,
    sessionType: p.session_type,
    priceEgp: p.price_egp ?? 0,
    priceSar: p.price_sar ?? 0,
    priceUsd: p.price_usd ?? 0,
    originalPriceEgp: p.original_price_egp ?? p.price_egp ?? 0,
    originalPriceSar: p.original_price_sar ?? p.price_sar ?? 0,
    originalPriceUsd: p.original_price_usd ?? p.price_usd ?? 0,
    sessionsCount: p.sessions_count ?? 0,
    freeWrittenSessions: p.free_written_sessions ?? 0,
    aiMessagesCredit: p.ai_messages_credit ?? 0,
    aiAccessLabel: p.ai_access_label,
    hasExtendedChat: p.has_extended_chat ?? false,
    isPopular: p.is_popular ?? false,
    discountPercent: p.discount_percent ?? 0,
  };
}

export async function getSessionPacksApi(params?: {
  pack_type?: PackType;
  type?: Exclude<PackContentType, "both">;
}): Promise<SessionPack[]> {
  const q = new URLSearchParams();
  if (params?.pack_type) q.set("pack_type", params.pack_type);
  if (params?.type) q.set("type", params.type);
  const qs = q.toString() ? `?${q}` : "";
  const res = await apiGet<ApiSessionPack[] | { data: ApiSessionPack[] }>(
    `/session-packs${qs}`,
    false
  );
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { data?: ApiSessionPack[] })?.data ?? [];
  return list.map(mapPack);
}

export interface PurchaseResult {
  message: string;
  amountPaid?: number;
  walletBalance?: number;
  sessionsCredited?: number;
}

interface ApiPurchaseFlat {
  message?: string;
  amount_paid?: number;
  wallet_balance?: number;
  sessions_credited?: number;
  sessions?: number;
}

export async function purchasePackApi(pack_id: string | number): Promise<PurchaseResult> {
  const res = await apiPost<ApiPurchaseFlat>("/session-packs/purchase", { pack_id });
  if (!res.status) throw new Error(res.message);
  const d = res.data ?? {};
  return {
    message: d.message ?? res.message ?? "تم الشراء",
    amountPaid: d.amount_paid,
    walletBalance: d.wallet_balance,
    sessionsCredited: d.sessions_credited,
  };
}

export async function purchaseConsultantPackApi(
  employeeId: string | number,
  body: { sessions: 4 | 6 | 10; call_type: "video" | "voice"; service_id?: number }
): Promise<PurchaseResult> {
  const res = await apiPost<ApiPurchaseFlat>(
    `/session-packs/consultant/${employeeId}/purchase`,
    body
  );
  if (!res.status) throw new Error(res.message);
  const d = res.data ?? {};
  return {
    message: d.message ?? res.message ?? "تم الشراء",
    amountPaid: d.amount_paid,
    walletBalance: d.wallet_balance,
    sessionsCredited: d.sessions ?? body.sessions,
  };
}

export interface SessionBalance {
  onlineSessions: number;
  writtenSessions: number;
  aiMessages: number;
}

interface ApiBalance {
  online_sessions?: number;
  written_sessions?: number;
  ai_messages?: number;
}

export async function getMySessionBalanceApi(): Promise<SessionBalance> {
  const res = await apiGet<ApiBalance>("/session-packs/my-balance");
  if (!res.status) throw new Error(res.message);
  const d = res.data ?? {};
  return {
    onlineSessions: d.online_sessions ?? 0,
    writtenSessions: d.written_sessions ?? 0,
    aiMessages: d.ai_messages ?? 0,
  };
}
