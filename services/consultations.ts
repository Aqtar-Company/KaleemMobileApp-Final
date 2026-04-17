import { apiGet, imageUrl } from "./api";

export interface ApiConsultation {
  id: number;
  employee_id?: number;
  employee_name?: string;
  employee_title?: string;
  employee_image?: string;
  service_title?: string;
  question?: string;
  answer?: string;
  status?: "pending" | "answered";
  created_at?: string;
  price?: number;
}

export interface Consultation {
  id: string;
  consultantId: string;
  consultantName: string;
  consultantTitle: string;
  consultantAvatar?: string;
  serviceTitle: string;
  question: string;
  answer?: string;
  status: "pending" | "answered";
  date: string;
  price: number;
}

function mapConsultation(c: ApiConsultation): Consultation {
  return {
    id: String(c.id),
    consultantId: String(c.employee_id ?? ""),
    consultantName: c.employee_name ?? "مستشار",
    consultantTitle: c.employee_title ?? "",
    consultantAvatar: imageUrl(c.employee_image),
    serviceTitle: c.service_title ?? "",
    question: c.question ?? "",
    answer: c.answer,
    status: (c.status as Consultation["status"]) ?? "pending",
    date: (c.created_at ?? "").split("T")[0] ?? "",
    price: c.price ?? 0,
  };
}

export async function getConsultationsApi(): Promise<Consultation[]> {
  const res = await apiGet<ApiConsultation[] | { data: ApiConsultation[] }>(
    "/consultations"
  );
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { data: ApiConsultation[] })?.data ?? [];
  return list.map(mapConsultation);
}
