import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card = ({ className = '', children, onClick }: CardProps) => {
  return (
    <div 
      className={`bg-panel backdrop-blur-md rounded-lg border border-panel-border p-5 shadow-2xl transition-all duration-300 ease-out ${
        onClick ? 'cursor-pointer hover:border-cyber-blue/30 hover:bg-panel/80 hover:cyber-glow-blue' : ''
      } ${className}`} 
      onClick={onClick}
    >
      {children}
    </div>
  );
};

Card.displayName = 'Card';

