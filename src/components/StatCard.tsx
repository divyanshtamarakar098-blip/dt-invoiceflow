import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, iconColor }: StatCardProps) => (
  <div className="group relative overflow-hidden glass-card rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant">
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 gradient-mesh pointer-events-none" />
    <div className="relative flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-2 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
      </div>
      <div
        className={`shrink-0 p-2.5 rounded-xl ${
          iconColor ?? 'text-primary-foreground gradient-primary shadow-glow'
        } ${iconColor ? 'bg-accent' : ''}`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export default StatCard;
