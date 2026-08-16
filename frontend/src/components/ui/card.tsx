import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ className = '', children }: CardProps) => {
  return (
    <div className={`bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 p-6 ${className}`}>
      {children}
    </div>
  );
};

Card.displayName = 'Card';