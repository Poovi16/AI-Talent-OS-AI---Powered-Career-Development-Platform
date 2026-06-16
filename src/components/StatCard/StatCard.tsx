// e:/AI Talent OS/src/components/StatCard/StatCard.tsx
import React from 'react';
import { GlassCard } from '../GlassCard/GlassCard';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtext?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  subtext,
  iconColor = 'text-brand-indigo'
}) => {
  return (
    <GlassCard hoverEffect={true} className="flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-brand-silver">{label}</p>
          <h3 className="mt-2 text-3xl font-bold font-display tracking-tight text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-white/5 border border-white/10 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      {(trend || subtext) && (
        <div className="mt-4 flex items-center text-xs">
          {trend && (
            <span className={`mr-2 font-semibold ${trend.isPositive ? 'text-brand-success' : 'text-brand-error'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
          {subtext && <span className="text-brand-silver">{subtext}</span>}
        </div>
      )}
    </GlassCard>
  );
};
