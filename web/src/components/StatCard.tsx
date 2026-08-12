import type { ReactNode } from 'react';
import { Card } from './ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard = ({ title, value, icon, description, trend }: StatCardProps) => {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-theme-muted font-semibold text-sm">{title}</h3>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-pastel-lavender flex items-center justify-center text-theme-text">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <div className="text-3xl font-bold text-theme-text mb-1">{value}</div>
        
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className={`text-xs font-bold ${trend.isPositive ? 'text-brand-primary' : 'text-red-500'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            {description && (
              <span className="text-xs text-theme-muted">{description}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
