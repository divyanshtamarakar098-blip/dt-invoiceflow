import { useState } from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';
import { useInvoices } from '@/context/InvoiceContext';
import { getInvoiceTotal, InvoiceStatus } from '@/types/invoice';
import StatusBadge from '@/components/StatusBadge';
import InvoiceFormDialog from '@/components/InvoiceFormDialog';
import InvoiceDetailDialog from '@/components/InvoiceDetailDialog';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

const FREE_INVOICE_LIMIT = 5;

const filters: { label: string; value: InvoiceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
];

const Invoices = () => {
  const { invoices, deleteInvoice } = useInvoices();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<string | null>(null);

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);
  const atLimit = !isPro && invoices.length >= FREE_INVOICE_LIMIT;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {invoices.length} total invoices
            {!isPro && ` · ${FREE_INVOICE_LIMIT - invoices.length > 0 ? FREE_INVOICE_LIMIT - invoices.length : 0} remaining on free plan`}
          </p>
        </div>
        {atLimit ? (
          <Button onClick={() => navigate('/pricing')} variant="outline" className="gap-2">
            Upgrade for more
          </Button>
        ) : (
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl divide-y divide-border">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No invoices found</p>
        )}
        {filtered.map(inv => (
          <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{inv.clientName}</p>
              <p className="text-xs text-muted-foreground">{inv.invoiceNumber} · Due {inv.dueDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={inv.status} />
              <span className="text-sm font-semibold text-foreground min-w-[80px] text-right">
                {fmt(getInvoiceTotal(inv.items))}
              </span>
              <button onClick={() => setViewInvoice(inv.id)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <InvoiceFormDialog open={formOpen} onOpenChange={setFormOpen} />
      {viewInvoice && (
        <InvoiceDetailDialog
          invoiceId={viewInvoice}
          open={!!viewInvoice}
          onOpenChange={(open) => { if (!open) setViewInvoice(null); }}
        />
      )}
    </div>
  );
};

export default Invoices;
