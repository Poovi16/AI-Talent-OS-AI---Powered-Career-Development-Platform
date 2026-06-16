// e:/AI Talent OS/src/components/GlassCard/GlassCard.tsx
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hoverEffect = false 
}) => {
  return (
    <div 
      className={`glass-panel p-6 ${hoverEffect ? 'glass-panel-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
