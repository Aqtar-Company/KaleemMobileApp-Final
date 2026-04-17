import { apiGet, apiPost } from "./api";

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

export async function depositApi(amount: number, currency: string = "EGP"): Promise<Transaction> {
  const res = await apiPost<ApiTransaction>("/wallet/deposit", { amount, currency });
  if (!res.status || !res.data) throw new Error(res.message);
  return mapTransaction(res.data);
}

export interface PaypalOrder {
  order_id: string;
  approve_url?: string;
}

export async function createPaypalOrderApi(amount: number): Promise<PaypalOrder> {
  const res = await apiPost<PaypalOrder>("/wallet/paypal/create-order", { amount });
  if (!res.status || !res.data) throw new Error(res.message);
  return res.data;
}

export async function capturePaypalOrderApi(order_id: string): Promise<Transaction> {
  const res = await apiPost<ApiTransaction>("/wallet/paypal/capture-order", { order_id });
  if (!res.status || !res.data) throw new Error(res.message);
  return mapTransaction(res.data);
}

export async function verifyPaypalDepositApi(order_id: string): Promise<Transaction> {
  const res = await apiPost<ApiTransaction>("/wallet/paypal/verify-deposit", { order_id });
  if (!res.status || !res.data) throw new Error(res.message);
  return mapTransaction(res.data);
}

export async function verifyPaymentApi(payload: {
  payment_id?: string;
  reference?: string;
  provider?: string;
}): Promise<Transaction> {
  const res = await apiPost<ApiTransaction>("/wallet/verify-payment", payload);
  if (!res.status || !res.data) throw new Error(res.message);
  return mapTransaction(res.data);
}

export async function withdrawApi(amount: number): Promise<Transaction> {
  const res = await apiPost<ApiTransaction>("/wallet/withdraw", { amount });
  if (!res.status || !res.data) throw new Error(res.message);
  return mapTransaction(res.data);
}

export async function transferToUserApi(
  receiver_id: number | string,
  amount: number
): Promise<Transaction> {
  const res = await apiPost<ApiTransaction>("/wallet/transfer-to-user", {
    receiver_id,
    amount,
  });
  if (!res.status || !res.data) throw new Error(res.message);
  return mapTransaction(res.data);
}

export async function refundApi(transaction_id: number | string): Promise<Transaction> {
  const res = await apiPost<ApiTransaction>("/wallet/refund", { transaction_id });
  if (!res.status || !res.data) throw new Error(res.message);
  return mapTransaction(res.data);
}
