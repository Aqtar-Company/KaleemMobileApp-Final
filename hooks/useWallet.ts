import { useCallback, useEffect, useState } from "react";
import { WalletData, getWalletApi } from "@/services/wallet";

export function useWallet(enabled = true) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await getWalletApi();
      setWallet(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ في تحميل المحفظة");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { wallet, loading, error, refetch: fetch };
}
