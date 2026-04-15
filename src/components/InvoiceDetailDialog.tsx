import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInvoices } from '@/context/InvoiceContext';
import { getInvoiceTotal } from '@/types/invoice';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface Props {
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoiceDetailDialog = ({ invoiceId, open, onOpenChange }: Props) => {
  const { invoices, updateStatus } = useInvoices();
  const inv = invoices.find(i => i.id === invoiceId);
  if (!inv) return null;

  const total = getInvoiceTotal(inv.items);
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const whatsappUrl = `https://wa.me/${inv.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hi ${inv.clientName}, this is a reminder regarding invoice ${inv.invoiceNumber} for ${fmt(total)}, due on ${inv.dueDate}. Please let us know if you have any questions.`
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{inv.invoiceNumber}</span>
            <StatusBadge status={inv.status} />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Client</p>
              <p className="font-medium text-foreground">{inv.clientName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium text-foreground">{inv.dueDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{inv.clientPhone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{inv.clientEmail || '—'}</p>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left px-3 py-2 text-secondary-foreground font-medium">Item</th>
                  <th className="text-right px-3 py-2 text-secondary-foreground font-medium">Qty</th>
                  <th className="text-right px-3 py-2 text-secondary-foreground font-medium">Rate</th>
                  <th className="text-right px-3 py-2 text-secondary-foreground font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inv.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 text-foreground">{item.description}</td>
                    <td className="px-3 py-2 text-right text-foreground">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-foreground">{fmt(item.rate)}</td>
                    <td className="px-3 py-2 text-right font-medium text-foreground">{fmt(item.quantity * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between px-3 py-2.5 bg-secondary font-semibold text-sm">
              <span className="text-secondary-foreground">Total</span>
              <span className="text-foreground">{fmt(total)}</span>
            </div>
          </div>

          {inv.notes && (
            <p className="text-sm text-muted-foreground italic">Note: {inv.notes}</p>
          )}

          <div className="flex gap-2 pt-2">
            {inv.status !== 'paid' && (
              <Button onClick={() => updateStatus(inv.id, 'paid')} className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
                Mark as Paid
              </Button>
            )}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full gap-2 border-whatsapp text-whatsapp hover:bg-whatsapp/10">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailDialog;
