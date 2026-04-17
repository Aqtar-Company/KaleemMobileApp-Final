import { apiGet, apiPost, imageUrl } from "./api";

export interface ApiCourse {
  id: number;
  title: string;
  description?: string;
  image?: string;
  price_egp?: number;
  price_sar?: number;
  price_usd?: number;
  duration_hours?: number;
  lessons_count?: number;
  instructor_name?: string;
  instructor_image?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  image?: string;
  priceEgp: number;
  priceSar: number;
  priceUsd: number;
  durationHours: number;
  lessonsCount: number;
  instructorName?: string;
  instructorImage?: string;
}

function mapCourse(c: ApiCourse): Course {
  return {
    id: String(c.id),
    title: c.title,
    description: c.description,
    image: imageUrl(c.image),
    priceEgp: c.price_egp ?? 0,
    priceSar: c.price_sar ?? 0,
    priceUsd: c.price_usd ?? 0,
    durationHours: c.duration_hours ?? 0,
    lessonsCount: c.lessons_count ?? 0,
    instructorName: c.instructor_name,
    instructorImage: imageUrl(c.instructor_image),
  };
}

export async function getCoursesApi(): Promise<Course[]> {
  const res = await apiGet<ApiCourse[] | { data: ApiCourse[] }>("/courses");
  if (!res.status) throw new Error(res.message);
  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { data: ApiCourse[] })?.data ?? [];
  return list.map(mapCourse);
}

export async function getCourseApi(id: string | number): Promise<Course> {
  const res = await apiGet<ApiCourse>(`/courses/${id}`);
  if (!res.status || !res.data) throw new Error(res.message);
  return mapCourse(res.data);
}

export async function subscribeCourseApi(course_id: string | number): Promise<void> {
  const res = await apiPost<void>("/courses/subscribe", { course_id });
  if (!res.status) throw new Error(res.message);
}
