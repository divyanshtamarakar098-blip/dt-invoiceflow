import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, MessageCircle } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/reminders', icon: MessageCircle, label: 'Remind' },
];

const MobileNav = () => {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-50">
      {links.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNav;
