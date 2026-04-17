import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Region = 'IN' | 'INTL';
export type Currency = 'INR' | 'USD';

interface RegionContextType {
  region: Region | null;
  currency: Currency;
  setRegion: (r: Region) => void;
  formatCurrency: (n: number) => string;
  needsPicker: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const STORAGE_KEY = 'user_region';

export const RegionProvider = ({ children }: { children: React.ReactNode }) => {
  const [region, setRegionState] = useState<Region | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'IN' || stored === 'INTL' ? stored : null;
  });

  useEffect(() => {
    if (region) localStorage.setItem(STORAGE_KEY, region);
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
    <RegionContext.Provider value={{ region, currency, setRegion, formatCurrency, needsPicker: region === null }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within RegionProvider');
  return ctx;
};
