import React, { useState } from 'react';
import { Award, CheckCircle, Clock, AlertTriangle, FileCheck } from 'lucide-react';

interface CertificateItem {
  id: string;
  name: string;
  description: string;
  status: 'Available' | 'Pending' | 'Needs Review';
}

export default function CertificateConsolidationCard() {
  const [certs, setCerts] = useState<CertificateItem[]>([
    {
      id: 'cert_qa',
      name: 'QA Release Candidate Certificate',
      description: 'Informe formal de pruebas automatizadas y checklist aprobados en el Módulo 9A.',
      status: 'Available'
    },
    {
      id: 'cert_store',
      name: 'Store Readiness Package',
      description: 'Políticas de privacidad y fichas oficiales declaradas en el Módulo 8B.',
      status: 'Available'
    },
    {
      id: 'cert_pkg',
      name: 'Android Packaging Readiness Report',
      description: 'Revisión técnica de AndroidManifest.xml, metadatos y firmas del Módulo 9B.',
      status: 'Available'
    },
    {
      id: 'cert_test',
      name: 'Internal Testing Release Pack',
      description: 'Lista de control de acceso para el roster de testers cerrado del Módulo 10.',
      status: 'Available'
    },
    {
      id: 'cert_rc_close',
      name: 'Final RC Closure Certificate',
      description: 'Acta técnica de término de pruebas del Release Candidate en el Módulo 10.',
      status: 'Available'
    },
    {
      id: 'cert_post_rc',
      name: 'Post-RC Closure Certificate',
      description: 'Aprobación del pilotaje en terreno y resolución de incidencias en el Módulo 11.',
      status: 'Available'
    },
    {
      id: 'cert_seal',
      name: 'Local Release Seal Certificate',
      description: 'Sello definitivo que bloquea el desarrollo de v1.0 e inicia la rama v1.1.',
      status: 'Available'
    }
  ]);

  const handleToggleStatus = (id: string) => {
    setCerts(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nextStatus: CertificateItem['status'] =
            c.status === 'Available'
              ? 'Needs Review'
              : c.status === 'Needs Review'
                ? 'Pending'
                : 'Available';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-3 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Consolidación de las actas de conformidad técnica generadas durante el ciclo de vida de la aplicación. Presione un certificado para alternar su estado si se encuentra en auditoría.
      </p>

      <div className="space-y-2">
        {certs.map(c => {
          const isAvail = c.status === 'Available';
          const isPending = c.status === 'Pending';
          const isReview = c.status === 'Needs Review';

          return (
            <div
              key={c.id}
              onClick={() => handleToggleStatus(c.id)}
              className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 hover:border-slate-800 transition-all cursor-pointer flex justify-between items-start gap-3"
            >
              <div className="space-y-1">
                <h5 className="font-bold text-slate-200 text-[10px] flex items-center gap-1.5 font-mono">
                  <FileCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {c.name}
                </h5>
                <p className="text-slate-400 text-[9px]">{c.description}</p>
              </div>

              <span className={`shrink-0 px-2 py-0.5 rounded font-mono text-[8px] font-bold ${
                isAvail
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : isReview
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {c.status.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
