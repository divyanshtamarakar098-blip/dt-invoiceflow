import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useRegion } from '@/context/RegionContext';
import { COUNTRIES } from '@/lib/countries';
import { LogOut, Globe, User, Search, Check } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { country, setCountry, formatCurrency } = useRegion();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query]);

  const handlePick = (code: string, name: string, currency: string) => {
    setCountry(code);
    toast.success(`${name} selected — currency: ${currency}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4" /> Account
          </CardTitle>
          <CardDescription>Signed in as</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-medium text-foreground break-all">{user?.email ?? 'Guest'}</p>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="w-4 h-4" /> Country & currency
          </CardTitle>
          <CardDescription>
            Auto-detected from your device. Pick any country to switch currency formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{country.flag}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{country.name}</p>
                <p className="text-xs text-muted-foreground">
                  {country.currency} · sample {formatCurrency(1234.56)}
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or currency…"
              className="pl-9"
            />
          </div>

          <div className="max-h-80 overflow-y-auto rounded-lg border border-border divide-y divide-border">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">No matches.</p>
            )}
            {filtered.map((c) => {
              const active = c.code === country.code;
              return (
                <button
                  key={c.code}
                  onClick={() => handlePick(c.code, c.name, c.currency)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? 'bg-primary/10 text-foreground' : 'hover:bg-accent text-foreground'
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.currency}</span>
                  {active && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
