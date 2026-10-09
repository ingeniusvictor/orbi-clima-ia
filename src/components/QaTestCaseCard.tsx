import React, { useState } from 'react';
import { QaTestCase, QaStatus, QaSeverity } from '../services/qaStateService';
import { Check, AlertTriangle, AlertOctagon, RefreshCw, Clipboard, CheckCircle2, XCircle, HelpCircle, Edit3 } from 'lucide-react';

interface QaTestCaseCardProps {
  key?: string;
  test: QaTestCase;
  onStatusChange: (id: string, status: QaStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
}

export default function QaTestCaseCard({ test, onStatusChange, onNotesChange }: QaTestCaseCardProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(test.notes || '');

  const getSeverityBadge = (sev: QaSeverity) => {
    switch (sev) {
      case 'critical':
        return { label: 'CRÍTICA', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'high':
        return { label: 'ALTA', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'medium':
        return { label: 'MEDIA', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'low':
      default:
        return { label: 'BAJA', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  const getStatusStyle = (status: QaStatus) => {
    switch (status) {
      case 'passed':
        return { border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.02]', iconColor: 'text-emerald-400' };
      case 'failed':
        return { border: 'border-rose-500/25', bg: 'bg-rose-500/[0.02]', iconColor: 'text-rose-400' };
      case 'blocked':
        return { border: 'border-orange-500/20', bg: 'bg-orange-500/[0.02]', iconColor: 'text-orange-400' };
      case 'needs_review':
        return { border: 'border-indigo-500/20', bg: 'bg-indigo-500/[0.02]', iconColor: 'text-indigo-400' };
      case 'not_started':
      default:
        return { border: 'border-slate-800', bg: 'bg-slate-900/40', iconColor: 'text-slate-400' };
    }
  };

  const sevBadge = getSeverityBadge(test.severity);
  const style = getStatusStyle(test.status);

  const handleSaveNotes = () => {
    onNotesChange(test.id, notesText);
    setIsEditingNotes(false);
  };

  return (
    <div className={`p-4 rounded-xl border flex flex-col gap-3.5 transition-all ${style.border} ${style.bg}`}>
      {/* Top row: Module name and Severity */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide truncate max-w-[240px]">
          {test.module}
        </span>
        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${sevBadge.color}`}>
          SEVERIDAD: {sevBadge.label}
        </span>
      </div>

      {/* Title & Description */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-200 font-sans flex items-center gap-1.5">
          {test.title}
        </h4>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{test.description}</p>
      </div>

      {/* Expected Result Box */}
      <div className="p-2.5 rounded-lg bg-[#060a12] border border-slate-900 text-[10.5px] font-sans">
        <span className="text-slate-400 font-bold block mb-0.5 font-mono text-[9px] uppercase tracking-wider">RESULTADO ESPERADO:</span>
        <span className="text-slate-300 leading-normal">{test.expectedResult}</span>
      </div>

      {/* Interactive Controls Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/50">
        
        {/* Status Selectors */}
        <div className="flex items-center gap-1.5 bg-[#060a12]/80 p-0.5 rounded-lg border border-slate-900">
          <button
            onClick={() => onStatusChange(test.id, 'passed')}
            className={`px-2 py-1 rounded text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer transition-all ${
              test.status === 'passed'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
          </button>
          
          <button
            onClick={() => onStatusChange(test.id, 'failed')}
            className={`px-2 py-1 rounded text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer transition-all ${
              test.status === 'failed'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" /> FAILED
          </button>

          <button
            onClick={() => onStatusChange(test.id, 'blocked')}
            className={`px-2 py-1 rounded text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer transition-all ${
              test.status === 'blocked'
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> BLOCKED
          </button>

          <button
            onClick={() => onStatusChange(test.id, 'needs_review')}
            className={`px-2 py-1 rounded text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer transition-all ${
              test.status === 'needs_review'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> REVIEW
          </button>
        </div>

        {/* Notes Toggle / Input */}
        <div className="flex-1 max-w-[200px] flex justify-end">
          {isEditingNotes ? (
            <div className="flex items-center gap-1 w-full">
              <input
                type="text"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Obs. de calidad..."
                className="w-full bg-[#060a12] border border-slate-800 text-xs px-2 py-1 rounded text-slate-200 outline-none font-sans"
              />
              <button
                onClick={handleSaveNotes}
                className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15 text-indigo-400 rounded cursor-pointer transition-all"
                title="Guardar observaciones"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              {test.notes ? 'Editar observaciones' : 'Agregar observaciones'}
            </button>
          )}
        </div>
      </div>

      {/* Render Note preview if not editing and exists */}
      {!isEditingNotes && test.notes && (
        <div className="p-2 rounded bg-indigo-500/[0.02] border border-indigo-500/5 text-[10px] text-indigo-400/90 font-mono flex items-start gap-1.5">
          <span className="font-bold shrink-0">QA NOTE:</span>
          <span className="break-all">{test.notes}</span>
        </div>
      )}
    </div>
  );
}
