import React from 'react';
import { AlertTriangle, CheckCircle, Shield, AlertOctagon } from 'lucide-react';
import { PilotFeedbackItem, PostRcFixItem } from '../services/pilotFeedbackService';

interface FixPriorityMatrixCardProps {
  feedback: PilotFeedbackItem[];
  fixes: PostRcFixItem[];
}

export default function FixPriorityMatrixCard({ feedback, fixes }: FixPriorityMatrixCardProps) {
  // Analyze blocks
  const openP0Fixes = fixes.filter(
    fix => fix.priority === 'p0' && ['open', 'in_progress', 'ready_for_test'].includes(fix.status)
  );

  const openCriticalFeedback = feedback.filter(
    fb => fb.severity === 'critical' && ['new', 'triaged', 'accepted', 'needs_fix'].includes(fb.status)
  );

  const unvalidatedCrashes = feedback.filter(
    fb => fb.description.toLowerCase().includes('crash') && !['validated', 'closed', 'monitoring'].includes(fb.status)
  );

  const isBlocked = openP0Fixes.length > 0 || openCriticalFeedback.length > 0 || unvalidatedCrashes.length > 0;

  return (
    <div className="space-y-4 font-sans text-left">
      {/* 1. Matrix Rules description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] bg-slate-950/20 p-3 rounded-lg border border-slate-800">
        <div>
          <h5 className="font-bold text-slate-300 font-mono uppercase tracking-wider mb-1.5 text-[9px] text-pink-400">Reglas de Priorización</h5>
          <ul className="space-y-1 list-disc list-inside text-slate-400">
            <li><strong className="text-rose-400">P0 (Bloqueante):</strong> Feedback crítico reproducible o falla general.</li>
            <li><strong className="text-amber-400">P1 (Alta prioridad):</strong> Falla de widgets, notificaciones, clima o instalación.</li>
            <li><strong className="text-cyan-400">P2 (Medio):</strong> Problemas de UX o microcopy confuso.</li>
            <li><strong className="text-slate-400">P3 (Menor):</strong> Sugerencias y mejoras cosméticas.</li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-slate-300 font-mono uppercase tracking-wider mb-1.5 text-[9px] text-cyan-400">Compuertas de Cierre</h5>
          <ul className="space-y-1 list-disc list-inside text-slate-400">
            <li>Ningún fix <strong className="text-rose-400">P0</strong> abierto.</li>
            <li>Ninguna observación <strong className="text-rose-400">Crítica</strong> sin validar.</li>
            <li>Ningún reporte con palabra <strong className="text-rose-400">Crash</strong> sin validar.</li>
            <li>Cumplimiento estricto de directivas HSE locales.</li>
          </ul>
        </div>
      </div>

      {/* 2. Evaluated blocks list */}
      <div className="p-3.5 rounded-lg border bg-slate-900/10 border-slate-800">
        <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-cyan-400" /> Evaluación de Compuertas en Tiempo Real
        </h5>

        <div className="space-y-2 text-[10px]">
          {/* P0 Block */}
          <div className="flex items-start justify-between gap-2 p-2 bg-slate-950/40 rounded border border-slate-850">
            <div>
              <p className="font-bold text-slate-200">Parches Críticos Abiertos (P0)</p>
              <p className="text-[9px] text-slate-500">Cada fix con prioridad P0 en curso impide el cierre del parche.</p>
            </div>
            {openP0Fixes.length === 0 ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> PASA
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-mono text-[9px] font-bold">
                <AlertOctagon className="w-3.5 h-3.5" /> BLOQUEA ({openP0Fixes.length})
              </span>
            )}
          </div>

          {/* Critical Feedback Block */}
          <div className="flex items-start justify-between gap-2 p-2 bg-slate-950/40 rounded border border-slate-850">
            <div>
              <p className="font-bold text-slate-200">Feedback Crítico sin Remediación</p>
              <p className="text-[9px] text-slate-500">Reportes de testers de riesgo crítico deben pasar a estado validado/closed.</p>
            </div>
            {openCriticalFeedback.length === 0 ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> PASA
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-mono text-[9px] font-bold">
                <AlertOctagon className="w-3.5 h-3.5" /> BLOQUEA ({openCriticalFeedback.length})
              </span>
            )}
          </div>

          {/* Crashes Block */}
          <div className="flex items-start justify-between gap-2 p-2 bg-slate-950/40 rounded border border-slate-850">
            <div>
              <p className="font-bold text-slate-200">Fallas de Bloqueo General (Crashes)</p>
              <p className="text-[9px] text-slate-500">Cualquier crash reportado en terreno físico debe estar cerrado o en monitoreo justificado.</p>
            </div>
            {unvalidatedCrashes.length === 0 ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> PASA
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-mono text-[9px] font-bold">
                <AlertOctagon className="w-3.5 h-3.5" /> BLOQUEA ({unvalidatedCrashes.length})
              </span>
            )}
          </div>
        </div>
      </div>

      {isBlocked ? (
        <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/25 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h6 className="text-[10px] font-bold text-rose-400 font-mono">ESTADO ACTUAL: BLOQUEADO</h6>
            <p className="text-[9px] text-slate-400 mt-0.5">
              Corrija las observaciones bloqueantes del roster de testers para habilitar la firma del certificado final post-RC.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/25 flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h6 className="text-[10px] font-bold text-emerald-400 font-mono">ESTADO ACTUAL: CONFORMIDAD ALCANZADA</h6>
            <p className="text-[9px] text-slate-400 mt-0.5">
              No hay bloqueos activos. El parche RC1.1 está listo para su firma y posterior liberación de testing final.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
