import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  onClick?: () => void;
}

export const StatCard = ({ icon: Icon, label, value, subtext, onClick }: StatCardProps) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`
        bg-[#181818] p-6 rounded-lg border border-[#282828]
        ${onClick ? 'hover:bg-[#282828] transition-colors cursor-pointer' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-[#1db954]/10 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#1db954]" />
        </div>
      </div>
      <div className="text-sm text-[#b3b3b3] mb-1">{label}</div>
      <div className="text-3xl text-white mb-1">{value}</div>
      {subtext && <div className="text-xs text-[#535353]">{subtext}</div>}
    </Component>
  );
};
