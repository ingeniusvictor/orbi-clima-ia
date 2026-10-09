import React from 'react';
import { PackagingChecklistItem } from '../utils/androidPackagingChecklist';
import { CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface AabApkValidationCardProps {
  items: PackagingChecklistItem[];
  onToggle: (id: string) => void;
}

export default function AabApkValidationCard({ items, onToggle }: AabApkValidationCardProps) {
  const validationItems = items.filter(i => i.category === 'validation');
  const completed = validationItems.filter(i => i.completed).length;

  return (
    <div className="p-6 rounded-2xl bg-[#0a1122]/40 border border-white/5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">AAB/APK Validation</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">VERIFICACIONES DE FUNCIONALIDAD EN DISPOSITIVO</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
          {completed}/{validationItems.length} OK
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex gap-2.5 items-start">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
          <span className="font-bold text-slate-200">Recomendación Oficial:</span> Android App Bundle (AAB) es el formato de publicación oficial para Google Play. El APK se utiliza para pruebas manuales o depuración rápida en terminales de campo.
        </p>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {validationItems.map(item => (
          <div
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#060a12]/50 border border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer group"
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
