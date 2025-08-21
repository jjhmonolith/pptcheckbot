'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'strong';
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, icon, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'glass',
      strong: 'glass-strong',
    };

    return (
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <motion.label 
            className="text-sm font-medium text-slate-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'w-full rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400',
              'border border-slate-300/40 bg-white/80 backdrop-blur-sm',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/60',
              'hover:bg-white/90 hover:border-slate-300/60',
              icon && 'pl-10',
              error && 'border-red-400/50 focus:ring-red-400/50',
              className
            )}
            {...props}
          />
        </div>
        
        {error && (
          <motion.p 
            className="text-sm text-red-400"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export { GlassInput };