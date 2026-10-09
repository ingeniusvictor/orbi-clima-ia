import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, Award } from 'lucide-react';
import { loadQaState } from '../services/qaStateService';
import { loadPackagingChecklist } from '../utils/androidPackagingChecklist';
import { RcClosureState } from '../services/rcClosureStateService';

interface RcClosureGateCardProps {
  state: RcClosureState;
  onCloseRc: () => void;
  onReopenRc: () => void;
}

export default function RcClosureGateCard({
  state,
  onCloseRc,
  onReopenRc
}: RcClosureGateCardProps) {
  const [qaScore, setQaScore] = useState(0);
  const [criticalBugs, setCriticalBugs] = useState(0);
  const [criticalFailed, setCriticalFailed] = useState(0);
  const [packagingScore, setPackagingScore] = useState(0);
  const [storeScore, setStoreScore] = useState(0);
  const [hasPrivacy, setHasPrivacy] = useState(false);

  useEffect(() => {
    const checkScores = () => {
      // 1. QA
      const qa = loadQaState();
      setQaScore(qa.qaScore);
      setCriticalBugs(qa.bugs.filter(b => b.status === 'open' && b.severity === 'critical').length);
      setCriticalFailed(qa.tests.filter(t => t.status === 'failed' && t.severity === 'critical').length);

      // 2. Packaging
      const pkg = loadPackagingChecklist();
      const pkgComp = pkg.filter(i => i.completed).length;
      setPackagingScore(pkg.length > 0 ? Math.round((pkgComp / pkg.length) * 100) : 0);

      // 3. Store
      const savedStore = localStorage.getItem('orbi_clima_store_checklist_v1');
      if (savedStore) {
        try {
          const storeItems = JSON.parse(savedStore);
          if (Array.isArray(storeItems) && storeItems.length > 0) {
            const completed = storeItems.filter((i: any) => i.completed).length;
            const pct = Math.round((completed / storeItems.length) * 100);
            setStoreScore(pct);
            const privacyCompleted = storeItems.filter((i: any) => i.category === 'privacy').every((i: any) => i.completed);
            setHasPrivacy(privacyCompleted);
          }
        } catch (e) {
          setStoreScore(0);
          setHasPrivacy(false);
        }
      }
    };

    checkScores();
    window.addEventListener('focus', checkScores);
    window.addEventListener('orbi_rc_closure_changed', checkScores);
    return () => {
      window.removeEventListener('focus', checkScores);
      window.removeEventListener('orbi_rc_closure_changed', checkScores);
    };
  }, [state]);

  // Gate validation logic
  const qaPassed = qaScore >= 95 && criticalBugs === 0 && criticalFailed === 0;
  const packagingPassed = packagingScore >= 95;
  const storePassed = storeScore >= 90;
  const privacyPassed = hasPrivacy || storeScore >= 90; // Fallback to storeScore if individual category isn't fully separated
  const notesApproved = state.releaseNotesApproved;
  const protocolApproved = state.protocolApproved;
  
  // Testers: at least 1 field_tech completed and at least 1 general_user completed
  const techTesterCompleted = state.testers.some(t => t.role === 'field_tech' && t.status === 'completed');
  const userTesterCompleted = state.testers.some(t => t.role === 'general_user' && t.status === 'completed');
  const testersPassed = techTesterCompleted && userTesterCompleted;

  const isGateApproved = qaPassed && packagingPassed && storePassed && notesApproved && protocolApproved && testersPassed;

  return (
    <div className="p-4 rounded-2xl bg-[#090d19]/90 border border-slate-800 font-sans text-left space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Gate de Cierre de Release Candidate</h4>
            <p className="text-[10px] text-slate-400">Comprobaciones de compuerta antes del certificado</p>
          </div>
        </div>
        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
          state.status === 'final_closed'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : isGateApproved
            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {state.status === 'final_closed' ? 'FINAL CLOSED' : isGateApproved ? 'READY TO CLOSE' : 'BLOCKED'}
        </span>
      </div>

      {/* Grid of Criterios */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-[10px] font-mono">
        {/* QA */}
        <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-2">
          <span className="text-slate-300">QA Score ≥ 95% ({qaScore}%)</span>
          {qaPassed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
        </div>

        {/* Bugs & Crítical Failed */}
        <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-2">
          <span className="text-slate-300">Cero Bugs Críticos ({criticalBugs})</span>
          {criticalBugs === 0 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
        </div>

        {/* Packaging */}
        <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-2">
          <span className="text-slate-300">Packaging ≥ 95% ({packagingScore}%)</span>
          {packagingPassed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
        </div>

        {/* Store */}
        <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-2">
          <span className="text-slate-300">Store ≥ 90% ({storeScore}%)</span>
          {storePassed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
        </div>

        {/* Release Notes */}
        <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-2">
          <span className="text-slate-300">Release Notes Aprobadas</span>
          {notesApproved ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
        </div>

        {/* Protocolo */}
        <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-2">
          <span className="text-slate-300">Protocolo Aprobado</span>
          {protocolApproved ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
        </div>

        {/* Tester Técnico */}
        <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-2">
          <span className="text-slate-300">1+ Tester Técnico OK</span>
          {techTesterCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
        </div>

        {/* Tester General */}
        <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-2">
          <span className="text-slate-300">1+ Tester General OK</span>
          {userTesterCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
        </div>
      </div>

      {/* Warning/Success Banner */}
      {!isGateApproved && state.status !== 'final_closed' && (
        <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-slate-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-400 block mb-0.5">Compuerta Bloqueada (Falta Feedback o Puntajes)</span>
            <span>Asegúrate de completar el checklist de Play Store, configurar Gradle en Packaging, verificar que el linter esté limpio, y registrar al menos 1 tester técnico y 1 general completado para habilitar la firma del certificado final.</span>
          </div>
        </div>
      )}

      {isGateApproved && state.status !== 'final_closed' && (
        <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-slate-300 flex items-start gap-2 animate-pulse">
          <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-400 block mb-0.5">Compuerta Abierta</span>
            <span>Todos los criterios técnicos se cumplen con éxito. Puedes proceder a emitir el Certificado Final de Lanzamiento.</span>
          </div>
        </div>
      )}

      {/* Button Actions */}
      <div className="pt-2">
        {state.status === 'final_closed' ? (
          <button
            onClick={onReopenRc}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-bold uppercase tracking-wider rounded-lg border border-slate-700 active:scale-[0.99] transition-all cursor-pointer"
          >
            REABRIR RELEASE CANDIDATE (RE-DRAFT)
          </button>
        ) : (
          <button
            onClick={onCloseRc}
            disabled={!isGateApproved}
            className={`w-full py-2.5 text-xs font-sans font-black uppercase tracking-wider rounded-lg active:scale-[0.99] transition-all ${
              isGateApproved
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/20 cursor-pointer'
                : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            FIRMAR Y CERRAR RELEASE CANDIDATE ➔
          </button>
        )}
      </div>
    </div>
  );
}
