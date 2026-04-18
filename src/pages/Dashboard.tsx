import { DollarSign, FileText, Clock, AlertTriangle } from 'lucide-react';
import { useInvoices } from '@/context/InvoiceContext';
import { getInvoiceTotal } from '@/types/invoice';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useRegion } from '@/context/RegionContext';

const Dashboard = () => {
  const { invoices } = useInvoices();
  const navigate = useNavigate();
  const { formatCurrency: fmt } = useRegion();

  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + getInvoiceTotal(i.items), 0);

  const totalPending = invoices
    .filter(i => i.status === 'pending')
    .reduce((s, i) => s + getInvoiceTotal(i.items), 0);

  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const recent = [...invoices].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 text-primary-foreground shadow-elegant">
        <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest opacity-80">Welcome back</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1 tracking-tight">Dashboard</h1>
          <p className="text-sm opacity-90 mt-2 max-w-lg">Track revenue, monitor pending payments, and stay on top of overdue invoices — all in one place.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} title="Total Revenue" value={fmt(totalRevenue)} subtitle="All time" />
        <StatCard icon={Clock} title="Pending" value={fmt(totalPending)} subtitle={`${invoices.filter(i => i.status === 'pending').length} invoices`} iconColor="text-warning" />
        <StatCard icon={AlertTriangle} title="Overdue" value={String(overdueCount)} subtitle="Need attention" iconColor="text-destructive" />
        <StatCard icon={FileText} title="Total Invoices" value={String(invoices.length)} subtitle="All statuses" />
      </div>

      <div className="glass-card rounded-2xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Invoices</h2>
          <button onClick={() => navigate('/invoices')} className="text-sm font-medium text-primary hover:underline">
            View all →
          </button>
        </div>
        <div className="divide-y divide-border">
          {recent.map(inv => (
            <div key={inv.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/invoices')}>
              <div>
                <p className="font-medium text-sm text-foreground">{inv.clientName}</p>
                <p className="text-xs text-muted-foreground">{inv.invoiceNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={inv.status} />
                <span className="text-sm font-semibold text-foreground">{fmt(getInvoiceTotal(inv.items))}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
