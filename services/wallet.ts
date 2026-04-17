import { apiGet } from "./api";

export interface ApiWallet {
  balance?: number;
  amount?: number;
  wallet_amount?: number;
  currency?: string;
  wallet_currency?: string;
  sessions_count?: number;
  ai_messages?: number;
  transactions?: ApiTransaction[];
}

export interface ApiTransaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description?: string;
  created_at?: string;
}

export interface WalletData {
  balance: number;
  currency: string;
  sessionsCount: number;
  aiMessages: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

function mapTransaction(t: ApiTransaction): Transaction {
  return {
    id: String(t.id),
    type: t.type,
    amount: t.amount,
    description: t.description ?? (t.type === "credit" ? "شحن رصيد" : "خصم رصيد"),
    date: t.created_at?.split("T")[0] ?? "",
  };
}

export async function getWalletApi(): Promise<WalletData> {
  const res = await apiGet<ApiWallet>("/wallet");
  if (!res.status) throw new Error(res.message);
  const d = res.data ?? {};
  const balance = d.balance ?? d.amount ?? d.wallet_amount ?? 0;
  return {
    balance,
    currency: d.currency ?? d.wallet_currency ?? "USD",
    sessionsCount: d.sessions_count ?? 0,
    aiMessages: d.ai_messages ?? 0,
    transactions: (d.transactions ?? []).map(mapTransaction),
  };
}
