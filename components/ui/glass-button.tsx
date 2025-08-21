'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const variants = {
      primary: [
        'glass-strong text-white',
        'hover:bg-indigo-500/20 hover:border-indigo-300/40',
        'active:bg-indigo-600/30',
        'focus:ring-2 focus:ring-indigo-400/50',
      ].join(' '),
      secondary: [
        'glass text-slate-700',
        'hover:bg-white/30 hover:border-slate-300/50',
        'active:bg-white/40',
        'focus:ring-2 focus:ring-slate-400/40',
      ].join(' '),
      ghost: [
        'glass-subtle text-slate-600',
        'hover:bg-white/20 hover:text-slate-700',
        'active:bg-white/30',
      ].join(' '),
      danger: [
        'glass-strong text-white border-red-400/30',
        'hover:bg-red-500/20 hover:border-red-300/40',
        'active:bg-red-600/30',
        'focus:ring-2 focus:ring-red-400/50',
      ].join(' '),
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
          'transition-all duration-200 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-offset-2 focus:ring-offset-transparent',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {isLoading && (
          <motion.div
            className={cn(
              "w-4 h-4 border-2 rounded-full",
              variant === 'primary' ? 'border-white/30 border-t-white' :
              variant === 'danger' ? 'border-white/30 border-t-white' :
              'border-slate-400/30 border-t-slate-700'
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {children}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

export { GlassButton };