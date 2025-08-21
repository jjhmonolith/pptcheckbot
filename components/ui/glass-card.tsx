'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, variant = 'default', hover = false, onClick }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200 shadow-sm',
      strong: 'bg-white border border-gray-300 shadow-md',
      subtle: 'bg-gray-50 border border-gray-100 shadow-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          variants[variant],
          hover && 'cursor-pointer hover:shadow-lg hover:scale-[1.01]',
          className
        )}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };