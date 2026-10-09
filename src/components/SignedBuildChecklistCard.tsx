import React from 'react';
import { PackagingChecklistItem } from '../utils/androidPackagingChecklist';
import { CheckCircle2, Key, ShieldAlert } from 'lucide-react';

interface SignedBuildChecklistCardProps {
  items: PackagingChecklistItem[];
  onToggle: (id: string) => void;
}

export default function SignedBuildChecklistCard({ items, onToggle }: SignedBuildChecklistCardProps) {
  const signingItems = items.filter(i => i.category === 'signing');
  const completed = signingItems.filter(i => i.completed).length;

  return (
    <div className="p-6 rounded-2xl bg-[#0a1122]/40 border border-white/5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Signed Build Checklist</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">GUÍA DE SEGURIDAD PARA LLAVES DE FIRMA</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
          {completed}/{signingItems.length} OK
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-2.5">
        <ShieldAlert className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-bold text-amber-400 font-sans">Advertencia Crítica de Seguridad</h4>
          <p className="text-[9px] text-amber-400/80 font-sans leading-relaxed">
            Nunca subas el keystore (.jks) ni contraseñas al repositorio. Sin el keystore correcto no podrás actualizar la misma app si administras la firma fuera de Play App Signing.
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {signingItems.map(item => (
          <div
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#060a12]/50 border border-white/5 hover:border-amber-500/20 transition-all cursor-pointer group"
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
