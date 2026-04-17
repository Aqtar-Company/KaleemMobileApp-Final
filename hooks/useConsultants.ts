import { useCallback, useEffect, useState } from "react";
import {
  Consultant,
  ConsultantsParams,
  getConsultantApi,
  getConsultantsApi,
  getAvailableTimesApi,
  ConsultantAvailableTime,
} from "@/services/consultants";

export function useConsultants(params?: ConsultantsParams) {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConsultantsApi(params);
      setConsultants(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ في تحميل المستشارين");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { consultants, loading, error, refetch: fetch };
}

export function useConsultant(id: string) {
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getConsultantApi(id)
      .then(setConsultant)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "حدث خطأ"))
      .finally(() => setLoading(false));
  }, [id]);

  return { consultant, loading, error };
}

export function useAvailableTimes(employeeId: string, date: string) {
  const [times, setTimes] = useState<ConsultantAvailableTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId || !date) return;
    setLoading(true);
    getAvailableTimesApi(employeeId, date)
      .then(setTimes)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "حدث خطأ"))
      .finally(() => setLoading(false));
  }, [employeeId, date]);

  return { times, loading, error };
}
