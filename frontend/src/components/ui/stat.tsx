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
  // Severity-inspired indicator colors (up is bad/red in threat land, down is good/green)
  const trendClass = trend === 'up' ? 'text-severity-critical bg-severity-critical/10 border border-severity-critical/20' :
                    trend === 'down' ? 'text-severity-low bg-severity-low/10 border border-severity-low/20' :
                    'text-zinc-400 bg-zinc-800/30 border border-zinc-700/20';

  const trendIcon = trend === 'up' ? '▲' :
                   trend === 'down' ? '▼' :
                   '■';

  return (
    <div className="flex flex-col justify-between p-4 bg-panel/30 border border-panel-border/30 rounded-lg hover:border-panel-border transition-all duration-300">
      <div className="space-y-1">
        <h4 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">{title}</h4>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-semibold font-mono text-zinc-100 tracking-tight">{value}</div>
          {trend !== 'neutral' && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${trendClass}`}>
              <span className="mr-0.5 text-[8px]">{trendIcon}</span>
              {trendValue}
            </span>
          )}
        </div>
      </div>
      {(description || children) && (
        <div className="mt-2 pt-2 border-t border-panel-border/20 flex flex-col space-y-1">
          {description && (
            <p className="text-[11px] text-zinc-400 font-mono leading-none">{description}</p>
          )}
          {children}
        </div>
      )}
    </div>
  );
};

Stat.displayName = 'Stat';