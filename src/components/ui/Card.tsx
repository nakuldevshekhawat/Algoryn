import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-theme-card border border-white/50 rounded-4xl p-6 sm:p-8 shadow-softer ${className}`}>
      {children}
    </div>
  );
};
