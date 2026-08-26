import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'mint' | 'lavender' | 'peach' | 'pink' | 'yellow' | 'gray';
  className?: string;
}

export const Badge = ({ children, variant = 'gray', className = '' }: BadgeProps) => {
  const variants = {
    mint: "bg-pastel-mint text-brand-primary-dark",
    lavender: "bg-pastel-lavender text-theme-text",
    peach: "bg-pastel-peach text-theme-text",
    pink: "bg-pastel-pink text-theme-text",
    yellow: "bg-pastel-yellow text-theme-text",
    gray: "bg-theme-surface-hover text-theme-muted"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
