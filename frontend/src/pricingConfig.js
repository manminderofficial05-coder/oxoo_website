/**
 * OXOO Global Country & Multi-Currency Pricing Configuration
 * Single source of truth for regional pricing across Homepage, PricingPage, CheckoutPage, and App Directories.
 *
 * RULE:
 * - Inside India (IN): Prices are displayed and billed in Indian Rupees (INR ₹).
 * - Anywhere Outside India (US, GB, AE, CA, AU, SG, DE, GLOBAL, or any non-IN country):
 *   Prices are ALWAYS displayed and billed in US Dollars (USD $), while the header
 *   displays the client's detected country location.
 */

export const USD_PLANS_CONFIG = {
  freeDemo: {
    id: 'free-demo',
    name: 'Free Demo',
    price: 0
  },
  singleApp: {
    id: 'single-app',
    name: 'Standard Pack',
    monthlyPrice: 25,
    yearlyPrice: 20,
    monthlyStrikethroughPrice: 33,
    yearlyStrikethroughPrice: 25,
    discountPercentMonthly: 24,
    discountPercentYearly: 20,
    monthly: { price: 25, originalPrice: 33 },
    yearly: { price: 20, originalPrice: 25 }
  },
  customApps: {
    id: 'custom-apps',
    name: 'Custom Pack',
    monthlyBasePrice: 50,
    yearlyBasePrice: 40,
    monthlyAdditionalAppPrice: 25,
    yearlyAdditionalAppPrice: 20,
    monthlyStrikethroughBasePrice: 65,
    yearlyStrikethroughBasePrice: 50,
    discountPercentMonthly: 23,
    discountPercentYearly: 20,
    monthly: { price: 50, originalPrice: 65 },
    yearly: { price: 40, originalPrice: 50 }
  },
  additionalApp: {
    monthly: { price: 25 },
    yearly: { price: 20 }
  }
};

export const INR_PLANS_CONFIG = {
  freeDemo: {
    id: 'free-demo',
    name: 'Free Demo',
    price: 0
  },
  singleApp: {
    id: 'single-app',
    name: 'Standard Pack',
    monthlyPrice: 740,
    yearlyPrice: 580,
    monthlyStrikethroughPrice: 975,
    yearlyStrikethroughPrice: 740,
    discountPercentMonthly: 24,
    discountPercentYearly: 22,
    monthly: { price: 740, originalPrice: 975 },
    yearly: { price: 580, originalPrice: 740 }
  },
  customApps: {
    id: 'custom-apps',
    name: 'Custom Pack',
    monthlyBasePrice: 1280,
    yearlyBasePrice: 980,
    monthlyAdditionalAppPrice: 740,
    yearlyAdditionalAppPrice: 580,
    monthlyStrikethroughBasePrice: 1660,
    yearlyStrikethroughBasePrice: 1280,
    discountPercentMonthly: 23,
    discountPercentYearly: 23,
    monthly: { price: 1280, originalPrice: 1660 },
    yearly: { price: 980, originalPrice: 1280 }
  },
  additionalApp: {
    monthly: { price: 740 },
    yearly: { price: 580 }
  }
};

export const COUNTRY_DIRECTORY = {
  IN: { countryName: 'India', flag: '🇮🇳', dialCode: '+91' },
  US: { countryName: 'United States', flag: '🇺🇸', dialCode: '+1' },
  GB: { countryName: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  AE: { countryName: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  CA: { countryName: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  AU: { countryName: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  SG: { countryName: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  DE: { countryName: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  FR: { countryName: 'France', flag: '🇫🇷', dialCode: '+33' },
  NL: { countryName: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
  JP: { countryName: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  SA: { countryName: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  QA: { countryName: 'Qatar', flag: '🇶🇦', dialCode: '+974' },
  MY: { countryName: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
  NZ: { countryName: 'New Zealand', flag: '🇳🇿', dialCode: '+64' },
  CH: { countryName: 'Switzerland', flag: '🇨🇭', dialCode: '+41' },
  SE: { countryName: 'Sweden', flag: '🇸🇪', dialCode: '+46' },
  IE: { countryName: 'Ireland', flag: '🇮🇪', dialCode: '+353' },
  IT: { countryName: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  ES: { countryName: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  BR: { countryName: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  ZA: { countryName: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  GLOBAL: { countryName: 'International', flag: '🌐', dialCode: '+1' }
};

function createUsdRegion(code, countryName, flag, dialCode = '+1') {
  return {
    regionCode: code,
    countryName,
    flag,
    dialCode,
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
    taxRate: 0.00,
    taxName: 'Tax (Exempt / Included)',
    discountPercentYearly: 20,
    isIndia: false,
    plans: USD_PLANS_CONFIG
  };
}

export const REGIONAL_PRICING = {
  IN: {
    regionCode: 'IN',
    countryName: 'India',
    flag: '🇮🇳',
    dialCode: '+91',
    currency: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    taxRate: 0.18,
    taxName: 'GST (18%)',
    discountPercentYearly: 24,
    isIndia: true,
    plans: INR_PLANS_CONFIG
  },
  US: createUsdRegion('US', 'United States', '🇺🇸', '+1'),
  GB: createUsdRegion('GB', 'United Kingdom', '🇬🇧', '+44'),
  AE: createUsdRegion('AE', 'United Arab Emirates', '🇦🇪', '+971'),
  CA: createUsdRegion('CA', 'Canada', '🇨🇦', '+1'),
  AU: createUsdRegion('AU', 'Australia', '🇦🇺', '+61'),
  SG: createUsdRegion('SG', 'Singapore', '🇸🇬', '+65'),
  DE: createUsdRegion('DE', 'Germany', '🇩🇪', '+49'),
  FR: createUsdRegion('FR', 'France', '🇫🇷', '+33'),
  JP: createUsdRegion('JP', 'Japan', '🇯🇵', '+81'),
  GLOBAL: createUsdRegion('GLOBAL', 'International', '🌐', '+1')
};

/**
 * List of selectable countries/regions for the Header & Pricing selector
 * India shows INR ₹; all locations outside India show USD $
 */
export const SELECTABLE_REGIONS = [
  { code: 'IN', label: 'India — INR ₹', flag: '🇮🇳', currency: 'INR', symbol: '₹' },
  { code: 'US', label: 'United States — USD $', flag: '🇺🇸', currency: 'USD', symbol: '$' },
  { code: 'GB', label: 'United Kingdom — USD $', flag: '🇬🇧', currency: 'USD', symbol: '$' },
  { code: 'AE', label: 'United Arab Emirates — USD $', flag: '🇦🇪', currency: 'USD', symbol: '$' },
  { code: 'CA', label: 'Canada — USD $', flag: '🇨🇦', currency: 'USD', symbol: '$' },
  { code: 'AU', label: 'Australia — USD $', flag: '🇦🇺', currency: 'USD', symbol: '$' },
  { code: 'SG', label: 'Singapore — USD $', flag: '🇸🇬', currency: 'USD', symbol: '$' },
  { code: 'DE', label: 'Germany — USD $', flag: '🇩🇪', currency: 'USD', symbol: '$' },
  { code: 'GLOBAL', label: 'Other Country — USD $', flag: '🌐', currency: 'USD', symbol: '$' }
];

function isoToFlagEmoji(code) {
  if (!code || code.length !== 2) return '🌐';
  try {
    return code
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
  } catch {
    return '🌐';
  }
}

/**
 * Resolve any ISO 3166-1 alpha-2 country code to a supported pricing region.
 * - 'IN' or 'INDIA' -> India (INR ₹)
 * - Anything else outside India -> That country's location metadata with US Dollar (USD $) pricing!
 */
export function resolvePricingRegion(countryCode) {
  if (!countryCode || typeof countryCode !== 'string') {
    return REGIONAL_PRICING.IN;
  }
  const normalized = countryCode.trim().toUpperCase();
  if (normalized === 'IN' || normalized === 'INDIA') {
    return REGIONAL_PRICING.IN;
  }
  if ( normalized === 'UK' ) {
    return REGIONAL_PRICING.GB;
  }
  if ( normalized === 'UAE' ) {
    return REGIONAL_PRICING.AE;
  }
  if ( normalized === 'USA' ) {
    return REGIONAL_PRICING.US;
  }
  if (REGIONAL_PRICING[normalized]) {
    return REGIONAL_PRICING[normalized];
  }
  // Any other 2-letter ISO country code outside India gets its own country code/name/flag + USD $ pricing
  if (/^[A-Z]{2}$/.test(normalized)) {
    const meta = COUNTRY_DIRECTORY[normalized];
    let displayCountryName = meta?.countryName || normalized;
    if (!meta && typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
      try {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        displayCountryName = regionNames.of(normalized) || normalized;
      } catch {
        displayCountryName = normalized;
      }
    }
    return createUsdRegion(
      normalized,
      displayCountryName,
      meta?.flag || isoToFlagEmoji(normalized),
      meta?.dialCode || '+1'
    );
  }
  return REGIONAL_PRICING.GLOBAL;
}

/**
 * Format a numeric price cleanly using region's currency & locale
 */
export function formatRegionalPrice(amount, regionOrCode = 'IN', options = {}) {
  const region = typeof regionOrCode === 'string'
    ? resolvePricingRegion(regionOrCode)
    : (regionOrCode || REGIONAL_PRICING.IN);

  const num = Number(amount);
  if (Number.isNaN(num)) return `${region.symbol}0`;

  const hasDecimals = num % 1 !== 0;
  try {
    return new Intl.NumberFormat(region.locale, {
      style: 'currency',
      currency: region.currency,
      minimumFractionDigits: options.minimumFractionDigits ?? (hasDecimals ? 2 : 0),
      maximumFractionDigits: options.maximumFractionDigits ?? (hasDecimals ? 2 : 0)
    }).format(num);
  } catch {
    return `${region.symbol}${num.toLocaleString()}`;
  }
}
