import { useInvoices } from '@/context/InvoiceContext';
import { getInvoiceTotal, InvoiceStatus } from '@/types/invoice';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

const Payments = () => {
  const { invoices, updateStatus } = useInvoices();

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const sorted = [...invoices].sort((a, b) => {
    const order: Record<InvoiceStatus, number> = { overdue: 0, pending: 1, paid: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payment Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and update payment statuses</p>
      </div>

      <div className="glass-card rounded-xl divide-y divide-border">
        {sorted.map(inv => (
          <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{inv.clientName}</p>
              <p className="text-xs text-muted-foreground">{inv.invoiceNumber} · {fmt(getInvoiceTotal(inv.items))}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={inv.status} />
              {inv.status !== 'paid' && (
                <Button size="sm" variant="ghost" onClick={() => updateStatus(inv.id, 'paid')} className="text-success hover:bg-success/10 gap-1">
                  <CheckCircle className="w-4 h-4" /> Paid
                </Button>
              )}
              {inv.status === 'paid' && (
                <Button size="sm" variant="ghost" onClick={() => updateStatus(inv.id, 'pending')} className="text-muted-foreground hover:bg-accent gap-1">
                  <XCircle className="w-4 h-4" /> Undo
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payments;
