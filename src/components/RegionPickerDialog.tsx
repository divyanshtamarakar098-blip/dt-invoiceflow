import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRegion } from '@/context/RegionContext';
import { Globe } from 'lucide-react';

const RegionPickerDialog = () => {
  const { needsPicker, setRegion } = useRegion();

  return (
    <Dialog open={needsPicker}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Where are you based?</DialogTitle>
          <DialogDescription className="text-center">
            Choose your region so we show prices in the right currency. You only need to do this once.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-1"
            onClick={() => setRegion('IN')}
          >
            <span className="text-2xl">🇮🇳</span>
            <span className="font-semibold">India</span>
            <span className="text-xs text-muted-foreground">Show prices in ₹ INR</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-1"
            onClick={() => setRegion('INTL')}
          >
            <span className="text-2xl">🌍</span>
            <span className="font-semibold">Outside India</span>
            <span className="text-xs text-muted-foreground">Show prices in $ USD</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegionPickerDialog;
