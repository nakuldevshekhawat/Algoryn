import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Reusable header for top-level pages. */
export function PageHeader({ title, subtitle, badge, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 lg:mb-8 animate-fade-in ${className}`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-display text-text-primary tracking-tight">{title}</h1>
          {badge && <div className="mt-1">{badge}</div>}
        </div>
        {subtitle && (
          <p className="text-sm text-text-secondary max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
