import { apiGet, imageUrl } from "./api";

export interface ApiConsultant {
  id: number;
  user_id?: number;
  name: string;
  image?: string;
  job?: string;
  rating?: number;
  price?: number;
  experience?: number;
  chat_enabled?: boolean;
  description?: string;
  services?: Array<{ id: number; name: string }>;
  specialization?: string;
}

export interface ConsultantAvailableTime {
  from: string;
  to: string;
}

export interface Consultant {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  rating: number;
  price: number;
  experience: number;
  chatEnabled: boolean;
  description?: string;
  services: string[];
}

export function mapConsultant(c: ApiConsultant): Consultant {
  return {
    id: String(c.id),
    name: c.name,
    avatar: imageUrl(c.image),
    specialty: c.job ?? c.specialization ?? "مستشار",
    rating: c.rating ?? 5,
    price: c.price ?? 0,
    experience: c.experience ?? 0,
    chatEnabled: c.chat_enabled ?? false,
    description: c.description,
    services: c.services?.map((s) => s.name) ?? [],
  };
}

export interface ConsultantsParams {
  page?: number;
  name?: string;
  service_id?: number;
  specialization?: string;
}

export async function getConsultantsApi(params?: ConsultantsParams): Promise<Consultant[]> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.name) query.set("name", params.name);
  if (params?.service_id) query.set("service_id", String(params.service_id));
  if (params?.specialization) query.set("specialization", params.specialization);
  const qs = query.toString() ? `?${query}` : "";
  const res = await apiGet<ApiConsultant[] | { data: ApiConsultant[] }>(`/employees${qs}`);
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data) ? res.data : (res.data as { data: ApiConsultant[] })?.data ?? [];
  return list.map(mapConsultant);
}

export async function getConsultantApi(id: string): Promise<Consultant> {
  const res = await apiGet<ApiConsultant>(`/employees/${id}`);
  if (!res.status || !res.data) throw new Error(res.message);
  return mapConsultant(res.data);
}

export async function getAvailableTimesApi(
  employeeId: string,
  date: string
): Promise<ConsultantAvailableTime[]> {
  const res = await apiGet<ConsultantAvailableTime[]>(
    `/employees/${employeeId}/available-times/${date}`
  );
  if (!res.status) throw new Error(res.message);
  return res.data ?? [];
}
