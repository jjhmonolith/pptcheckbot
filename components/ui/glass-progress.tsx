'use client';

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
        <div className="flex items-center justify-between text-sm text-gray-700">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      
      <div className={cn(
        'bg-gray-200 rounded-full overflow-hidden',
        sizes[size]
      )}>
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}