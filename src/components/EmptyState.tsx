import type { ReactNode } from 'react';
import { Card } from './ui/Card';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <Card className="flex flex-col items-center justify-center text-center py-12">
      {icon && (
        <div className="w-16 h-16 bg-pastel-lavender rounded-2xl flex items-center justify-center text-theme-muted mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-theme-text">{title}</h3>
      {description && <p className="text-theme-muted mt-2 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
};
