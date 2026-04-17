import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGet, apiPost, TOKEN_KEY, imageUrl } from "./api";

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  wallet_amount?: number;
  wallet_currency?: string;
  role?: string;
}

export interface LoginResponse {
  user: ApiUser;
  token: string;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const res = await apiPost<LoginResponse>("/login", { email, password }, false);
  if (!res.status || !res.data) throw new Error(res.message);
  return res.data;
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<LoginResponse> {
  const res = await apiPost<LoginResponse>(
    "/register",
    { name, email, password, password_confirmation: password, phone: phone ?? "" },
    false
  );
  if (!res.status || !res.data) throw new Error(res.message);
  return res.data;
}

export async function getProfileApi(): Promise<ApiUser> {
  const res = await apiGet<ApiUser>("/user");
  if (!res.status || !res.data) throw new Error(res.message);
  return res.data;
}

export async function logoutApi(): Promise<void> {
  try {
    await apiPost("/logout", {});
  } catch {}
}

export async function forgotPasswordApi(email: string): Promise<void> {
  const res = await apiPost<void>("/password/forgot", { email }, false);
  if (!res.status) throw new Error(res.message);
}

export async function resetPasswordApi(input: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  const res = await apiPost<void>("/password/reset", input, false);
  if (!res.status) throw new Error(res.message);
}

export async function changePasswordApi(input: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  const res = await apiPost<void>("/change-password", input);
  if (!res.status) throw new Error(res.message);
}

export function mapApiUser(apiUser: ApiUser) {
  return {
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    avatar: imageUrl(apiUser.image),
    walletBalance: apiUser.wallet_amount ?? 0,
    walletCurrency: apiUser.wallet_currency ?? "USD",
    aiMessages: 0,
    aiMessagesTotal: 0,
  };
}

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
