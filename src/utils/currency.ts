import { CURRENCY_MAP } from '../data/currencies';

/**
 * Interface representing rates data returned from GET /api/rates
 */
export interface RatesApiResponse {
  base: string;
  rates: Record<string, number>;
  time_last_update_utc: string;
  stale?: boolean;
  fallback?: boolean;
}

/**
 * Convert an amount in KES to the target currency based on USD-pegged exchange rates.
 * Formula: kesAmount * (rate(target) / rate(KES))
 */
export function convertKesToTarget(
  kesAmount: number,
  targetCurrency: string,
  rates?: Record<string, number> | null
): number {
  if (!Number.isFinite(kesAmount)) return 0;
  if (!targetCurrency || targetCurrency === 'KES' || !rates) {
    return kesAmount;
  }

  const kesRate = rates['KES'];
  const targetRate = rates[targetCurrency];

  if (!kesRate || !targetRate || kesRate <= 0) {
    return kesAmount;
  }

  return kesAmount * (targetRate / kesRate);
}

/**
 * Format a price originally in KES for display in the target currency.
 * Applies Intl.NumberFormat with appropriate symbols and decimal places
 * (zero decimals for UGX, RWF, JPY, XOF, XAF, TZS, and whole-number KES).
 */
export function formatCurrencyPrice(
  kesAmount: number,
  targetCurrency: string = 'KES',
  rates?: Record<string, number> | null
): string {
  const converted = convertKesToTarget(kesAmount, targetCurrency, rates);
  const currencyInfo = CURRENCY_MAP[targetCurrency];

  let decimals = currencyInfo ? currencyInfo.decimals : 2;

  // If KES with fractional cents, allow up to 2 decimals, otherwise 0 decimals
  if (targetCurrency === 'KES') {
    decimals = Number.isInteger(converted) ? 0 : 2;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(converted);
  } catch {
    const symbol = currencyInfo?.symbol || targetCurrency;
    return `${symbol} ${converted.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }
}
