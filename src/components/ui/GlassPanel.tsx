import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle';
}

const variantClasses = {
  default: 'glass',
  strong: 'glass-strong',
  subtle: 'glass-subtle',
};

export function GlassPanel({ children, className = '', variant = 'default' }: GlassPanelProps) {
  return (
    <div className={`${variantClasses[variant]} rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
