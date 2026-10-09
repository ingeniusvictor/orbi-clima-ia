import React from 'react';
import { PackagingChecklistItem } from '../utils/androidPackagingChecklist';
import { CheckCircle2, Image, AlertCircle } from 'lucide-react';

interface AppIconAssetChecklistCardProps {
  items: PackagingChecklistItem[];
  onToggle: (id: string) => void;
}

export default function AppIconAssetChecklistCard({ items, onToggle }: AppIconAssetChecklistCardProps) {
  const assetItems = items.filter(i => i.category === 'assets');
  const completed = assetItems.filter(i => i.completed).length;

  return (
    <div className="p-6 rounded-2xl bg-[#0a1122]/40 border border-white/5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">App Icon & Asset Checklist</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ESTADO VISUAL Y MULTIMEDIA DEL RC</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2 py-0.5 rounded-full">
          {completed}/{assetItems.length} OK
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-pink-500/5 border border-pink-500/10 space-y-1 text-[10px] text-pink-300">
        <span className="font-bold uppercase tracking-wide">Pauta de Icono Adaptativo</span>
        <p className="leading-relaxed">
          El icono principal debe diferenciarse de aplicaciones comunes de clima, verse nítido tanto en fondos claros como oscuros y respetar el margen seguro del 18% para no ser recortado.
        </p>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {assetItems.map(item => (
          <div
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#060a12]/50 border border-white/5 hover:border-pink-500/20 transition-all cursor-pointer group"
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
