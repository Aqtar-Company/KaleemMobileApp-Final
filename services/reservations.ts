import { apiGet, apiPost, imageUrl } from "./api";

export interface CreateReservationParams {
  employee_id: number;
  from_datetime: string;
  to_datetime: string;
  call_type: "video" | "voice";
  session_type?: string;
  call_subject?: string;
}

export interface ApiReservation {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_image?: string;
  from_datetime: string;
  to_datetime: string;
  call_type: "video" | "voice";
  status: "scheduled" | "completed" | "cancelled" | "pending";
  call_link?: string;
  price?: number;
}

export interface Reservation {
  id: string;
  consultantName: string;
  consultantAvatar?: string;
  date: string;
  time: string;
  type: "video" | "voice";
  status: "scheduled" | "completed" | "cancelled" | "pending";
  price: number;
  callLink?: string;
}

function mapReservation(r: ApiReservation): Reservation {
  const dtParts = r.from_datetime?.split(" ") ?? ["", ""];
  return {
    id: String(r.id),
    consultantName: r.employee_name ?? "مستشار",
    consultantAvatar: imageUrl(r.employee_image),
    date: dtParts[0] ?? r.from_datetime,
    time: dtParts[1]?.slice(0, 5) ?? "",
    type: r.call_type,
    status: r.status,
    price: r.price ?? 0,
    callLink: r.call_link,
  };
}

export async function getReservationsApi(): Promise<Reservation[]> {
  const res = await apiGet<ApiReservation[] | { data: ApiReservation[] }>("/reservations");
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data) ? res.data : (res.data as { data: ApiReservation[] })?.data ?? [];
  return list.map(mapReservation);
}

export async function createReservationApi(params: CreateReservationParams): Promise<Reservation> {
  const res = await apiPost<ApiReservation>("/reservations", params);
  if (!res.status || !res.data) throw new Error(res.message);
  return mapReservation(res.data);
}

export async function getJoinTokenApi(
  reservationId: string
): Promise<{ meeting_url: string; token: string }> {
  const res = await apiGet<{ meeting_url: string; token: string }>(
    `/reservations/${reservationId}/join-token`
  );
  if (!res.status || !res.data) throw new Error(res.message);
  return res.data;
}
