import { useCallback, useEffect, useState } from "react";
import {
  CreateReservationParams,
  Reservation,
  createReservationApi,
  getReservationsApi,
} from "@/services/reservations";

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReservationsApi();
      setReservations(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ في تحميل الجلسات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createReservation = async (params: CreateReservationParams): Promise<Reservation> => {
    const newRes = await createReservationApi(params);
    setReservations((prev) => [newRes, ...prev]);
    return newRes;
  };

  return { reservations, loading, error, refetch: fetch, createReservation };
}
