export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  region: 'Africa' | 'World';
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  // Africa
  {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    flag: '🇰🇪',
    region: 'Africa',
    decimals: 0,
  },
  {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'USh',
    flag: '🇺🇬',
    region: 'Africa',
    decimals: 0,
  },
  {
    code: 'TZS',
    name: 'Tanzanian Shilling',
    symbol: 'TSh',
    flag: '🇹🇿',
    region: 'Africa',
    decimals: 0,
  },
  {
    code: 'RWF',
    name: 'Rwandan Franc',
    symbol: 'RF',
    flag: '🇷🇼',
    region: 'Africa',
    decimals: 0,
  },
  {
    code: 'ETB',
    name: 'Ethiopian Birr',
    symbol: 'Br',
    flag: '🇪🇹',
    region: 'Africa',
    decimals: 2,
  },
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    region: 'Africa',
    decimals: 2,
  },
  {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    flag: '🇬🇭',
    region: 'Africa',
    decimals: 2,
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    flag: '🇿🇦',
    region: 'Africa',
    decimals: 2,
  },
  {
    code: 'EGP',
    name: 'Egyptian Pound',
    symbol: 'E£',
    flag: '🇪🇬',
    region: 'Africa',
    decimals: 2,
  },
  {
    code: 'MAD',
    name: 'Moroccan Dirham',
    symbol: 'MAD',
    flag: '🇲🇦',
    region: 'Africa',
    decimals: 2,
  },
  {
    code: 'XOF',
    name: 'West African CFA Franc',
    symbol: 'CFA',
    flag: '🌍',
    region: 'Africa',
    decimals: 0,
  },
  {
    code: 'XAF',
    name: 'Central African CFA Franc',
    symbol: 'FCFA',
    flag: '🌍',
    region: 'Africa',
    decimals: 0,
  },

  // World (Popular Worldwide)
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    region: 'World',
    decimals: 2,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    region: 'World',
    decimals: 2,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    region: 'World',
    decimals: 2,
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    region: 'World',
    decimals: 0,
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    flag: '🇨🇳',
    region: 'World',
    decimals: 2,
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    region: 'World',
    decimals: 2,
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    flag: '🇦🇪',
    region: 'World',
    decimals: 2,
  },
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR',
    flag: '🇸🇦',
    region: 'World',
    decimals: 2,
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    flag: '🇨🇦',
    region: 'World',
    decimals: 2,
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'AU$',
    flag: '🇦🇺',
    region: 'World',
    decimals: 2,
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    flag: '🇨🇭',
    region: 'World',
    decimals: 2,
  },
];

export const CURRENCY_MAP: Record<string, Currency> = Object.fromEntries(
  SUPPORTED_CURRENCIES.map((c) => [c.code, c])
);
