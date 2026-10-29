import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  REGIONAL_PRICING,
  SELECTABLE_REGIONS,
  resolvePricingRegion,
  formatRegionalPrice
} from './pricingConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const STORAGE_KEY_COUNTRY = 'oxoo_selected_country';
const STORAGE_KEY_OVERRIDE = 'oxoo_country_manual_override';
const SESSION_KEY_DETECTED = 'oxoo_detected_country';
const SESSION_KEY_MANUAL = 'oxoo_session_manual_override';

const RegionPricingContext = createContext(null);

/**
 * Infer a 2-letter ISO country code from browser IANA timezone if network geo-IP is unreachable
 */
function inferCountryFromBrowserTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (!tz) return null;
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'IN';
    if (tz === 'Europe/London' || tz === 'Europe/Belfast') return 'GB';
    if (tz === 'Asia/Dubai' || tz === 'Asia/Muscat') return 'AE';
    if (tz === 'Asia/Singapore') return 'SG';
    if (tz === 'Europe/Berlin' || tz === 'Europe/Busingen') return 'DE';
    if (tz === 'Europe/Paris') return 'FR';
    if (tz === 'Asia/Tokyo') return 'JP';
    if (tz.startsWith('Australia/')) return 'AU';
    if (
      tz === 'America/Toronto' ||
      tz === 'America/Vancouver' ||
      tz === 'America/Montreal' ||
      tz === 'America/Edmonton' ||
      tz === 'America/Winnipeg' ||
      tz === 'America/Halifax'
    ) {
      return 'CA';
    }
    if (tz.startsWith('America/')) return 'US';
    if (tz.startsWith('Europe/')) return 'DE';
  } catch {}
  return null;
}

export function RegionPricingProvider({ children }) {
  // 1. Check URL query parameter first (?country=US or ?region=GB)
  const getUrlCountryOverride = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParts = window.location.hash.split('?');
      const hashParams = hashParts.length > 1 ? new URLSearchParams(hashParts[1]) : null;
      const param =
        searchParams.get('country') ||
        searchParams.get('region') ||
        (hashParams && (hashParams.get('country') || hashParams.get('region')));
      if (param && /^[a-zA-Z]{2,6}$/.test(param.trim())) {
        return param.trim().toUpperCase();
      }
    } catch {}
    return null;
  };

  // 2. Initialize state from URL override, session manual selection, or cached detected country
  const [currentCountry, setCurrentCountry] = useState(() => {
    const urlCountry = getUrlCountryOverride();
    if (urlCountry) return urlCountry;

    try {
      const sessionManual = sessionStorage.getItem(SESSION_KEY_MANUAL) === 'true';
      const savedManual = localStorage.getItem(STORAGE_KEY_COUNTRY);
      if (sessionManual && savedManual) {
        return savedManual;
      }
      const detectedSession = sessionStorage.getItem(SESSION_KEY_DETECTED);
      if (detectedSession) return detectedSession;
      const tzGuess = inferCountryFromBrowserTimezone();
      if (tzGuess) return tzGuess;
    } catch {}
    return 'IN';
  });

  const [detectedCountry, setDetectedCountry] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY_DETECTED) || inferCountryFromBrowserTimezone() || 'IN';
    } catch {
      return 'IN';
    }
  });

  const [isManualOverride, setIsManualOverride] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY_MANUAL) === 'true';
    } catch {
      return false;
    }
  });

  const [isDetecting, setIsDetecting] = useState(false);

  // Sync active country to storage and broadcast event whenever currentCountry changes
  useEffect(() => {
    try {
      const resolved = resolvePricingRegion(currentCountry);
      localStorage.setItem(STORAGE_KEY_COUNTRY, resolved.regionCode);
      sessionStorage.setItem('oxoo_active_country', resolved.regionCode);
      window.dispatchEvent(
        new CustomEvent('oxoo_region_change', {
          detail: {
            countryCode: resolved.regionCode,
            countryName: resolved.countryName,
            currency: resolved.currency,
            isIndia: resolved.regionCode === 'IN',
            isOutsideIndia: resolved.regionCode !== 'IN'
          }
        })
      );
    } catch {}
  }, [currentCountry]);

  // 3. Auto-detect visitor location on initial website open
  useEffect(() => {
    let isMounted = true;

    async function detectVisitorRegion() {
      const urlOverride = getUrlCountryOverride();
      if (urlOverride) {
        const resolved = resolvePricingRegion(urlOverride);
        setCurrentCountry(resolved.regionCode);
        setDetectedCountry(resolved.regionCode);
        return;
      }

      setIsDetecting(true);
      let foundCountry = null;

      // Tier 1: Backend /api/geo/detect (checks CDN headers & server IP lookup)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2200);
        const res = await fetch(`${API_URL}/api/geo/detect`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (
            data?.countryCode &&
            data.source &&
            data.source !== 'default' &&
            data.source !== 'fallback-error'
          ) {
            foundCountry = String(data.countryCode).trim().toUpperCase();
          }
        }
      } catch {}

      // Tier 2: Direct Client-Browser Geo-IP check (ensures client's own IP is used even when backend is local or unproxied)
      if (!foundCountry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const clientGeoRes = await fetch('https://api.country.is/', {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (clientGeoRes.ok) {
            const clientGeoData = await clientGeoRes.json();
            if (clientGeoData?.country && /^[A-Za-z]{2}$/.test(clientGeoData.country)) {
              foundCountry = clientGeoData.country.toUpperCase();
            }
          }
        } catch {}
      }

      // Tier 3: Browser Timezone inference fallback
      if (!foundCountry) {
        foundCountry = inferCountryFromBrowserTimezone() || 'IN';
      }

      if (isMounted && foundCountry) {
        const resolved = resolvePricingRegion(foundCountry);
        const code = resolved.regionCode;
        setDetectedCountry(code);
        try {
          sessionStorage.setItem(SESSION_KEY_DETECTED, code);
        } catch {}

        // Automatically set location to client's detected country unless manually overridden in this session
        const manualInSession = sessionStorage.getItem(SESSION_KEY_MANUAL) === 'true';
        if (!manualInSession) {
          setCurrentCountry(code);
          try {
            localStorage.setItem(STORAGE_KEY_COUNTRY, code);
          } catch {}
        }
      }

      if (isMounted) {
        setIsDetecting(false);
      }
    }

    detectVisitorRegion();
    return () => {
      isMounted = false;
    };
  }, []);

  // 4. Manual country switcher handler (when visitor switches country in header)
  const handleSelectCountry = (countryCode, isManual = true) => {
    const resolved = resolvePricingRegion(countryCode);
    const code = resolved.regionCode;
    setCurrentCountry(code);
    setIsManualOverride(isManual);
    try {
      localStorage.setItem(STORAGE_KEY_COUNTRY, code);
      localStorage.setItem(STORAGE_KEY_OVERRIDE, isManual ? 'true' : 'false');
      sessionStorage.setItem(SESSION_KEY_MANUAL, isManual ? 'true' : 'false');
    } catch {}
  };

  // 5. Reset to auto-detected location
  const handleResetToDetected = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_OVERRIDE);
      sessionStorage.removeItem(SESSION_KEY_MANUAL);
    } catch {}
    setIsManualOverride(false);
    setCurrentCountry(detectedCountry || 'IN');
  };

  const currentRegion = useMemo(() => resolvePricingRegion(currentCountry), [currentCountry]);
  const detectedRegion = useMemo(() => resolvePricingRegion(detectedCountry), [detectedCountry]);

  const value = useMemo(() => ({
    currentCountry: currentRegion.regionCode,
    currentRegion,
    detectedCountry: detectedRegion.regionCode,
    detectedRegion,
    isManualOverride,
    isDetecting,
    isIndia: currentRegion.regionCode === 'IN',
    isOutsideIndia: currentRegion.regionCode !== 'IN',
    selectableRegions: SELECTABLE_REGIONS,
    allRegions: REGIONAL_PRICING,
    setCountry: handleSelectCountry,
    resetToDetected: handleResetToDetected,
    formatPrice: (amount, opts) => formatRegionalPrice(amount, currentRegion, opts)
  }), [currentRegion, detectedRegion, isManualOverride, isDetecting]);

  return (
    <RegionPricingContext.Provider value={value}>
      {children}
    </RegionPricingContext.Provider>
  );
}

export function useRegionPricing() {
  const ctx = useContext(RegionPricingContext);
  if (!ctx) {
    const fallbackRegion = REGIONAL_PRICING.IN;
    return {
      currentCountry: 'IN',
      currentRegion: fallbackRegion,
      detectedCountry: 'IN',
      detectedRegion: fallbackRegion,
      isManualOverride: false,
      isDetecting: false,
      isIndia: true,
      isOutsideIndia: false,
      selectableRegions: SELECTABLE_REGIONS,
      allRegions: REGIONAL_PRICING,
      setCountry: () => {},
      resetToDetected: () => {},
      formatPrice: (amount, opts) => formatRegionalPrice(amount, fallbackRegion, opts)
    };
  }
  return ctx;
}
