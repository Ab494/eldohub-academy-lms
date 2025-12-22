import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'secondary';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'default' 
}) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-medium transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-card-foreground">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              trend.isPositive ? "text-accent" : "text-destructive"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          variant === 'primary' && "gradient-hero",
          variant === 'accent' && "gradient-success",
          variant === 'secondary' && "gradient-dark",
          variant === 'default' && "bg-muted"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            variant === 'default' ? "text-muted-foreground" : "text-primary-foreground"
          )} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
