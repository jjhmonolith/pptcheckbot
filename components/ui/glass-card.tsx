'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, variant = 'default', hover = false, onClick, animate = true }, ref) => {
    const variants = {
      default: 'glass',
      strong: 'glass-strong',
      subtle: 'glass-subtle',
    };

    const Component = animate ? motion.div : 'div';

    const motionProps = animate
      ? {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.3, ease: 'easeOut' },
          whileHover: hover
            ? {
                scale: 1.02,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                transition: { duration: 0.2 },
              }
            : undefined,
          whileTap: onClick ? { scale: 0.98 } : undefined,
        }
      : {};

    return (
      <Component
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300 ease-out',
          variants[variant],
          hover && 'cursor-pointer hover:shadow-2xl',
          className
        )}
        onClick={onClick}
        {...motionProps}
      >
        {children}
      </Component>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };