import React, { useState, useEffect } from 'react';
import { Cpu, Users, FileText, ClipboardList, ShieldCheck, FileDown, Award, Sparkles, RefreshCw } from 'lucide-react';
import CompactSectionCard from './CompactSectionCard';
import InternalTestingStatusHeader from './InternalTestingStatusHeader';
import TesterRosterCard from './TesterRosterCard';
import InternalTestingProtocolCard from './InternalTestingProtocolCard';
import ReleaseNotesFinalCard from './ReleaseNotesFinalCard';
import DeviceAcceptanceChecklistCard from './DeviceAcceptanceChecklistCard';
import TesterFeedbackTemplateCard from './TesterFeedbackTemplateCard';
import RcClosureGateCard from './RcClosureGateCard';
import FinalRcCertificateCard from './FinalRcCertificateCard';
import InternalTestingExportCard from './InternalTestingExportCard';

import {
  loadRcClosureState,
  saveRcClosureState,
  updateRcClosureState,
  addInternalTester,
  updateInternalTester,
  removeInternalTester,
  resetRcClosureState,
  RcClosureState,
  InternalTester
} from '../services/rcClosureStateService';

import { loadQaState } from '../services/qaStateService';
import { loadPackagingChecklist } from '../utils/androidPackagingChecklist';

export default function InternalTestingReleasePackPanel() {
  const [state, setState] = useState<RcClosureState>(() => loadRcClosureState());
  const [qaScore, setQaScore] = useState(100);
  const [packagingScore, setPackagingScore] = useState(0);
  const [storeScore, setStoreScore] = useState(0);

  // Reload scores & local closure state
  const reloadAll = () => {
    const freshState = loadRcClosureState();
    setState(freshState);

    // QA
    const qa = loadQaState();
    setQaScore(qa.qaScore);

    // Packaging
    const pkg = loadPackagingChecklist();
    const pkgComp = pkg.filter(i => i.completed).length;
    setPackagingScore(pkg.length > 0 ? Math.round((pkgComp / pkg.length) * 100) : 0);

    // Store
    const savedStore = localStorage.getItem('orbi_clima_store_checklist_v1');
    if (savedStore) {
      try {
        const storeItems = JSON.parse(savedStore);
        if (Array.isArray(storeItems) && storeItems.length > 0) {
          const completed = storeItems.filter((i: any) => i.completed).length;
          setStoreScore(Math.round((completed / storeItems.length) * 100));
        }
      } catch (e) {
        setStoreScore(0);
      }
    }
  };

  useEffect(() => {
    reloadAll();
    window.addEventListener('focus', reloadAll);
    window.addEventListener('orbi_rc_closure_changed', reloadAll);
    return () => {
      window.removeEventListener('focus', reloadAll);
      window.removeEventListener('orbi_rc_closure_changed', reloadAll);
    };
  }, []);

  // Update Status based on scores, testers, and approvals
  useEffect(() => {
    // If it's already final closed, don't auto-update status away from closed
    if (state.status === 'final_closed') return;

    // Evaluate current situation
    const qaPassed = qaScore >= 95;
    const packagingPassed = packagingScore >= 95;
    const storePassed = storeScore >= 90;
    
    const techTesterCompleted = state.testers.some(t => t.role === 'field_tech' && t.status === 'completed');
    const userTesterCompleted = state.testers.some(t => t.role === 'general_user' && t.status === 'completed');
    const testersPassed = techTesterCompleted && userTesterCompleted;

    const approvalsPassed = state.releaseNotesApproved && state.protocolApproved;

    let newStatus: RcClosureState['status'] = 'draft';

    if (!qaPassed || !packagingPassed || !storePassed) {
      newStatus = 'blocked';
    } else if (qaPassed && packagingPassed && storePassed && !testersPassed) {
      newStatus = 'ready_for_testing';
    } else if (testersPassed && !approvalsPassed) {
      newStatus = 'needs_fixes';
    } else if (testersPassed && approvalsPassed) {
      newStatus = 'testing';
    }

    if (newStatus !== state.status) {
      updateRcClosureState({ status: newStatus });
      setState(prev => ({ ...prev, status: newStatus }));
    }
  }, [qaScore, packagingScore, storeScore, state.testers, state.releaseNotesApproved, state.protocolApproved]);

  // Handle Tester operations
  const handleAddTester = (testerData: any) => {
    const updated = addInternalTester(testerData);
    setState(updated);
  };

  const handleUpdateTester = (id: string, partial: any) => {
    const updated = updateInternalTester(id, partial);
    setState(updated);
  };

  const handleRemoveTester = (id: string) => {
    const updated = removeInternalTester(id);
    setState(updated);
  };

  // Toggle checklist
  const handleToggleChecklist = (id: string) => {
    const currentChecklist = { ...state.checklist };
    currentChecklist[id] = !currentChecklist[id];
    const updated = updateRcClosureState({ checklist: currentChecklist });
    setState(updated);
  };

  const handleCheckAll = () => {
    const currentChecklist = { ...state.checklist };
    Object.keys(currentChecklist).forEach(k => {
      currentChecklist[k] = true;
    });
    const updated = updateRcClosureState({ checklist: currentChecklist });
    setState(updated);
  };

  const handleClearAll = () => {
    const currentChecklist = { ...state.checklist };
    Object.keys(currentChecklist).forEach(k => {
      currentChecklist[k] = false;
    });
    const updated = updateRcClosureState({ checklist: currentChecklist });
    setState(updated);
  };

  // Approve Release notes
  const handleToggleReleaseNotesApproved = (val: boolean) => {
    const updated = updateRcClosureState({ releaseNotesApproved: val });
    setState(updated);
  };

  // Approve Protocol
  const handleToggleProtocolApproved = (val: boolean) => {
    const updated = updateRcClosureState({ protocolApproved: val });
    setState(updated);
  };

  // Close RC
  const handleCloseRc = () => {
    const updated = updateRcClosureState({ status: 'final_closed', finalCertificateIssued: true });
    setState(updated);
  };

  // Reopen RC
  const handleReopenRc = () => {
    const updated = updateRcClosureState({ status: 'draft', finalCertificateIssued: false });
    setState(updated);
  };

  // Reset state
  const handleResetState = () => {
    if (window.confirm('¿Está seguro de reiniciar todo el progreso del módulo de cierre RC a los valores por defecto?')) {
      const reset = resetRcClosureState();
      setState(reset);
    }
  };

  // Human readable status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador (Draft)';
      case 'ready_for_testing': return 'Listo para Testing (Ready)';
      case 'testing': return 'Pruebas en Progreso (Testing)';
      case 'needs_fixes': return 'Requiere Ajustes (Needs Fixes)';
      case 'final_closed': return 'Cierre Final RC';
      case 'blocked': return 'Bloqueado por Requisitos';
      default: return status;
    }
  };

  return (
    <div id="orbi-internal-testing-panel" className="space-y-4">
      {/* 1. InternalTestingStatusHeader */}
      <InternalTestingStatusHeader
        qaScore={qaScore}
        packagingScore={packagingScore}
        storeScore={storeScore}
        status={state.status}
      />

      {/* Main Container description */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-left font-sans">
        <h4 className="text-xs font-bold text-slate-200">Internal Testing Release Pack</h4>
        <p className="text-[10px] text-slate-400 mt-1">
          Cierre controlado de Release Candidate antes de pruebas internas Android. Administre los testers locales, valide el checklist de aceptación por dispositivo, apruebe el protocolo operativo de tienda y emita el certificado de calidad SkyCore™.
        </p>
        <div className="mt-3 flex items-center justify-between text-[9px] font-mono border-t border-slate-800/80 pt-2 text-slate-500">
          <div className="flex gap-2">
            <span>Última actualización: {new Date(state.lastUpdated).toLocaleTimeString('es-CL')}</span>
            <button
              onClick={() => {
                const el = document.getElementById('orbi-pilot-feedback-loop-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-pink-400 hover:underline cursor-pointer font-bold"
            >
              🧪 ABRIR FEEDBACK POST-RC
            </button>
          </div>
          <button
            onClick={handleResetState}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded cursor-pointer transition-all"
          >
            <RefreshCw className="w-3 h-3" /> REINICIAR PROGRESO
          </button>
        </div>
      </div>

      {/* Compact Section: Testers */}
      <CompactSectionCard
        title="Registro de Testers (Roster)"
        subtitle="Administra los revisores autorizados en terreno y usuarios de prueba"
        status={`${state.testers.length} Registrados`}
        icon={<Users className="w-4 h-4 text-pink-400" />}
        defaultExpanded={true}
      >
        <TesterRosterCard
          testers={state.testers}
          onAddTester={handleAddTester}
          onUpdateTester={handleUpdateTester}
          onRemoveTester={handleRemoveTester}
        />
      </CompactSectionCard>

      {/* Compact Section: Protocol */}
      <CompactSectionCard
        title="Protocolo Operativo"
        subtitle="Pasos secuenciales recomendados para testing cerrado en Play Console"
        status={state.protocolApproved ? "APROBADO" : "PENDIENTE"}
        icon={<ClipboardList className="w-4 h-4 text-cyan-400" />}
        defaultExpanded={false}
      >
        <InternalTestingProtocolCard
          approved={state.protocolApproved}
          onToggleApproved={handleToggleProtocolApproved}
        />
      </CompactSectionCard>

      {/* Compact Section: Release Notes */}
      <CompactSectionCard
        title="Notas de Release"
        subtitle="Definición del texto de lanzamiento oficial e inclusiones"
        status={state.releaseNotesApproved ? "APROBADO" : "PENDIENTE"}
        icon={<FileText className="w-4 h-4 text-teal-400" />}
        defaultExpanded={false}
      >
        <ReleaseNotesFinalCard
          approved={state.releaseNotesApproved}
          onToggleApproved={handleToggleReleaseNotesApproved}
        />
      </CompactSectionCard>

      {/* Compact Section: Device Checklist */}
      <CompactSectionCard
        title="Checklist de Dispositivo"
        subtitle="Evaluación de 25 criterios indispensables en el terminal Android real"
        status={`${Object.values(state.checklist).filter(Boolean).length}/25 OK`}
        icon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
        defaultExpanded={false}
      >
        <DeviceAcceptanceChecklistCard
          checklist={state.checklist}
          onToggleCheck={handleToggleChecklist}
          onCheckAll={handleCheckAll}
          onClearAll={handleClearAll}
        />
      </CompactSectionCard>

      {/* Compact Section: Tester Feedback Template */}
      <CompactSectionCard
        title="Plantilla de Feedback"
        subtitle="Cuestionario de 20 preguntas estándar para los testers"
        status="DISPONIBLE"
        icon={<FileDown className="w-4 h-4 text-purple-400" />}
        defaultExpanded={false}
      >
        <TesterFeedbackTemplateCard />
      </CompactSectionCard>

      {/* Compact Section: Export */}
      <CompactSectionCard
        title="Exportadores del Paquete"
        subtitle="Descarga reportes de testing, manuales y certificados en formato Markdown"
        status="LISTO"
        icon={<FileDown className="w-4 h-4 text-blue-400" />}
        defaultExpanded={false}
      >
        <InternalTestingExportCard state={state} />
      </CompactSectionCard>

      {/* Compact Section: Closure Gate */}
      <CompactSectionCard
        title="Gate de Cierre y Firma"
        subtitle="Evaluación de requisitos de compuerta final para certificar el RC"
        status={state.status === 'final_closed' ? 'CERTIFICADO' : 'EVALUANDO'}
        icon={<Award className="w-4 h-4 text-emerald-400" />}
        defaultExpanded={true}
      >
        <RcClosureGateCard
          state={state}
          onCloseRc={handleCloseRc}
          onReopenRc={handleReopenRc}
        />
      </CompactSectionCard>

      {/* Compact Section: Certificate */}
      <CompactSectionCard
        title="Certificado de Calidad"
        subtitle="Declaración formal del cierre de Release Candidate de ORBI Clima IA"
        status={state.status === 'final_closed' ? 'EMITIDO' : 'PENDIENTE'}
        icon={<Award className="w-4 h-4 text-amber-400" />}
        defaultExpanded={state.status === 'final_closed'}
      >
        <FinalRcCertificateCard state={state} />
      </CompactSectionCard>
    </div>
  );
}
