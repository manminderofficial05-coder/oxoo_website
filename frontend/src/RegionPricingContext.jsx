import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { REGIONAL_PRICING, SELECTABLE_REGIONS, resolvePricingRegion, formatRegionalCurrency } from './pricingConfig';

const RegionPricingContext = createContext(null);

export function RegionPricingProvider({ children }) {
  // 1. Initial State: Read saved manual preference or fallback to 'IN' synchronously
  const [selectedCountry, setSelectedCountry] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oxoo_selected_country');
      if (saved) return saved.toUpperCase();
    }
    return 'IN';
  });

  const [isManualOverride, setIsManualOverride] = useState(() => {
    if (typeof window !== 'undefined') {
      return Boolean(localStorage.getItem('oxoo_selected_country'));
    }
    return false;
  });

  const [detectedCountry, setDetectedCountry] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('oxoo_detected_country');
      if (cached) return cached.toUpperCase();
    }
    return 'IN';
  });

  const [isLoadingGeo, setIsLoadingGeo] = useState(true);

  // 2. Authoritative Regional Pricing object
  const currentRegion = resolvePricingRegion(selectedCountry);
  const detectedRegion = resolvePricingRegion(detectedCountry);

  // 3. Background Geolocation Detection
  useEffect(() => {
    let isMounted = true;
    const detectLocation = async () => {
      try {
        const res = await fetch('/api/geo/detect');
        if (!res.ok) throw new Error('Geo detection HTTP error');
        const data = await res.json();
        if (isMounted && data && data.countryCode) {
          const detected = data.countryCode.toUpperCase();
          setDetectedCountry(detected);
          sessionStorage.setItem('oxoo_detected_country', detected);

          // If visitor has NO manual selection saved in localStorage, preselect detected country!
          const savedManual = localStorage.getItem('oxoo_selected_country');
          if (!savedManual) {
            setSelectedCountry(detected);
            setIsManualOverride(false);
          }
        }
      } catch (err) {
        console.warn('[GeoDetect] Could not detect client location, using fallback:', err.message);
      } finally {
        if (isMounted) setIsLoadingGeo(false);
      }
    };

    detectLocation();
    return () => { isMounted = false; };
  }, []);

  // 4. Change country manually
  const setCountry = useCallback((code, isManual = true) => {
    const norm = String(code || 'IN').toUpperCase();
    setSelectedCountry(norm);
    if (isManual) {
      localStorage.setItem('oxoo_selected_country', norm);
      setIsManualOverride(true);
    } else {
      localStorage.removeItem('oxoo_selected_country');
      setIsManualOverride(false);
    }
    window.dispatchEvent(new CustomEvent('oxoo_region_change', { detail: { country: norm } }));
  }, []);

  // 5. Reset to detected country
  const resetToDetected = useCallback(() => {
    localStorage.removeItem('oxoo_selected_country');
    setIsManualOverride(false);
    setSelectedCountry(detectedCountry);
    window.dispatchEvent(new CustomEvent('oxoo_region_change', { detail: { country: detectedCountry } }));
  }, [detectedCountry]);

  // 6. Number formatting helper
  const formatPrice = useCallback((amount) => {
    return formatRegionalCurrency(amount, currentRegion.regionCode);
  }, [currentRegion.regionCode]);

  const value = {
    currentCountry: selectedCountry,
    currentRegion,
    detectedCountry,
    detectedRegion,
    isManualOverride,
    isLoadingGeo,
    selectableRegions: SELECTABLE_REGIONS,
    setCountry,
    resetToDetected,
    formatPrice
  };

  return (
    <RegionPricingContext.Provider value={value}>
      {children}
    </RegionPricingContext.Provider>
  );
}

export function useRegionPricing() {
  const context = useContext(RegionPricingContext);
  if (!context) {
    throw new Error('useRegionPricing must be used within a RegionPricingProvider');
  }
  return context;
}
