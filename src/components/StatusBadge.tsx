import { InvoiceStatus } from '@/types/invoice';

const config: Record<InvoiceStatus, { bg: string; text: string; label: string }> = {
  paid: { bg: 'bg-success/10', text: 'text-success', label: 'Paid' },
  pending: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending' },
  overdue: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Overdue' },
};

const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const c = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

export default StatusBadge;
