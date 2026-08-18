import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card = ({ className = '', children, onClick }: CardProps) => {
  return (
    <div className={`bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 p-6 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

Card.displayName = 'Card';
