import { Router } from 'express';
import type { Request, Response } from 'express';

export const ratesRouter = Router();

// Whitelist of supported currencies (Africa & Popular Worldwide)
const SUPPORTED_CURRENCY_CODES = [
  // Africa
  'KES', 'UGX', 'TZS', 'RWF', 'ETB', 'NGN', 'GHS', 'ZAR', 'EGP', 'MAD', 'XOF', 'XAF',
  // World
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AED', 'SAR', 'CAD', 'AUD', 'CHF',
];

// Built-in fallback exchange rates against USD in case API is completely unreachable on first boot
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  KES: 129.98,
  UGX: 3710,
  TZS: 2620,
  RWF: 1410,
  ETB: 125.5,
  NGN: 1540,
  GHS: 15.6,
  ZAR: 18.25,
  EGP: 49.6,
  MAD: 10.05,
  XOF: 608,
  XAF: 608,
  EUR: 0.894,
  GBP: 0.776,
  JPY: 153.5,
  CNY: 7.24,
  INR: 86.1,
  AED: 3.6725,
  SAR: 3.75,
  CAD: 1.41,
  AUD: 1.54,
  CHF: 0.905,
};

interface CachedRates {
  base: string;
  rates: Record<string, number>;
  time_last_update_utc: string;
  time_next_update_unix?: number;
  fetchedAt: number;
}

let ratesCache: CachedRates | null = null;
let lastFetchAttemptTime = 0;
const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Fetch rates from open.er-api.com with 5-second timeout and validation.
 */
async function fetchLatestRates(): Promise<CachedRates | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MegaMarket-Platform/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Rates API responded with HTTP status ${res.status}`);
      return null;
    }

    const data: any = await res.json();

    // Validate response structure
    if (data?.result !== 'success' || !data.rates || typeof data.rates !== 'object') {
      console.warn('Rates API returned invalid payload structure');
      return null;
    }

    // Filter to only supported currencies with valid numeric rates
    const filteredRates: Record<string, number> = {};
    for (const code of SUPPORTED_CURRENCY_CODES) {
      const rateVal = data.rates[code];
      if (typeof rateVal === 'number' && Number.isFinite(rateVal) && rateVal > 0) {
        filteredRates[code] = rateVal;
      }
    }

    // Ensure at least USD and KES are present
    if (!filteredRates.USD || !filteredRates.KES) {
      console.warn('Rates API missing critical currencies (USD or KES)');
      return null;
    }

    return {
      base: 'USD',
      rates: filteredRates,
      time_last_update_utc: data.time_last_update_utc || new Date().toUTCString(),
      time_next_update_unix: typeof data.time_next_update_unix === 'number' ? data.time_next_update_unix : undefined,
      fetchedAt: Date.now(),
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('Failed to fetch live exchange rates from open.er-api.com:', error?.message || String(error));
    return null;
  }
}

/**
 * GET /api/rates
 * Returns base, supported rates, and update time.
 * In-memory caching: refreshes only after 1 hour or after time_next_update_unix, never more than once/hour.
 * Gracefully returns stale rates or fallback table if fetch fails.
 */
ratesRouter.get('/', async (_req: Request, res: Response) => {
  const now = Date.now();
  const cacheAge = ratesCache ? now - ratesCache.fetchedAt : Infinity;
  const nextUpdatePassed = ratesCache?.time_next_update_unix
    ? now >= ratesCache.time_next_update_unix * 1000
    : false;

  const shouldRefresh =
    !ratesCache ||
    ((cacheAge >= ONE_HOUR_MS || nextUpdatePassed) && now - lastFetchAttemptTime >= ONE_HOUR_MS);

  if (shouldRefresh) {
    lastFetchAttemptTime = now;
    const fresh = await fetchLatestRates();
    if (fresh) {
      ratesCache = fresh;
    }
  }

  // 1. Fresh or cached rates available
  if (ratesCache) {
    const isStale = now - ratesCache.fetchedAt > ONE_HOUR_MS * 2;
    const responsePayload: {
      base: string;
      rates: Record<string, number>;
      time_last_update_utc: string;
      stale?: boolean;
    } = {
      base: ratesCache.base,
      rates: ratesCache.rates,
      time_last_update_utc: ratesCache.time_last_update_utc,
    };

    if (isStale) {
      responsePayload.stale = true;
    }

    return res.json(responsePayload);
  }

  // 2. Initial fetch failed and no cache yet -> Return safe fallback table
  return res.json({
    base: 'USD',
    rates: FALLBACK_RATES,
    time_last_update_utc: 'Wed, 11 Nov 2026 00:00:00 +0000',
    fallback: true,
  });
});
