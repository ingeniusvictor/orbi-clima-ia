import React from 'react';
import { QaReleaseState } from '../services/qaStateService';
import { getQaScoreStats } from '../utils/qaScoreEngine';
import { downloadQaCertificate } from '../services/qaExportService';
import { ShieldCheck, Award, FileText, CheckCircle, AlertOctagon, Download } from 'lucide-react';

interface QaReleaseCertificateProps {
  state: QaReleaseState;
}

export default function QaReleaseCertificate({ state }: QaReleaseCertificateProps) {
  const stats = getQaScoreStats(state);

  // Conditions for certification
  const hasHighPref = stats.score >= 95;
  const noOpenCriticalBugs = stats.criticalBugsCount === 0;
  const noFailedTests = stats.failedCount === 0;

  const isEligible = hasHighPref && noOpenCriticalBugs && noFailedTests;

  const handleExport = () => {
    downloadQaCertificate(state);
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#050912] border border-slate-800 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <Award className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Certificado de Lanzamiento</h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">CERTIFICADO LOCAL DE RELEASE CANDIDATE</p>
        </div>
      </div>

      {isEligible ? (
        <div className="p-6 rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/[0.02] flex flex-col gap-4 text-center items-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />

          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-emerald-400 font-sans tracking-tight">Candidato Certificado</h4>
            <span className="text-[10px] font-mono text-slate-400 uppercase">STATUS: CANDIDATE READY</span>
          </div>

          {/* Certificate Content */}
          <div className="w-full text-left p-4 rounded-lg bg-black/40 border border-slate-900 text-xs font-sans text-slate-300 space-y-3 leading-relaxed max-w-lg">
            <p className="font-bold text-slate-200 text-center border-b border-slate-900 pb-2 mb-1">
              ORBI Clima IA — Release Candidate QA Certificate
            </p>
            <div className="grid grid-cols-2 gap-y-1.5 text-[11px] font-sans">
              <span className="text-slate-500 font-mono">ESTADO:</span>
              <span className="text-emerald-400 font-bold">Candidate Ready</span>

              <span className="text-slate-500 font-mono">VERSIÓN CANDIDATA:</span>
              <span className="text-slate-300 font-semibold">{state.versionName}</span>

              <span className="text-slate-500 font-mono">VALIDACIÓN:</span>
              <span className="text-slate-300">QA interno local</span>

              <span className="text-slate-500 font-mono">DIRECTIVA HSE:</span>
              <span className="text-emerald-400">Preservada e Integrada</span>

              <span className="text-slate-500 font-mono">PRIVACIDAD LOCAL:</span>
              <span className="text-emerald-400">Verificada</span>

              <span className="text-slate-500 font-mono">WIDGETS ANDROID:</span>
              <span className="text-emerald-400">Verificados</span>

              <span className="text-slate-500 font-mono">NOTIFICACIONES:</span>
              <span className="text-emerald-400">Verificadas</span>

              <span className="text-slate-500 font-mono">STORE READINESS:</span>
              <span className="text-emerald-400">Verificado</span>
            </div>
            <p className="text-[10px] text-slate-500 italic text-center border-t border-slate-900 pt-2.5 mt-2 font-mono">
              Este certificado corresponde a una validación técnica interna previa al empaquetado Android final.
            </p>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full max-w-xs py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/20 hover:scale-[1.01] active:scale-95 mt-2"
          >
            <Download className="w-4 h-4" /> Exportar Certificado (.MD)
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col gap-4 text-center items-center">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full animate-pulse">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-400 font-sans uppercase tracking-wider">Certificación Bloqueada</h4>
            <p className="text-[11px] text-slate-400 max-w-md font-sans leading-relaxed">
              El release candidate actual no cumple con las condiciones mínimas necesarias para emitir el certificado local de producción.
            </p>
          </div>

          {/* List of blocking elements */}
          <div className="w-full text-left p-3.5 rounded-lg bg-[#060a12] border border-slate-900 text-[11px] font-sans space-y-2 max-w-md">
            <span className="font-bold text-slate-400 block mb-1.5 uppercase font-mono text-[9px] tracking-wide">PUNTOS PENDIENTES DE RESOLUCIÓN:</span>
            
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${hasHighPref ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className={hasHighPref ? 'text-slate-400' : 'text-slate-200 font-semibold'}>
                QA Score actual de {stats.score}% {hasHighPref ? 'cumple con el 95%' : '(requiere mínimo 95%)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${noFailedTests ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className={noFailedTests ? 'text-slate-400' : 'text-slate-200 font-semibold'}>
                {noFailedTests ? 'Cero pruebas fallidas' : `Existen ${stats.failedCount} pruebas fallidas activas`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${noOpenCriticalBugs ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className={noOpenCriticalBugs ? 'text-slate-400' : 'text-slate-200 font-semibold'}>
                {noOpenCriticalBugs ? 'Cero bugs críticos abiertos' : `Existen ${stats.criticalBugsCount} bugs críticos abiertos`}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-sans italic leading-relaxed">
            Corrige los errores y marca las pruebas pasadas en el panel superior para habilitar la certificación.
          </p>
        </div>
      )}
    </div>
  );
}
