import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, MessageCircle, BarChart3, Download, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/reminders', icon: MessageCircle, label: 'Reminders' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/install', icon: Download, label: 'Install App' },
];

const AppSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card min-h-screen p-4 gap-1">
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg text-foreground">InvoiceFlow</span>
      </div>
      {links.map(({ to, icon: Icon, label }) => {
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
          </NavLink>
        );
      })}
      <div className="mt-auto pt-4 border-t border-border">
        <p className="px-3 text-xs text-muted-foreground truncate mb-2">{user?.email ?? 'Guest'}</p>
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
