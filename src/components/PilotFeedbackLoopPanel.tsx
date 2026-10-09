import React, { useState, useEffect } from 'react';
import { RefreshCw, MessageSquare, ShieldAlert, BadgeCheck, FileCheck, ClipboardList, Wrench, Award, Compass, FileDown } from 'lucide-react';
import CompactSectionCard from './CompactSectionCard';
import PilotFeedbackStatusHeader from './PilotFeedbackStatusHeader';
import TesterFeedbackInboxCard from './TesterFeedbackInboxCard';
import FeedbackClassificationCard from './FeedbackClassificationCard';
import PostRcFixTrackerCard from './PostRcFixTrackerCard';
import FixPriorityMatrixCard from './FixPriorityMatrixCard';
import CorrectionEvidenceCard from './CorrectionEvidenceCard';
import RcPatchNotesCard from './RcPatchNotesCard';
import PostRcClosureGateCard from './PostRcClosureGateCard';
import PostRcExportCard from './PostRcExportCard';

import {
  loadPilotFeedbackState,
  savePilotFeedbackState,
  updatePilotFeedback,
  addPilotFeedback,
  deletePilotFeedback,
  resetPilotFeedbackState,
  PilotFeedbackState
} from '../services/pilotFeedbackService';

import {
  addPostRcFix,
  updatePostRcFix,
  deletePostRcFix
} from '../services/postRcFixTrackerService';

export default function PilotFeedbackLoopPanel() {
  const [state, setState] = useState<PilotFeedbackState>(() => loadPilotFeedbackState());

  const reloadAll = () => {
    setState(loadPilotFeedbackState());
  };

  useEffect(() => {
    reloadAll();
    window.addEventListener('focus', reloadAll);
    window.addEventListener('orbi_pilot_feedback_changed', reloadAll);
    return () => {
      window.removeEventListener('focus', reloadAll);
      window.removeEventListener('orbi_pilot_feedback_changed', reloadAll);
    };
  }, []);

  // Update overall postRcStatus based on critical issues or open P0/P1 fixes
  useEffect(() => {
    if (state.postRcStatus === 'closed') return;

    // Evaluate
    const hasNewFeedback = state.feedback.some(fb => fb.status === 'new');
    const activeCriticalCount = state.feedback.filter(
      fb => fb.severity === 'critical' && ['new', 'triaged', 'needs_fix'].includes(fb.status)
    ).length;

    const openP0FixesCount = state.fixes.filter(
      fix => fix.priority === 'p0' && ['open', 'in_progress', 'ready_for_test'].includes(fix.status)
    ).length;

    const openP1FixesCount = state.fixes.filter(
      fix => fix.priority === 'p1' && ['open', 'in_progress', 'ready_for_test'].includes(fix.status)
    ).length;

    let newStatus: PilotFeedbackState['postRcStatus'] = 'waiting_feedback';

    if (state.feedback.length === 0) {
      newStatus = 'waiting_feedback';
    } else if (hasNewFeedback) {
      newStatus = 'needs_triage';
    } else if (activeCriticalCount > 0 || openP0FixesCount > 0 || openP1FixesCount > 0) {
      newStatus = 'fixing';
    } else if (state.fixes.some(fix => fix.status === 'ready_for_test')) {
      newStatus = 'ready_for_retest';
    } else {
      newStatus = 'waiting_feedback'; // default or idling
    }

    if (newStatus !== state.postRcStatus) {
      const updated = { ...state, postRcStatus: newStatus };
      savePilotFeedbackState(updated);
      setState(updated);
    }
  }, [state.feedback, state.fixes, state.postRcStatus]);

  const handleAddFeedback = (itemData: any) => {
    const updated = addPilotFeedback(itemData);
    setState(updated);
  };

  const handleUpdateFeedback = (id: string, partial: any) => {
    const updated = updatePilotFeedback(id, partial);
    setState(updated);
  };

  const handleDeleteFeedback = (id: string) => {
    const updated = deletePilotFeedback(id);
    setState(updated);
  };

  const handleAddFix = (fixData: any) => {
    const updated = addPostRcFix(fixData);
    setState(updated);
  };

  const handleUpdateFix = (id: string, partial: any) => {
    const updated = updatePostRcFix(id, partial);
    setState(updated);
  };

  const handleDeleteFix = (id: string) => {
    const updated = deletePostRcFix(id);
    setState(updated);
  };

  const handleClosePostRc = () => {
    const updated = { ...state, postRcStatus: 'closed' as const };
    savePilotFeedbackState(updated);
    setState(updated);
  };

  const handleReopenPostRc = () => {
    const updated = { ...state, postRcStatus: 'waiting_feedback' as const };
    savePilotFeedbackState(updated);
    setState(updated);
  };

  const handleReset = () => {
    if (confirm('¿Está seguro de reiniciar los datos del Pilot Feedback Loop a sus valores por defecto?')) {
      const reset = resetPilotFeedbackState();
      setState(reset);
    }
  };

  return (
    <div id="orbi-pilot-feedback-loop-panel" className="space-y-4">
      {/* 1. Status Header */}
      <PilotFeedbackStatusHeader state={state} />

      {/* Description */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-left font-sans">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <Compass className="w-4 h-4 text-pink-400" /> Controlled Pilot Feedback Loop — Módulo 11
        </h4>
        <p className="text-[10px] text-slate-400 mt-1">
          Escuche, tipifique, clasifique, corrija y valide el comportamiento real de ORBI Clima IA en los terminales de los testers del piloto cerrado. Gestione los fixes de parches y certifique la conformidad final post-Release Candidate.
        </p>
        <div className="mt-3 flex items-center justify-between text-[9px] font-mono border-t border-slate-800/80 pt-2 text-slate-500">
          <span>Sincronización local activa</span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-850 hover:bg-slate-800 text-slate-400 font-bold rounded cursor-pointer transition-all"
          >
            <RefreshCw className="w-3 h-3" /> RESETEAR PILOTO
          </button>
        </div>
      </div>

      {/* Compact Cards Sections */}
      {/* 2. Inbox */}
      <CompactSectionCard
        title="Bandeja de Feedback"
        subtitle="Ingreso manual y simulación de cuestionarios desde plantilla"
        status={`${state.feedback.length} Recibidos`}
        icon={<MessageSquare className="w-4 h-4 text-pink-400" />}
        defaultExpanded={true}
      >
        <TesterFeedbackInboxCard
          feedback={state.feedback}
          onAddFeedback={handleAddFeedback}
          onUpdateFeedback={handleUpdateFeedback}
          onDeleteFeedback={handleDeleteFeedback}
          onLinkToFix={(id) => {}}
        />
      </CompactSectionCard>

      {/* 3. Classification */}
      <CompactSectionCard
        title="Clasificación de Observaciones"
        subtitle="Agrupación automatizada por severidad y tipologías técnicas"
        status="ACTIVO"
        icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
        defaultExpanded={false}
      >
        <FeedbackClassificationCard feedback={state.feedback} />
      </CompactSectionCard>

      {/* 4. Fix Tracker */}
      <CompactSectionCard
        title="Tracker de Parches"
        subtitle="Seguimiento detallado de las soluciones de ingeniería post-RC"
        status={`${state.fixes.length} Correcciones`}
        icon={<Wrench className="w-4 h-4 text-cyan-400" />}
        defaultExpanded={false}
      >
        <PostRcFixTrackerCard
          fixes={state.fixes}
          feedback={state.feedback}
          onAddFix={handleAddFix}
          onUpdateFix={handleUpdateFix}
          onDeleteFix={handleDeleteFix}
        />
      </CompactSectionCard>

      {/* 5. Priority Matrix */}
      <CompactSectionCard
        title="Matriz de Prioridad e Incidentes"
        subtitle="Detección de bloqueos de release P0/P1 y crashes pendientes"
        status="EVALUANDO"
        icon={<BadgeCheck className="w-4 h-4 text-emerald-400" />}
        defaultExpanded={true}
      >
        <FixPriorityMatrixCard feedback={state.feedback} fixes={state.fixes} />
      </CompactSectionCard>

      {/* 6. Evidence Submission */}
      <CompactSectionCard
        title="Registro de Evidencia"
        subtitle="Sustento técnico formal sobre qué, dónde y cómo se probó el parche"
        status="DISPONIBLE"
        icon={<FileCheck className="w-4 h-4 text-teal-400" />}
        defaultExpanded={false}
      >
        <CorrectionEvidenceCard fixes={state.fixes} onUpdateFix={handleUpdateFix} />
      </CompactSectionCard>

      {/* 7. Patch Notes */}
      <CompactSectionCard
        title="Notas de Parche RC1.1"
        subtitle="Changelog técnico dinámico compilado a partir de los fixes validados"
        status="COMPILADO"
        icon={<ClipboardList className="w-4 h-4 text-amber-400" />}
        defaultExpanded={false}
      >
        <RcPatchNotesCard state={state} />
      </CompactSectionCard>

      {/* 8. Export */}
      <CompactSectionCard
        title="Exportador de Informes"
        subtitle="Descarga de actas de conformidad, changelogs y reportes de piloto"
        status="LISTO"
        icon={<FileDown className="w-4 h-4 text-blue-400" />}
        defaultExpanded={false}
      >
        <PostRcExportCard state={state} />
      </CompactSectionCard>

      {/* 9. Closure Gate */}
      <CompactSectionCard
        title="Compuerta de Clausura del Parche"
        subtitle="Sello final de control para dar término al Pilot Feedback Loop"
        status={state.postRcStatus === 'closed' ? 'CERRADO' : 'EVALUANDO'}
        icon={<Award className="w-4 h-4 text-purple-400" />}
        defaultExpanded={true}
      >
        <PostRcClosureGateCard
          state={state}
          onClosePostRc={handleClosePostRc}
          onReopenPostRc={handleReopenPostRc}
        />
      </CompactSectionCard>
    </div>
  );
}
