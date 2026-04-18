import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, Settings as SettingsIcon } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings' },
];

const MobileNav = () => {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-elegant flex z-50 px-2 py-1.5">
      {links.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[11px] font-medium transition-all ${
              active ? 'text-primary-foreground gradient-primary shadow-glow' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNav;
