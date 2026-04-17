import { useEffect, useState } from "react";
import {
  CurrencyCode,
  detectUserCurrency,
  formatAmount,
  setStoredCurrency,
} from "@/lib/currency";

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    detectUserCurrency().then((c) => {
      if (!cancelled) {
        setCurrency(c);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    currency,
    ready,
    format: (amounts: { price_egp?: number; price_sar?: number; price_usd?: number }) =>
      formatAmount(amounts, currency),
    setCurrency: async (code: CurrencyCode) => {
      await setStoredCurrency(code);
      setCurrency(code);
    },
  };
}
