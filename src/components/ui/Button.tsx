import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-[16px] transition-all duration-200 active:scale-95";
  
  const variants = {
    primary: "bg-theme-text text-theme-card hover:bg-black px-6 py-3",
    secondary: "bg-pastel-lavender text-theme-text hover:bg-accent-lavender px-6 py-3",
    outline: "border-2 border-theme-text text-theme-text hover:bg-theme-text hover:text-theme-card px-6 py-3",
    ghost: "bg-transparent text-theme-text hover:bg-theme-surface-hover px-4 py-2"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
