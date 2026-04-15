import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, iconColor = 'text-primary' }: StatCardProps) => (
  <div className="glass-card rounded-xl p-5 flex items-start gap-4">
    <div className={`p-2.5 rounded-lg bg-primary/10 ${iconColor}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  </div>
);

export default StatCard;
