import React from 'react';
import { AlertCircle, BrainCircuit, Hourglass } from 'lucide-react';

interface EmptyStateCardProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  iconType?: 'alert' | 'memory' | 'default';
}

export default function EmptyStateCard({ title, message, actionLabel, onAction, iconType = 'default' }: EmptyStateCardProps) {
  const renderIcon = () => {
    switch (iconType) {
      case 'alert':
        return <AlertCircle className="w-8 h-8 text-indigo-400/80" />;
      case 'memory':
        return <BrainCircuit className="w-8 h-8 text-cyan-400/80" />;
      default:
        return <Hourglass className="w-8 h-8 text-slate-400/80" />;
    }
  };

  return (
    <div className="py-8 px-5 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800/80 text-center max-w-md mx-auto flex flex-col items-center gap-3">
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        {renderIcon()}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-200 font-sans">{title}</h4>
        <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">{message}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
