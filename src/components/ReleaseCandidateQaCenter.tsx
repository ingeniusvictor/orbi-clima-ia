import React, { useState, useEffect } from 'react';
import {
  QaReleaseState,
  loadQaState,
  saveQaState,
  resetQaState,
  QaStatus,
  QaSeverity,
  QaBugItem,
  QaEvidenceItem
} from '../services/qaStateService';
import {
  downloadQaReport,
  downloadBugTracker,
  downloadQaCertificate
} from '../services/qaExportService';
import QaScoreHeader from './QaScoreHeader';
import QaModuleMatrix from './QaModuleMatrix';
import QaTestCaseCard from './QaTestCaseCard';
import QaBugTrackerPanel from './QaBugTrackerPanel';
import QaEvidencePanel from './QaEvidencePanel';
import QaDeviceChecklist from './QaDeviceChecklist';
import QaPermissionChecklist from './QaPermissionChecklist';
import QaOfflineFallbackChecklist from './QaOfflineFallbackChecklist';
import QaWidgetChecklist from './QaWidgetChecklist';
import QaNotificationChecklist from './QaNotificationChecklist';
import QaReleaseCertificate from './QaReleaseCertificate';
import { ClipboardCheck, FileDown, BookOpen, Layers, Settings, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ReleaseCandidateQaCenter() {
  const [qaState, setQaState] = useState<QaReleaseState>(() => loadQaState());
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'checklists' | 'bugs' | 'evidence'>('tests');

  // Sync state to localStorage on changes
  useEffect(() => {
    saveQaState(qaState);
  }, [qaState]);

  const handleStatusChange = (id: string, status: QaStatus) => {
    setQaState(prev => {
      const updatedTests = prev.tests.map(t =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      );
      const updated = {
        ...prev,
        tests: updatedTests,
        lastUpdated: new Date().toISOString()
      };
      return updated;
    });
  };

  const handleNotesChange = (id: string, notes: string) => {
    setQaState(prev => {
      const updatedTests = prev.tests.map(t =>
        t.id === id ? { ...t, notes, updatedAt: new Date().toISOString() } : t
      );
      const updated = {
        ...prev,
        tests: updatedTests,
        lastUpdated: new Date().toISOString()
      };
      return updated;
    });
  };

  const handleReset = () => {
    if (window.confirm('¿Está seguro de restablecer el centro de pruebas QA al estado inicial? Se borrarán todos los comentarios y reportes personalizados.')) {
      const fresh = resetQaState();
      setQaState(fresh);
      setSelectedModule(null);
    }
  };

  const handleAddBug = (title: string, description: string, severity: QaSeverity, relatedModule?: string) => {
    const newBug: QaBugItem = {
      id: 'bug_' + Math.random().toString(36).substring(2, 9),
      title,
      description,
      severity,
      status: 'open',
      relatedModule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setQaState(prev => {
      const updated = {
        ...prev,
        bugs: [...prev.bugs, newBug],
        lastUpdated: new Date().toISOString()
      };
      return updated;
    });
  };

  const handleUpdateBugStatus = (id: string, status: 'open' | 'fixed' | 'wont_fix' | 'monitoring') => {
    setQaState(prev => {
      const updatedBugs = prev.bugs.map(b =>
        b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b
      );
      const updated = {
        ...prev,
        bugs: updatedBugs,
        lastUpdated: new Date().toISOString()
      };
      return updated;
    });
  };

  const handleDeleteBug = (id: string) => {
    setQaState(prev => {
      const updated = {
        ...prev,
        bugs: prev.bugs.filter(b => b.id !== id),
        lastUpdated: new Date().toISOString()
      };
      return updated;
    });
  };

  const handleAddEvidence = (label: string, description: string, type: 'text' | 'screenshot_note' | 'manual_result' | 'build_log') => {
    const newEv: QaEvidenceItem = {
      id: 'ev_' + Math.random().toString(36).substring(2, 9),
      label,
      description,
      type,
      createdAt: new Date().toISOString()
    };

    setQaState(prev => {
      const updated = {
        ...prev,
        evidence: [...prev.evidence, newEv],
        lastUpdated: new Date().toISOString()
      };
      return updated;
    });
  };

  const handleDeleteEvidence = (id: string) => {
    setQaState(prev => {
      const updated = {
        ...prev,
        evidence: prev.evidence.filter(ev => ev.id !== id),
        lastUpdated: new Date().toISOString()
      };
      return updated;
    });
  };

  // Filter tests based on selection
  const visibleTests = selectedModule
    ? qaState.tests.filter(t => t.module === selectedModule)
    : qaState.tests;

  return (
    <div id="qa-center-container" className="space-y-6 font-sans">
      {/* Upper header section */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ClipboardCheck className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Release Candidate QA Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Validación interna de ORBI Clima IA antes de empaquetado Android final. Control de calidad integrado del Módulo 0 al Módulo 8B.
          </p>
        </div>

        {/* Global Export actions */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => {
              const el = document.getElementById('orbi-pilot-feedback-loop-panel');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer"
          >
            💬 FEEDBACK LOOP ACTIVO
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('orbi-internal-testing-panel');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/15 text-pink-400 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer"
          >
            🧪 ABRIR INTERNAL TESTING PACK
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('orbi-packaging-panel-container');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/15 text-indigo-400 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer"
          >
            📦 EMPAQUETADO ANDROID (MÓDULO 9B)
          </button>
          <button
            onClick={() => downloadQaReport(qaState)}
            className="px-3.5 py-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-200 hover:text-cyan-400 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" /> EXPORTAR REPORTE (.MD)
          </button>
          <button
            onClick={() => downloadBugTracker(qaState)}
            className="px-3.5 py-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-200 hover:text-orange-400 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-orange-400" /> BUGS LIST (.MD)
          </button>
        </div>
      </div>

      {/* Scoring stats banner */}
      <QaScoreHeader state={qaState} onReset={handleReset} />

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Span 5): Modules list & Checklist tabs */}
        <div className="lg:col-span-5 space-y-6">
          <QaModuleMatrix
            state={qaState}
            selectedModule={selectedModule}
            onSelectModule={(mod) => {
              setSelectedModule(mod === selectedModule ? null : mod);
              setActiveTab('tests'); // Switch to test tab to inspect selection
            }}
          />

          {/* Quick Tabs selector for the lower left panel */}
          <div className="flex bg-[#060a12] p-1 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'tests' ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Pruebas ({visibleTests.length})
            </button>
            <button
              onClick={() => setActiveTab('checklists')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'checklists' ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Checklists Especiales
            </button>
          </div>

          {activeTab === 'checklists' ? (
            <div className="space-y-6">
              <QaDeviceChecklist />
              <QaPermissionChecklist />
              <QaOfflineFallbackChecklist />
              <QaWidgetChecklist />
              <QaNotificationChecklist />
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#090e1a]/80 border border-slate-800 space-y-3.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  {selectedModule ? 'Filtro de Módulo Activo' : 'Todas las Pruebas'}
                </span>
                {selectedModule && (
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="text-[10px] font-mono font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Quitar filtro
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {selectedModule
                  ? `Mostrando únicamente las pruebas de: ${selectedModule}. Puedes marcar el estado de cada una a la derecha.`
                  : 'Selecciona cualquier módulo en la matriz superior para filtrar y enfocar las pruebas unitarias e integrales en terreno.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Column (Span 7): Active view of Tests, Bugs or Evidences */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main test checklist viewer */}
          {activeTab === 'tests' && (
            <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">
                    {selectedModule ? 'Pruebas de Módulo' : 'Catálogo Completo de Pruebas'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {selectedModule ? selectedModule.toUpperCase() : 'TODOS LOS MÓDULOS DEL PROYECTO DESDE 0 HASTA 8B'}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Mostrando {visibleTests.length} ítems
                </span>
              </div>

              {/* Tests list view */}
              <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {visibleTests.map((test) => (
                  <QaTestCaseCard
                    key={test.id}
                    test={test}
                    onStatusChange={handleStatusChange}
                    onNotesChange={handleNotesChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bug Tracker Panel */}
          <QaBugTrackerPanel
            bugs={qaState.bugs}
            onAddBug={handleAddBug}
            onUpdateBugStatus={handleUpdateBugStatus}
            onDeleteBug={handleDeleteBug}
          />

          {/* Evidence Panel */}
          <QaEvidencePanel
            evidence={qaState.evidence}
            onAddEvidence={handleAddEvidence}
            onDeleteEvidence={handleDeleteEvidence}
          />

          {/* Certificate Panel */}
          <QaReleaseCertificate state={qaState} />
        </div>

      </div>

      <div className="p-4 rounded-xl bg-[#060a12] border border-slate-800/60 text-[10px] text-slate-400 leading-relaxed flex items-center justify-between flex-wrap gap-2 font-mono">
        <span>Directiva HSE Terreno: <strong className="text-slate-300">Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.</strong></span>
        <span className="text-emerald-400 font-bold border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">HSE OK</span>
      </div>
    </div>
  );
}
