import { useInvoices } from '@/context/InvoiceContext';
import { getInvoiceTotal } from '@/types/invoice';
import StatusBadge from '@/components/StatusBadge';
import { MessageCircle, Send } from 'lucide-react';
import { useRegion } from '@/context/RegionContext';

const Reminders = () => {
  const { invoices } = useInvoices();
  const { formatCurrency: fmt } = useRegion();
  const unpaid = invoices.filter(i => i.status !== 'paid');

  const getWhatsAppUrl = (inv: typeof invoices[0]) => {
    const total = getInvoiceTotal(inv.items);
    return `https://wa.me/${inv.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
      `Hi ${inv.clientName}, this is a friendly reminder regarding invoice ${inv.invoiceNumber} for ${fmt(total)}, due on ${inv.dueDate}. Please let us know if you have any questions. Thank you!`
    )}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">WhatsApp Reminders</h1>
        <p className="text-muted-foreground text-sm mt-1">Send payment reminders via WhatsApp</p>
      </div>

      {unpaid.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <MessageCircle className="w-10 h-10 text-success mx-auto mb-3" />
          <p className="font-medium text-foreground">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No pending or overdue invoices to remind about.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unpaid.map(inv => (
            <div key={inv.id} className="glass-card rounded-xl p-5 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground">{inv.clientName}</p>
                  <StatusBadge status={inv.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {inv.invoiceNumber} · {fmt(getInvoiceTotal(inv.items))} · Due {inv.dueDate}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{inv.clientPhone}</p>
              </div>
              <a href={getWhatsAppUrl(inv)} target="_blank" rel="noopener noreferrer">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-whatsapp text-whatsapp-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                  <Send className="w-4 h-4" /> Send Reminder
                </button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reminders;
