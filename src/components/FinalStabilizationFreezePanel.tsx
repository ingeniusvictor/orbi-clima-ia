import React, { useState, useEffect } from 'react';
import { Compass, RefreshCw, Lock, Unlock, ShieldCheck, BadgeCheck, FileCheck, ClipboardList, Wrench, Award, FileDown } from 'lucide-react';
import CompactSectionCard from './CompactSectionCard';
import LocalReleaseSealHeader from './LocalReleaseSealHeader';
import VersionLockCard from './VersionLockCard';
import FeatureFreezeGateCard from './FeatureFreezeGateCard';
import ModuleCompletionMatrixCard from './ModuleCompletionMatrixCard';
import CertificateConsolidationCard from './CertificateConsolidationCard';
import MasterChangelogCard from './MasterChangelogCard';
import FinalRiskReviewCard from './FinalRiskReviewCard';
import MaintenancePathCard from './MaintenancePathCard';
import LocalReleaseSealCertificateCard from './LocalReleaseSealCertificateCard';
import FinalReleaseExportCard from './FinalReleaseExportCard';

import {
  loadFinalReleaseSealState,
  saveFinalReleaseSealState,
  updateFinalReleaseSealState,
  issueLocalReleaseSeal,
  resetLocalReleaseSeal,
  FinalReleaseSealState
} from '../services/finalReleaseSealService';

import { loadPilotFeedbackState } from '../services/pilotFeedbackService';
import { evaluateFeatureFreezeGate } from '../utils/featureFreezeGate';

export default function FinalStabilizationFreezePanel() {
  const [state, setState] = useState<FinalReleaseSealState>(() => loadFinalReleaseSealState());
  const [feedbackState, setFeedbackState] = useState(() => loadPilotFeedbackState());

  const reloadAll = () => {
    setState(loadFinalReleaseSealState());
    setFeedbackState(loadPilotFeedbackState());
  };

  useEffect(() => {
    reloadAll();
    window.addEventListener('focus', reloadAll);
    window.addEventListener('orbi_release_seal_changed', reloadAll);
    window.addEventListener('orbi_pilot_feedback_changed', reloadAll);
    return () => {
      window.removeEventListener('focus', reloadAll);
      window.removeEventListener('orbi_release_seal_changed', reloadAll);
      window.removeEventListener('orbi_pilot_feedback_changed', reloadAll);
    };
  }, []);

  // Compute quality gates in real-time
  const gateResult = evaluateFeatureFreezeGate(
    feedbackState.feedback,
    feedbackState.fixes,
    state.featureFreezeActive
  );

  const handleToggleFeatureFreeze = (active: boolean) => {
    const updated = updateFinalReleaseSealState({
      featureFreezeActive: active,
      freezeStatus: active ? 'frozen' : 'draft'
    });
    setState(updated);
  };

  const handleIssueSeal = () => {
    const updated = issueLocalReleaseSeal();
    setState(updated);
  };

  const handleReset = () => {
    if (confirm('¿Está seguro de reiniciar los datos del Sello de Estabilización Final?')) {
      const reset = resetLocalReleaseSeal();
      setState(reset);
    }
  };

  return (
    <div id="orbi-final-stabilization-freeze-panel" className="space-y-4 font-sans text-left">
      {/* Header */}
      <LocalReleaseSealHeader state={state} isGatePassed={gateResult.isPassed} />

      {/* Main Module description banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-left font-sans">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> Final Stabilization Freeze & v1.0 Seal — Módulo 12
        </h4>
        <p className="text-[10px] text-slate-400 mt-1">
          Cierre formal y congelamiento técnico del código base de ORBI Clima IA v1.0. Valide las compuertas de aseguramiento, compile el changelog maestro, mitigue riesgos y selle formalmente la entrega para dar inicio seguro a la rama v1.1.x.
        </p>
        <div className="mt-3 flex items-center justify-between text-[9px] font-mono border-t border-slate-800/80 pt-2 text-slate-500">
          <span>Sistema de Sello Local Autónomo</span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-850 hover:bg-slate-800 text-slate-400 font-bold rounded cursor-pointer transition-all"
          >
            <RefreshCw className="w-3 h-3" /> RESETEAR CONGELAMIENTO
          </button>
        </div>
      </div>

      {/* 1. Version Lock details */}
      <CompactSectionCard
        title="1. Registro de Bloqueo de Versión"
        subtitle="Configuración y políticas de versiones de v1.0.x"
        status={state.featureFreezeActive ? "LOCKED" : "DRAFT"}
        icon={<Lock className="w-4 h-4 text-indigo-400" />}
        defaultExpanded={false}
      >
        <VersionLockCard />
      </CompactSectionCard>

      {/* 2. Feature Freeze Gate */}
      <CompactSectionCard
        title="2. Compuerta de Congelamiento"
        subtitle="Checklist y No More Features Gate con doble confirmación"
        status={gateResult.isPassed ? "PASSED" : "BLOCKED"}
        icon={<BadgeCheck className="w-4 h-4 text-pink-400" />}
        defaultExpanded={true}
      >
        <FeatureFreezeGateCard
          gateResult={gateResult}
          featureFreezeActive={state.featureFreezeActive}
          onToggleFeatureFreeze={handleToggleFeatureFreeze}
        />
      </CompactSectionCard>

      {/* 3. Module Matrix */}
      <CompactSectionCard
        title="3. Matriz Final de Módulos"
        subtitle="Estado de entregables de Módulo 0 a Módulo 12"
        status="100% COMPLETADO"
        icon={<Wrench className="w-4 h-4 text-cyan-400" />}
        defaultExpanded={false}
      >
        <ModuleCompletionMatrixCard />
      </CompactSectionCard>

      {/* 4. Certificate Consolidation */}
      <CompactSectionCard
        title="4. Consolidación de Certificados"
        subtitle="Registro de actas y paquetes emitidos durante el release"
        status="SÍNCRONO"
        icon={<FileCheck className="w-4 h-4 text-emerald-400" />}
        defaultExpanded={false}
      >
        <CertificateConsolidationCard />
      </CompactSectionCard>

      {/* 5. Master Changelog */}
      <CompactSectionCard
        title="5. Changelog Maestro v1.0"
        subtitle="Compilación de cambios desde los cimientos hasta el freeze"
        status="COMPILADO"
        icon={<ClipboardList className="w-4 h-4 text-amber-400" />}
        defaultExpanded={false}
      >
        <MasterChangelogCard />
      </CompactSectionCard>

      {/* 6. Final Risk Review */}
      <CompactSectionCard
        title="6. Revisión Final de Riesgos"
        subtitle="Matriz de riesgos residuales y Directiva HSE"
        status="MITIGADOS"
        icon={<ShieldCheck className="w-4 h-4 text-rose-400" />}
        defaultExpanded={false}
      >
        <FinalRiskReviewCard />
      </CompactSectionCard>

      {/* 7. Maintenance Path */}
      <CompactSectionCard
        title="7. Ruta de Mantenimiento"
        subtitle="Definición de alcances para ramas v1.0.x, v1.1.x y v2.0.x"
        status="HOJA DE RUTA"
        icon={<Compass className="w-4 h-4 text-teal-400" />}
        defaultExpanded={false}
      >
        <MaintenancePathCard />
      </CompactSectionCard>

      {/* 8. Local Release Seal Certificate */}
      <CompactSectionCard
        title="8. Certificado de Sello Local"
        subtitle="Emisión del sello definitivo que clausura el ciclo de v1.0"
        status={state.localSealIssued ? "ISSUED" : "DRAFT"}
        icon={<Award className="w-4 h-4 text-purple-400" />}
        defaultExpanded={true}
      >
        <LocalReleaseSealCertificateCard
          state={state}
          isGatePassed={gateResult.isPassed}
          onUpdateState={(partial) => {
            const updated = updateFinalReleaseSealState(partial);
            setState(updated);
          }}
          onIssueSeal={handleIssueSeal}
        />
      </CompactSectionCard>

      {/* 9. Final Release Export */}
      <CompactSectionCard
        title="9. Exportador de Paquete Final"
        subtitle="Descarga de las 6 actas técnicas y registros de control de calidad"
        status="LISTO"
        icon={<FileDown className="w-4 h-4 text-blue-400" />}
        defaultExpanded={false}
      >
        <FinalReleaseExportCard state={state} />
      </CompactSectionCard>
    </div>
  );
}
export { FinalStabilizationFreezePanel };
