import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-accent-blue to-accent-indigo text-white shadow-md hover:shadow-lg hover:brightness-110',
  ghost:
    'glass-subtle text-neutral-700 hover:bg-white/70',
  danger:
    'bg-gradient-to-r from-accent-red to-rose-500 text-white shadow-md hover:shadow-lg hover:brightness-110',
  success:
    'bg-gradient-to-r from-accent-green to-emerald-500 text-white shadow-md hover:shadow-lg hover:brightness-110',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-sm gap-2',
};

export function GlassButton({
  variant = 'ghost',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-xl font-medium
        transition-all duration-200 ease-out cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
