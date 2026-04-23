import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, MessageCircle, BarChart3, Download, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRegion } from '@/context/RegionContext';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/reminders', icon: MessageCircle, label: 'Reminders' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/install', icon: Download, label: 'Install App' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings' },
];

const AppSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { country } = useRegion();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar min-h-screen p-4 gap-1 sticky top-0">
      <div className="flex items-center gap-3 px-3 py-4 mb-2">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-glow border border-white/10">
          <img src="/logo.png" alt="InvoiceFlow Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-base text-foreground tracking-tight">InvoiceFlow</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Pro Suite</span>
        </div>
      </div>

      <div className="h-px bg-sidebar-border mb-2" />

      {links.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
            }`}
          >
            {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full gradient-primary" />}
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        );
      })}

      <div className="mt-auto pt-4 border-t border-sidebar-border space-y-2">
        <div className="px-3 py-2 rounded-xl bg-sidebar-accent/40 flex items-center gap-2">
          <span className="text-base">{country.flag}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">{user?.email ?? 'Guest'}</p>
            <p className="text-[10px] text-muted-foreground">{country.currency} · {country.name}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
