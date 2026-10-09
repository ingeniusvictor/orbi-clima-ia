import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CompactSectionCardProps {
  title: string;
  subtitle?: string;
  status?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  icon?: React.ReactNode;
}

export default function CompactSectionCard({
  title,
  subtitle,
  status,
  children,
  defaultExpanded = false,
  expanded,
  onToggle,
  icon
}: CompactSectionCardProps) {
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  
  const isExpanded = expanded !== undefined ? expanded : localExpanded;
  const toggle = () => {
    if (onToggle) {
      onToggle(!isExpanded);
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0a1122]/40 overflow-hidden transition-all duration-300">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-sans font-bold text-slate-100 tracking-wider uppercase truncate">{title}</h3>
              {status && (
                <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded tracking-wide shrink-0">
                  {status}
                </span>
              )}
            </div>
            {subtitle && <p className="text-[10px] text-slate-400 font-sans leading-normal truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="text-slate-400 shrink-0 ml-2">
          {isExpanded ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-white/5 p-4 bg-[#050914]/40 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
