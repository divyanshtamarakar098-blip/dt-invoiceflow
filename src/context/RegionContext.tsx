import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { COUNTRY_BY_CODE, DEFAULT_COUNTRY, detectCountryCode, type CountryInfo } from '@/lib/countries';

interface RegionContextType {
  country: CountryInfo;
  currency: string;
  setCountry: (code: string) => void;
  formatCurrency: (n: number) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const STORAGE_KEY = 'user_country';

const resolveCountry = (code: string | null): CountryInfo => {
  if (code && COUNTRY_BY_CODE[code]) return COUNTRY_BY_CODE[code];
  return COUNTRY_BY_CODE[detectCountryCode()] ?? DEFAULT_COUNTRY;
};

export const RegionProvider = ({ children }: { children: React.ReactNode }) => {
  const [country, setCountryState] = useState<CountryInfo>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const resolved = resolveCountry(stored);
    if (!stored) localStorage.setItem(STORAGE_KEY, resolved.code);
    return resolved;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, country.code);
  }, [country]);

  const setCountry = useCallback((code: string) => {
    const next = COUNTRY_BY_CODE[code];
    if (next) setCountryState(next);
  }, []);

  const formatCurrency = useCallback(
    (n: number) => {
      try {
        return new Intl.NumberFormat(country.locale, {
          style: 'currency',
          currency: country.currency,
          maximumFractionDigits: 2,
        }).format(n);
      } catch {
        return `${country.currency} ${n.toFixed(2)}`;
      }
    },
    [country]
  );

  return (
    <RegionContext.Provider value={{ country, currency: country.currency, setCountry, formatCurrency }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within RegionProvider');
  return ctx;
};
