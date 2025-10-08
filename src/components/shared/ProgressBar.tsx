import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  barClassName?: string;
  showPercentage?: boolean;
  animated?: boolean;
  color?: 'cyan' | 'magenta' | 'lime' | 'white';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  barClassName = '',
  showPercentage = false,
  animated = false,
  color = 'cyan'
}) => {
  const colorClasses = {
    cyan: 'bg-cyan-500',
    magenta: 'bg-magenta-500',
    lime: 'bg-lime-500',
    white: 'bg-white'
  };

  const animationClass = animated ? 'animate-pulse' : '';

  return (
    <div className={cn('relative w-full h-2 bg-gray-800 rounded-full overflow-hidden', className)}>
      <div
        className={cn(
          'absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out',
          colorClasses[color],
          animationClass,
          barClassName
        )}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
      {showPercentage && (
        <div className="absolute top-2 right-0 text-xs text-gray-400">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;