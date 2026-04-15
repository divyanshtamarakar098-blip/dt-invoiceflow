import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/context/SubscriptionContext';

const features = [
  { name: 'Create invoices', free: true, pro: true },
  { name: 'Payment tracking', free: true, pro: true },
  { name: 'Up to 5 invoices', free: true, pro: false },
  { name: 'Unlimited invoices', free: false, pro: true },
  { name: 'WhatsApp reminders', free: false, pro: true },
  { name: 'Analytics dashboard', free: false, pro: true },
  { name: 'Priority support', free: false, pro: true },
];

const Pricing = () => {
  const { isPro } = useSubscription();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">Start free, upgrade when you need more</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free Plan */}
        <div className="glass-card rounded-2xl p-6 space-y-6 border border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Free</h2>
            <div className="mt-2">
              <span className="text-4xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Perfect for getting started</p>
          </div>

          <ul className="space-y-3">
            {features.map(f => (
              <li key={f.name} className="flex items-center gap-2 text-sm">
                {f.free ? (
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={f.free ? 'text-foreground' : 'text-muted-foreground'}>{f.name}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full" disabled>
            {isPro ? 'Free Plan' : 'Current Plan'}
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="glass-card rounded-2xl p-6 space-y-6 border-2 border-primary relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            POPULAR
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Pro</h2>
            <div className="mt-2">
              <span className="text-4xl font-bold text-foreground">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">For growing businesses</p>
          </div>

          <ul className="space-y-3">
            {features.map(f => (
              <li key={f.name} className="flex items-center gap-2 text-sm">
                {f.pro ? (
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={f.pro ? 'text-foreground' : 'text-muted-foreground'}>{f.name}</span>
              </li>
            ))}
          </ul>

          <Button className="w-full" disabled={isPro}>
            {isPro ? 'Current Plan' : 'Upgrade to Pro'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
