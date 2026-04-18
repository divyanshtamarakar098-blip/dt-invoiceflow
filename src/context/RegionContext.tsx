import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Region = 'IN' | 'INTL';
export type Currency = 'INR' | 'USD';

interface RegionContextType {
  region: Region;
  currency: Currency;
  setRegion: (r: Region) => void;
  formatCurrency: (n: number) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const STORAGE_KEY = 'user_region';

const detectRegion = (): Region => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.toLowerCase().includes('kolkata') || tz.toLowerCase().includes('calcutta')) return 'IN';
    const langs = [navigator.language, ...(navigator.languages || [])].map((l) => l.toLowerCase());
    if (langs.some((l) => l.includes('-in') || l === 'hi' || l.startsWith('hi-'))) return 'IN';
  } catch {
    // ignore
  }
  return 'INTL';
};

export const RegionProvider = ({ children }: { children: React.ReactNode }) => {
  const [region, setRegionState] = useState<Region>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'IN' || stored === 'INTL') return stored;
    const detected = detectRegion();
    localStorage.setItem(STORAGE_KEY, detected);
    return detected;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, region);
  }, [region]);

  const setRegion = useCallback((r: Region) => setRegionState(r), []);

  const currency: Currency = region === 'IN' ? 'INR' : 'USD';

  const formatCurrency = useCallback(
    (n: number) => {
      if (currency === 'INR') {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
      }
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
    },
    [currency]
  );

  return (
    <RegionContext.Provider value={{ region, currency, setRegion, formatCurrency }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within RegionProvider');
  return ctx;
};
