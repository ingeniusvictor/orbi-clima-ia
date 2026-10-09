import React, { useState } from 'react';
import { FileText, Copy, Check, CheckCircle } from 'lucide-react';

interface ReleaseNotesFinalCardProps {
  approved: boolean;
  onToggleApproved: (val: boolean) => void;
}

const RELEASE_NOTES_TEXT = `ORBI Clima IA — Internal Testing RC1

Primera versión candidata para prueba interna.

Incluye:
- Pronóstico climático mediante Open-Meteo.
- Perfil Persona.
- Perfil Técnico Terreno.
- ORBI SkyCore™ Risk Engine.
- Alertas inteligentes.
- Notificaciones locales Android.
- Quiet Hours y Frequency Guard.
- Smart Summaries.
- Deferred Alerts.
- Widgets Android ORBI SkyOrb™.
- Preferencias locales.
- Memoria climática local.
- Onboarding Android-first.
- Experiencia móvil optimizada.
- Store Readiness y Privacy Package.
- QA Center interno.
- Android Packaging Readiness.

Notas:
Las recomendaciones técnicas son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno, instrucciones del empleador ni servicios meteorológicos oficiales.`;

export default function ReleaseNotesFinalCard({
  approved,
  onToggleApproved
}: ReleaseNotesFinalCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(RELEASE_NOTES_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 rounded-2xl bg-[#090d19]/90 border border-slate-800 font-sans text-left space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notas de Lanzamiento Finales</h4>
            <p className="text-[10px] text-slate-400">Texto oficial para Play Console y Testers</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] rounded-lg cursor-pointer transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'COPIADO' : 'COPIAR'}
        </button>
      </div>

      {/* Text area */}
      <div className="relative">
        <pre className="p-3 bg-black/40 rounded-xl border border-slate-800/80 text-[10px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-[160px] overflow-y-auto scrollbar-thin">
          {RELEASE_NOTES_TEXT}
        </pre>
      </div>

      {/* Approve Toggle */}
      <div className="pt-2 border-t border-slate-800 flex justify-between items-center gap-3">
        <span className="text-[10px] text-slate-400 font-mono">Verificación y Aprobación de Release Notes:</span>
        <button
          onClick={() => onToggleApproved(!approved)}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
            approved
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          {approved ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" /> NOTES APROBADAS
            </>
          ) : (
            'APROBAR NOTES'
          )}
        </button>
      </div>
    </div>
  );
}
