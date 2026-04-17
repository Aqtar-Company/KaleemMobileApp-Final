import AsyncStorage from "@react-native-async-storage/async-storage";

export type CurrencyCode =
  | "EGP"
  | "SAR"
  | "AED"
  | "KWD"
  | "QAR"
  | "BHD"
  | "OMR"
  | "JOD"
  | "MAD"
  | "USD";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EGP: "ج.م",
  SAR: "﷼",
  AED: "د.إ",
  KWD: "د.ك",
  QAR: "ر.ق",
  BHD: "د.ب",
  OMR: "ر.ع",
  JOD: "د.أ",
  MAD: "د.م",
  USD: "$",
};

// Cross-rates applied to price_usd. EGP and SAR are pulled from the
// backend's explicit fields, so they stay at 1 here.
export const USD_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EGP: 1,
  SAR: 1,
  AED: 3.67,
  KWD: 0.307,
  QAR: 3.64,
  BHD: 0.376,
  OMR: 0.385,
  JOD: 0.709,
  MAD: 10.0,
};

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  EG: "EGP",
  SA: "SAR",
  AE: "AED",
  KW: "KWD",
  QA: "QAR",
  BH: "BHD",
  OM: "OMR",
  JO: "JOD",
  MA: "MAD",
};

const TIMEZONE_TO_CURRENCY: Record<string, CurrencyCode> = {
  "Africa/Cairo": "EGP",
  "Asia/Riyadh": "SAR",
  "Asia/Dubai": "AED",
  "Asia/Kuwait": "KWD",
  "Asia/Qatar": "QAR",
  "Asia/Bahrain": "BHD",
  "Asia/Muscat": "OMR",
  "Asia/Amman": "JOD",
  "Africa/Casablanca": "MAD",
};

const STORAGE_KEY = "kaleem_currency";

export async function getStoredCurrency(): Promise<CurrencyCode | null> {
  const v = await AsyncStorage.getItem(STORAGE_KEY);
  return (v as CurrencyCode | null) ?? null;
}

export async function setStoredCurrency(code: CurrencyCode): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, code);
}

export async function detectUserCurrency(): Promise<CurrencyCode> {
  const cached = await getStoredCurrency();
  if (cached) return cached;

  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = (await res.json()) as { country_code?: string };
      const mapped = data.country_code ? COUNTRY_TO_CURRENCY[data.country_code] : null;
      if (mapped) {
        await setStoredCurrency(mapped);
        return mapped;
      }
    }
  } catch {
    // fall through to timezone fallback
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzMatch = TIMEZONE_TO_CURRENCY[tz];
    if (tzMatch) {
      await setStoredCurrency(tzMatch);
      return tzMatch;
    }
  } catch {
    // fall through
  }

  await setStoredCurrency("USD");
  return "USD";
}

export function convertFromUsd(priceUsd: number, target: CurrencyCode): number {
  const rate = USD_RATES[target] ?? 1;
  const converted = priceUsd * rate;
  // Round to a nicer number for display. Sub-unit currencies (KWD/BHD/OMR/JOD)
  // get 2 decimals; the rest round to nearest whole.
  if (target === "KWD" || target === "BHD" || target === "OMR" || target === "JOD") {
    return Math.round(converted * 100) / 100;
  }
  return Math.round(converted);
}

export function formatAmount(
  amounts: { price_egp?: number; price_sar?: number; price_usd?: number },
  currency: CurrencyCode
): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  let value: number;

  if (currency === "EGP") {
    value = amounts.price_egp ?? (amounts.price_usd != null ? convertFromUsd(amounts.price_usd, "EGP") : 0);
  } else if (currency === "SAR") {
    value = amounts.price_sar ?? (amounts.price_usd != null ? convertFromUsd(amounts.price_usd, "SAR") : 0);
  } else if (currency === "USD") {
    value = amounts.price_usd ?? 0;
  } else {
    value = convertFromUsd(amounts.price_usd ?? 0, currency);
  }

  // Put the symbol after the number for Arabic currencies, before for USD.
  if (currency === "USD") return `${symbol}${value}`;
  return `${value} ${symbol}`;
}
