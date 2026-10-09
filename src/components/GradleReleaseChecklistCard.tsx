import React from 'react';
import { PackagingChecklistItem } from '../utils/androidPackagingChecklist';
import { CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface GradleReleaseChecklistCardProps {
  items: PackagingChecklistItem[];
  onToggle: (id: string) => void;
}

export default function GradleReleaseChecklistCard({ items, onToggle }: GradleReleaseChecklistCardProps) {
  const gradleItems = items.filter(i => i.category === 'gradle');
  const completed = gradleItems.filter(i => i.completed).length;

  return (
    <div className="p-6 rounded-2xl bg-[#0a1122]/40 border border-white/5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Gradle Release Checklist</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">SNC Y AUDITORÍA DE BUILD.GRADLE</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-full">
          {completed}/{gradleItems.length} OK
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1.5 text-xs text-indigo-300">
        <div className="flex items-center gap-1.5 font-sans font-bold text-[10px] uppercase tracking-wider text-indigo-400">
          Target SDK Exigido
        </div>
        <p className="text-[10px] leading-relaxed">
          Google Play exige que las nuevas aplicaciones apunten al menos a <span className="font-bold text-indigo-300 font-mono">targetSdk = 35 (Android 15)</span>.
        </p>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {gradleItems.map(item => (
          <div
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#060a12]/50 border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer group"
          >
            <div className="mt-0.5 shrink-0">
              <CheckCircle2 className={`w-4 h-4 transition-colors ${item.completed ? 'text-emerald-400 fill-emerald-400/10' : 'text-slate-600 group-hover:text-slate-400'}`} />
            </div>
            <div className="space-y-0.5">
              <span className={`text-xs font-sans font-semibold transition-colors ${item.completed ? 'text-slate-300 line-through decoration-slate-600' : 'text-slate-200 group-hover:text-white'}`}>{item.label}</span>
              <p className="text-[10px] text-slate-500 font-sans leading-normal">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
