import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, MessageCircle, BarChart3, Crown, Download, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/reminders', icon: MessageCircle, label: 'Reminders', pro: true },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', pro: true },
  { to: '/pricing', icon: Crown, label: 'Pricing' },
  { to: '/install', icon: Download, label: 'Install App' },
];

const AppSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { isPro } = useSubscription();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card min-h-screen p-4 gap-1">
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg text-foreground">InvoiceFlow</span>
        {isPro && (
          <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">PRO</span>
        )}
      </div>
      {links.map(({ to, icon: Icon, label, pro }) => {
        const active = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {pro && !isPro && (
              <Crown className="w-3 h-3 ml-auto text-primary/50" />
            )}
          </NavLink>
        );
      })}
      <div className="mt-auto pt-4 border-t border-border">
        <p className="px-3 text-xs text-muted-foreground truncate mb-2">{user?.email}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
