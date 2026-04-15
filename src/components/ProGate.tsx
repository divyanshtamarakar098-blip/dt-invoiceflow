import { useSubscription } from '@/context/SubscriptionContext';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  feature?: string;
}

const ProGate = ({ children, feature = 'This feature' }: Props) => {
  const { isPro, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) return null;

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 p-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Pro Feature</h2>
          <p className="text-muted-foreground mt-1">{feature} is available on the Pro plan.</p>
        </div>
        <Button onClick={() => navigate('/pricing')}>Upgrade to Pro</Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProGate;
