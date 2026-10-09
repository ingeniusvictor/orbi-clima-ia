import React, { useState } from 'react';
import { PackagingChecklistItem } from '../utils/androidPackagingChecklist';
import { CheckCircle2, Globe, Copy, Check, Info } from 'lucide-react';

interface PlayConsolePreflightCardProps {
  items: PackagingChecklistItem[];
  onToggle: (id: string) => void;
}

export default function PlayConsolePreflightCard({ items, onToggle }: PlayConsolePreflightCardProps) {
  const preflightItems = items.filter(i => i.category === 'preflight');
  const completed = preflightItems.filter(i => i.completed).length;
  const [copied, setCopied] = useState(false);

  const releaseNotes = `Primera versión candidata de ORBI Clima IA.

Incluye:
- Pronóstico climático en vivo.
- Perfil Persona.
- Perfil Técnico Terreno.
- ORBI SkyCore™ Risk Engine.
- Alertas inteligentes.
- Widgets Android ORBI SkyOrb™.
- Notificaciones locales.
- Horarios silenciosos.
- Preferencias y memoria local.
- Privacidad local sin cuenta ni backend.`;

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(releaseNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0a1122]/40 border border-white/5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Play Console Preflight</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ESTADO EN PLAY STORE Y CANAL DE PRUEBAS</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 border border-teal-500/25 px-2 py-0.5 rounded-full">
          {completed}/{preflightItems.length} OK
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/10 flex gap-2.5 items-start text-xs text-teal-300">
        <Info className="w-4.5 h-4.5 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold uppercase tracking-wide text-[10px]">Estado de Lanzamiento</span>
          <p className="text-[10px] leading-relaxed text-teal-400/80">
            El pre-vuelo configura la app en estado <span className="font-bold text-teal-300 font-mono">Ready for Internal Testing Upload</span>. No publicar la aplicación de manera pública en producción hasta completar este track.
          </p>
        </div>
      </div>

      {/* Release Notes Draft sub-card */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-sans">Borrador de Notas de Lanzamiento (ES)</h4>
          <button
            onClick={handleCopyNotes}
            className="flex items-center gap-1 px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/20 hover:border-teal-500/30 text-teal-400 text-[10px] rounded-lg font-bold transition-all cursor-pointer font-sans active:scale-95"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado' : 'Copiar Notas'}
          </button>
        </div>
        
        <pre className="text-[10px] font-mono text-slate-400 whitespace-pre-wrap leading-relaxed bg-[#050811] p-3 rounded-lg border border-slate-950 max-h-40 overflow-y-auto">
          {releaseNotes}
        </pre>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase font-sans tracking-wide block">REQUISITOS DE PRE-VUELO</span>
        
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {preflightItems.map(item => (
            <div
              key={item.id}
              onClick={() => onToggle(item.id)}
              className="flex items-start gap-3 p-3 rounded-xl bg-[#060a12]/50 border border-white/5 hover:border-teal-500/20 transition-all cursor-pointer group"
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
    </div>
  );
}
