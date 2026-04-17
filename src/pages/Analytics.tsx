import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useInvoices } from '@/context/InvoiceContext';
import { getInvoiceTotal } from '@/types/invoice';
import StatCard from '@/components/StatCard';
import { TrendingUp, Users, DollarSign, FileText } from 'lucide-react';
import { useRegion } from '@/context/RegionContext';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(48, 96%, 53%)', 'hsl(0, 72%, 51%)'];

const Analytics = () => {
  const { invoices } = useInvoices();
  const { formatCurrency: fmt } = useRegion();

  const stats = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'paid');
    const totalRevenue = paid.reduce((s, i) => s + getInvoiceTotal(i.items), 0);
    const avgInvoice = invoices.length ? invoices.reduce((s, i) => s + getInvoiceTotal(i.items), 0) / invoices.length : 0;
    const uniqueClients = new Set(invoices.map(i => i.clientName)).size;
    return { totalRevenue, avgInvoice, uniqueClients };
  }, [invoices]);

  const statusData = useMemo(() => {
    const counts = { paid: 0, pending: 0, overdue: 0 };
    invoices.forEach(i => counts[i.status]++);
    return [
      { name: 'Paid', value: counts.paid },
      { name: 'Pending', value: counts.pending },
      { name: 'Overdue', value: counts.overdue },
    ];
  }, [invoices]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    invoices.filter(i => i.status === 'paid').forEach(i => {
      const month = i.createdAt.substring(0, 7);
      months[month] = (months[month] || 0) + getInvoiceTotal(i.items);
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue,
      }));
  }, [invoices]);

  const clientData = useMemo(() => {
    const clients: Record<string, number> = {};
    invoices.forEach(i => {
      clients[i.clientName] = (clients[i.clientName] || 0) + getInvoiceTotal(i.items);
    });
    return Object.entries(clients)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));
  }, [invoices]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Insights into your business performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} title="Total Revenue" value={fmt(stats.totalRevenue)} subtitle="From paid invoices" />
        <StatCard icon={TrendingUp} title="Avg Invoice" value={fmt(stats.avgInvoice)} subtitle="Per invoice" />
        <StatCard icon={Users} title="Clients" value={String(stats.uniqueClients)} subtitle="Unique clients" />
        <StatCard icon={FileText} title="Invoices" value={String(invoices.length)} subtitle="Total created" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Monthly Revenue</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                <Tooltip formatter={(value: number) => fmt(value)} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-10">No revenue data yet</p>
          )}
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Invoice Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Top Clients by Revenue</h3>
        {clientData.length > 0 ? (
          <div className="space-y-3">
            {clientData.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{fmt(c.total)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-6">No client data yet</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
