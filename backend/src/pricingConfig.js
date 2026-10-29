/**
 * OXOO Global Country & Multi-Currency Pricing Configuration (Backend Authoritative Source)
 * Synchronized with frontend/src/pricingConfig.js
 *
 * RULE:
 * - Inside India (IN): Prices are calculated and billed in Indian Rupees (INR ₹).
 * - Anywhere Outside India (US, GB, AE, CA, AU, SG, DE, GLOBAL, or any non-IN country):
 *   Prices are ALWAYS calculated and billed in US Dollars (USD $).
 */

const USD_PLANS_CONFIG = {
  freeDemo: { id: 'free-demo', name: 'Free Demo', price: 0 },
  singleApp: {
    id: 'single-app',
    name: 'Standard Pack',
    monthlyPrice: 25,
    yearlyPrice: 20,
    monthlyStrikethroughPrice: 33,
    yearlyStrikethroughPrice: 25,
    discountPercentMonthly: 24,
    discountPercentYearly: 20
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
    discountPercentYearly: 20
  }
};

const INR_PLANS_CONFIG = {
  freeDemo: { id: 'free-demo', name: 'Free Demo', price: 0 },
  singleApp: {
    id: 'single-app',
    name: 'Standard Pack',
    monthlyPrice: 740,
    yearlyPrice: 560,
    monthlyStrikethroughPrice: 975,
    yearlyStrikethroughPrice: 740,
    discountPercentMonthly: 24,
    discountPercentYearly: 24
  },
  customApps: {
    id: 'custom-apps',
    name: 'Custom Pack',
    monthlyBasePrice: 1280,
    yearlyBasePrice: 980,
    monthlyAdditionalAppPrice: 740,
    yearlyAdditionalAppPrice: 560,
    monthlyStrikethroughBasePrice: 1660,
    yearlyStrikethroughBasePrice: 1280,
    discountPercentMonthly: 23,
    discountPercentYearly: 23
  }
};

const COUNTRY_DIRECTORY = {
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
    isIndia: false,
    plans: USD_PLANS_CONFIG
  };
}

const REGIONAL_PRICING = {
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

function resolvePricingRegion(countryCode) {
  if (!countryCode || typeof countryCode !== 'string') {
    return REGIONAL_PRICING.IN;
  }
  const normalized = countryCode.trim().toUpperCase();
  if (normalized === 'IN' || normalized === 'INDIA') {
    return REGIONAL_PRICING.IN;
  }
  if (normalized === 'UK' || normalized === 'UNITED KINGDOM') return REGIONAL_PRICING.GB;
  if (normalized === 'UAE' || normalized === 'UNITED ARAB EMIRATES') return REGIONAL_PRICING.AE;
  if (normalized === 'USA' || normalized === 'UNITED STATES') return REGIONAL_PRICING.US;

  // Check if country name matches a directory entry
  for (const [iso, meta] of Object.entries(COUNTRY_DIRECTORY)) {
    if (meta.countryName.toUpperCase() === normalized) {
      return iso === 'IN' ? REGIONAL_PRICING.IN : (REGIONAL_PRICING[iso] || createUsdRegion(iso, meta.countryName, meta.flag, meta.dialCode));
    }
  }

  if (REGIONAL_PRICING[normalized]) {
    return REGIONAL_PRICING[normalized];
  }

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

function formatRegionalCurrency(amount, regionOrCode = 'IN') {
  const region = typeof regionOrCode === 'string'
    ? resolvePricingRegion(regionOrCode)
    : (regionOrCode || REGIONAL_PRICING.IN);

  const num = Number(amount) || 0;
  const hasDecimals = num % 1 !== 0;
  try {
    return new Intl.NumberFormat(region.locale, {
      style: 'currency',
      currency: region.currency,
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0
    }).format(num);
  } catch {
    return `${region.symbol}${num.toFixed(hasDecimals ? 2 : 0)}`;
  }
}

module.exports = {
  REGIONAL_PRICING,
  COUNTRY_DIRECTORY,
  resolvePricingRegion,
  formatRegionalCurrency
};
