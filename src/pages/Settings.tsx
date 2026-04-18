import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRegion, type Region } from '@/context/RegionContext';
import { LogOut, Globe, User } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { region, currency, setRegion } = useRegion();

  const handleRegionChange = (r: Region) => {
    setRegion(r);
    toast.success(`Currency set to ${r === 'IN' ? '₹ INR' : '$ USD'}`);
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
            <Globe className="w-4 h-4" /> Region & currency
          </CardTitle>
          <CardDescription>
            Auto-detected from your device. Change it any time — current: <span className="font-medium text-foreground">{currency}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant={region === 'IN' ? 'default' : 'outline'}
            className="h-auto py-4 flex flex-col items-center gap-1"
            onClick={() => handleRegionChange('IN')}
          >
            <span className="text-2xl">🇮🇳</span>
            <span className="font-semibold">India</span>
            <span className="text-xs opacity-80">₹ INR</span>
          </Button>
          <Button
            variant={region === 'INTL' ? 'default' : 'outline'}
            className="h-auto py-4 flex flex-col items-center gap-1"
            onClick={() => handleRegionChange('INTL')}
          >
            <span className="text-2xl">🌍</span>
            <span className="font-semibold">Outside India</span>
            <span className="text-xs opacity-80">$ USD</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
