'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GlassProgress({ 
  value, 
  max = 100, 
  className, 
  showPercentage = true, 
  label,
  size = 'md' 
}: GlassProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm text-white/90">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      
      <div className={cn(
        'glass-subtle rounded-full overflow-hidden',
        sizes[size]
      )}>
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}