import React from 'react';
import { ClipboardList, CheckCircle2, HelpCircle } from 'lucide-react';

interface InternalTestingProtocolCardProps {
  approved: boolean;
  onToggleApproved: (val: boolean) => void;
}

const STEPS = [
  'Confirmar QA Score >= 95%.',
  'Confirmar Packaging Score >= 95%.',
  'Confirmar Store Readiness >= 90%.',
  'Confirmar Mobile UX Re-Lock activo.',
  'Generar AAB release manualmente en Android Studio.',
  'Mantener keystore fuera del repositorio.',
  'Crear release en track Internal Testing de Play Console.',
  'Cargar AAB manualmente.',
  'Agregar testers internos.',
  'Compartir enlace de prueba.',
  'Recopilar feedback.',
  'Cerrar RC o volver a Needs Fixes.'
];

export default function InternalTestingProtocolCard({
  approved,
  onToggleApproved
}: InternalTestingProtocolCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-[#090d19]/90 border border-slate-800 font-sans text-left space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Protocolo de Prueba Interna Android</h4>
            <p className="text-[10px] text-slate-400">Guía operativa paso a paso</p>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-slate-800/50 flex gap-2">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          Este panel prepara el proceso. La carga real del AAB y la gestión de testers se realizan manualmente en Play Console.
        </p>
      </div>

      {/* Steps list */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-[10px] font-mono">
        {STEPS.map((step, idx) => (
          <div key={idx} className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/40 flex items-start gap-2 text-slate-300">
            <span className="text-cyan-500 font-bold">{(idx + 1).toString().padStart(2, '0')}.</span>
            <span className="leading-tight">{step}</span>
          </div>
        ))}
      </div>

      {/* Confirmation toggle */}
      <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center gap-3">
        <span className="text-[10px] text-slate-400 font-mono">Aprobación del Protocolo de Testing:</span>
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
              <CheckCircle2 className="w-3.5 h-3.5" /> PROTOCOLO APROBADO
            </>
          ) : (
            'APROBAR PROTOCOLO'
          )}
        </button>
      </div>
    </div>
  );
}
