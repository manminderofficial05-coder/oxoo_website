/**
 * OXOO.ai — Centralized Regional Pricing Configuration (Frontend)
 * Synchronized with server-side authoritative pricing configuration.
 */

export const REGIONAL_PRICING = {
  IN: {
    regionCode: 'IN',
    countryName: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    taxRate: 0.18, // 18% GST (CGST 9% + SGST 9%)
    taxName: 'GST (18%)',
    plans: {
      singleApp: {
        id: 'single-app',
        name: 'Standard Pack',
        planTier: 'Basic',
        tagline: 'Buy one software at affordable price',
        monthlyPrice: 740,
        yearlyPrice: 580,
        monthlyStrikethroughPrice: 975,
        yearlyStrikethroughPrice: 740,
        discountPercentYearly: 22,
        discountPercentMonthly: 24,
        maxApps: 1,
        additionalAppMonthlyPrice: 740,
        additionalAppYearlyPrice: 580
      },
      customApps: {
        id: 'custom-apps',
        name: 'Custom Pack',
        planTier: 'Pro',
        tagline: 'Choose 2 or more software and get advanced features',
        monthlyBasePrice: 1280,
        yearlyBasePrice: 980,
        monthlyStrikethroughBasePrice: 1660,
        yearlyStrikethroughBasePrice: 1280,
        monthlyAdditionalAppPrice: 740,
        yearlyAdditionalAppPrice: 580,
        discountPercentYearly: 23,
        discountPercentMonthly: 23,
        minApps: 2
      }
    }
  },
  US: {
    regionCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
    taxRate: 0.00,
    taxName: 'Sales Tax',
    plans: {
      singleApp: {
        id: 'single-app',
        name: 'Standard Pack',
        planTier: 'Basic',
        tagline: 'Buy one software at affordable price',
        monthlyPrice: 25,
        yearlyPrice: 20,
        monthlyStrikethroughPrice: 32,
        yearlyStrikethroughPrice: 25,
        discountPercentYearly: 20,
        discountPercentMonthly: 22,
        maxApps: 1,
        additionalAppMonthlyPrice: 25,
        additionalAppYearlyPrice: 20
      },
      customApps: {
        id: 'custom-apps',
        name: 'Custom Pack',
        planTier: 'Pro',
        tagline: 'Choose 2 or more software and get advanced features',
        monthlyBasePrice: 50,
        yearlyBasePrice: 40,
        monthlyStrikethroughBasePrice: 65,
        yearlyStrikethroughBasePrice: 50,
        monthlyAdditionalAppPrice: 25,
        yearlyAdditionalAppPrice: 20,
        discountPercentYearly: 20,
        discountPercentMonthly: 23,
        minApps: 2
      }
    }
  },
  GB: {
    regionCode: 'GB',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    taxRate: 0.00,
    taxName: 'VAT',
    plans: {
      singleApp: {
        id: 'single-app',
        name: 'Standard Pack',
        planTier: 'Basic',
        tagline: 'Buy one software at affordable price',
        monthlyPrice: 20,
        yearlyPrice: 16,
        monthlyStrikethroughPrice: 26,
        yearlyStrikethroughPrice: 20,
        discountPercentYearly: 20,
        discountPercentMonthly: 23,
        maxApps: 1,
        additionalAppMonthlyPrice: 20,
        additionalAppYearlyPrice: 16
      },
      customApps: {
        id: 'custom-apps',
        name: 'Custom Pack',
        planTier: 'Pro',
        tagline: 'Choose 2 or more software and get advanced features',
        monthlyBasePrice: 40,
        yearlyBasePrice: 32,
        monthlyStrikethroughBasePrice: 52,
        yearlyStrikethroughBasePrice: 40,
        monthlyAdditionalAppPrice: 20,
        yearlyAdditionalAppPrice: 16,
        discountPercentYearly: 20,
        discountPercentMonthly: 23,
        minApps: 2
      }
    }
  },
  AE: {
    regionCode: 'AE',
    countryName: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED',
    locale: 'en-AE',
    taxRate: 0.00,
    taxName: 'VAT',
    plans: {
      singleApp: {
        id: 'single-app',
        name: 'Standard Pack',
        planTier: 'Basic',
        tagline: 'Buy one software at affordable price',
        monthlyPrice: 95,
        yearlyPrice: 75,
        monthlyStrikethroughPrice: 120,
        yearlyStrikethroughPrice: 95,
        discountPercentYearly: 21,
        discountPercentMonthly: 21,
        maxApps: 1,
        additionalAppMonthlyPrice: 95,
        additionalAppYearlyPrice: 75
      },
      customApps: {
        id: 'custom-apps',
        name: 'Custom Pack',
        planTier: 'Pro',
        tagline: 'Choose 2 or more software and get advanced features',
        monthlyBasePrice: 190,
        yearlyBasePrice: 150,
        monthlyStrikethroughBasePrice: 240,
        yearlyStrikethroughBasePrice: 190,
        monthlyAdditionalAppPrice: 95,
        yearlyAdditionalAppPrice: 75,
        discountPercentYearly: 21,
        discountPercentMonthly: 21,
        minApps: 2
      }
    }
  },
  CA: {
    regionCode: 'CA',
    countryName: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: 'CA$',
    locale: 'en-CA',
    taxRate: 0.00,
    taxName: 'HST/GST',
    plans: {
      singleApp: {
        id: 'single-app',
        name: 'Standard Pack',
        planTier: 'Basic',
        tagline: 'Buy one software at affordable price',
        monthlyPrice: 35,
        yearlyPrice: 28,
        monthlyStrikethroughPrice: 45,
        yearlyStrikethroughPrice: 35,
        discountPercentYearly: 20,
        discountPercentMonthly: 22,
        maxApps: 1,
        additionalAppMonthlyPrice: 35,
        additionalAppYearlyPrice: 28
      },
      customApps: {
        id: 'custom-apps',
        name: 'Custom Pack',
        planTier: 'Pro',
        tagline: 'Choose 2 or more software and get advanced features',
        monthlyBasePrice: 70,
        yearlyBasePrice: 55,
        monthlyStrikethroughBasePrice: 90,
        yearlyStrikethroughBasePrice: 70,
        monthlyAdditionalAppPrice: 35,
        yearlyAdditionalAppPrice: 28,
        discountPercentYearly: 21,
        discountPercentMonthly: 22,
        minApps: 2
      }
    }
  },
  AU: {
    regionCode: 'AU',
    countryName: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    symbol: 'A$',
    locale: 'en-AU',
    taxRate: 0.00,
    taxName: 'GST',
    plans: {
      singleApp: {
        id: 'single-app',
        name: 'Standard Pack',
        planTier: 'Basic',
        tagline: 'Buy one software at affordable price',
        monthlyPrice: 38,
        yearlyPrice: 30,
        monthlyStrikethroughPrice: 50,
        yearlyStrikethroughPrice: 38,
        discountPercentYearly: 21,
        discountPercentMonthly: 24,
        maxApps: 1,
        additionalAppMonthlyPrice: 38,
        additionalAppYearlyPrice: 30
      },
      customApps: {
        id: 'custom-apps',
        name: 'Custom Pack',
        planTier: 'Pro',
        tagline: 'Choose 2 or more software and get advanced features',
        monthlyBasePrice: 75,
        yearlyBasePrice: 60,
        monthlyStrikethroughBasePrice: 95,
        yearlyStrikethroughBasePrice: 75,
        monthlyAdditionalAppPrice: 38,
        yearlyAdditionalAppPrice: 30,
        discountPercentYearly: 20,
        discountPercentMonthly: 21,
        minApps: 2
      }
    }
  },
  GLOBAL: {
    regionCode: 'GLOBAL',
    countryName: 'International',
    flag: '🌍',
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
    taxRate: 0.00,
    taxName: 'Tax',
    plans: {
      singleApp: {
        id: 'single-app',
        name: 'Standard Pack',
        planTier: 'Basic',
        tagline: 'Buy one software at affordable price',
        monthlyPrice: 25,
        yearlyPrice: 20,
        monthlyStrikethroughPrice: 32,
        yearlyStrikethroughPrice: 25,
        discountPercentYearly: 20,
        discountPercentMonthly: 22,
        maxApps: 1,
        additionalAppMonthlyPrice: 25,
        additionalAppYearlyPrice: 20
      },
      customApps: {
        id: 'custom-apps',
        name: 'Custom Pack',
        planTier: 'Pro',
        tagline: 'Choose 2 or more software and get advanced features',
        monthlyBasePrice: 50,
        yearlyBasePrice: 40,
        monthlyStrikethroughBasePrice: 65,
        yearlyStrikethroughBasePrice: 50,
        monthlyAdditionalAppPrice: 25,
        yearlyAdditionalAppPrice: 20,
        discountPercentYearly: 20,
        discountPercentMonthly: 23,
        minApps: 2
      }
    }
  }
};

export const SELECTABLE_REGIONS = [
  { code: 'IN', label: 'India — INR ₹', flag: '🇮🇳', currency: 'INR', symbol: '₹' },
  { code: 'US', label: 'United States — USD $', flag: '🇺🇸', currency: 'USD', symbol: '$' },
  { code: 'GB', label: 'United Kingdom — GBP £', flag: '🇬🇧', currency: 'GBP', symbol: '£' },
  { code: 'AE', label: 'United Arab Emirates — AED د.إ', flag: '🇦🇪', currency: 'AED', symbol: 'AED' },
  { code: 'CA', label: 'Canada — CAD CA$', flag: '🇨🇦', currency: 'CAD', symbol: 'CA$' },
  { code: 'AU', label: 'Australia — AUD A$', flag: '🇦🇺', currency: 'AUD', symbol: 'A$' },
  { code: 'GLOBAL', label: 'International — USD $', flag: '🌍', currency: 'USD', symbol: '$' }
];

export function resolvePricingRegion(countryCode) {
  const normalized = countryCode ? String(countryCode).trim().toUpperCase() : 'GLOBAL';
  const baseRegion = REGIONAL_PRICING[normalized] || REGIONAL_PRICING.GLOBAL;

  // Ensure backward-compatible aliases exist on plans
  if (baseRegion && baseRegion.plans && !baseRegion.plans.singleApp.yearly) {
    const s = baseRegion.plans.singleApp;
    const c = baseRegion.plans.customApps;
    s.yearly = { price: s.yearlyPrice, originalPrice: s.yearlyStrikethroughPrice, discountPercent: s.discountPercentYearly };
    s.monthly = { price: s.monthlyPrice, originalPrice: s.monthlyStrikethroughPrice, discountPercent: s.discountPercentMonthly };
    c.yearly = { price: c.yearlyBasePrice, originalPrice: c.yearlyStrikethroughBasePrice, discountPercent: c.discountPercentYearly };
    c.monthly = { price: c.monthlyBasePrice, originalPrice: c.monthlyStrikethroughBasePrice, discountPercent: c.discountPercentMonthly };
    baseRegion.plans.additionalApp = {
      yearly: { price: c.yearlyAdditionalAppPrice },
      monthly: { price: c.monthlyAdditionalAppPrice }
    };
  }

  return baseRegion;
}

export function formatRegionalCurrency(amount, regionCode = 'IN') {
  const region = REGIONAL_PRICING[regionCode] || REGIONAL_PRICING.GLOBAL;
  const num = Number(amount || 0);
  return new Intl.NumberFormat(region.locale, {
    style: 'currency',
    currency: region.currency,
    minimumFractionDigits: region.currency === 'INR' || num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(num);
}
