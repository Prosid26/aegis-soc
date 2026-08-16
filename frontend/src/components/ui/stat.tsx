import React from 'react';

interface StatProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  description?: string;
  children?: React.ReactNode;
}

export const Stat = ({
  title,
  value,
  trend = 'neutral',
  trendValue = 0,
  description,
  children
}: StatProps) => {
  const trendClass = trend === 'up' ? 'text-red-400' :
                    trend === 'down' ? 'text-green-400' :
                    'text-zinc-400';

  const trendIcon = trend === 'up' ? '↑' :
                   trend === 'down' ? '↓' :
                   '-';

  return (
    <div className="text-center space-y-3">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="text-2xl font-bold text-white">{value}</div>
      {trend !== 'neutral' && (
        <div className="flex items-center justify-center space-x-2 text-sm">
          <span className={trendClass}>{trendIcon}</span>
          <span className={trendClass}>{trendValue}</span>
        </div>
      )}
      {description && (
        <p className="text-zinc-400 text-sm">{description}</p>
      )}
      {children}
    </div>
  );
};

Stat.displayName = 'Stat';