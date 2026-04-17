import { apiGet } from "./api";

export interface LookupItem {
  id: number;
  name: string;
  parent_id?: number;
  icon?: string;
  price_egp?: number;
  price_sar?: number;
  price_usd?: number;
}

async function getList<T>(path: string): Promise<T[]> {
  const res = await apiGet<T[] | { data: T[] }>(path);
  if (!res.status) throw new Error(res.message);
  return Array.isArray(res.data) ? res.data : (res.data as { data: T[] })?.data ?? [];
}

export function getSpecializationsApi() {
  return getList<LookupItem>("/specializations");
}

export function getServicesApi() {
  return getList<LookupItem>("/services");
}

export function getCountriesApi() {
  return getList<LookupItem>("/countries");
}

export function getCitiesApi(countryId: string | number) {
  return getList<LookupItem>(`/countries/${countryId}/cities`);
}
