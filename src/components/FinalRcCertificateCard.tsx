import React, { useState } from 'react';
import { Award, Copy, Check, Download, AlertCircle } from 'lucide-react';
import { downloadFinalRcCertificate, buildFinalRcClosureCertificateMarkdown } from '../services/internalTestingExportService';
import { RcClosureState } from '../services/rcClosureStateService';

interface FinalRcCertificateCardProps {
  state: RcClosureState;
}

const CERTIFICATE_TEXT = `ORBI Clima IA — Final Release Candidate Closure Certificate

Estado: Final RC Closed
Versión: 1.0.0-rc.1
Powered by ORBI SkyCore™
Tagline: Tu núcleo climático inteligente.

Validaciones:
- QA Center aprobado.
- Android Packaging aprobado.
- Store Readiness aprobado.
- Mobile UX Re-Lock aprobado.
- Privacy Package aprobado.
- Data Safety Draft aprobado.
- Permissions Inventory aprobado.
- Widgets Android verificado.
- Notificaciones locales verificadas.
- Open-Meteo verificado.
- Fallback/offline verificado.
- Directiva HSE Terreno preservada.
- Sin HSEC/HASEC.
- Sin backend.
- Sin login.
- Sin nube.
- Sin secretos expuestos.

Este certificado corresponde al cierre interno de Release Candidate previo a pruebas internas controladas o carga manual en Play Console.`;

export default function FinalRcCertificateCard({
  state
}: FinalRcCertificateCardProps) {
  const [copied, setCopied] = useState(false);
  const isClosed = state.status === 'final_closed';

  const handleCopy = () => {
    navigator.clipboard.writeText(CERTIFICATE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFinalRcCertificate(state);
  };

  return (
    <div className="p-4 rounded-2xl bg-[#090d19]/90 border border-slate-800 font-sans text-left space-y-3.5 relative overflow-hidden">
      {/* Golden Background Glow if Closed */}
      {isClosed && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isClosed ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Certificado Oficial de Cierre RC</h4>
            <p className="text-[10px] text-slate-400">Validación formal y sello SkyCore™</p>
          </div>
        </div>

        {isClosed && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] rounded-lg cursor-pointer transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIADO' : 'COPIAR'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-amber-500/15"
            >
              <Download className="w-3.5 h-3.5" /> DESCARGAR
            </button>
          </div>
        )}
      </div>

      {isClosed ? (
        <div className="border border-amber-500/20 rounded-xl bg-gradient-to-b from-amber-500/5 to-transparent p-4 text-center relative">
          <div className="absolute top-2 right-2 text-amber-400/25 rotate-12 pointer-events-none select-none font-black text-2xl tracking-wider">
            CERTIFIED
          </div>
          
          <pre className="text-left p-3 bg-black/40 rounded-lg border border-slate-800/80 text-[9.5px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-[180px] overflow-y-auto scrollbar-thin">
            {CERTIFICATE_TEXT}
          </pre>
          
          <div className="mt-3 text-[9px] text-amber-400 font-mono text-center">
            ✦ SELLO DE CALIDAD ORBI SKYCORE™ REGISTRADO LOCALMENTE ✦
          </div>
        </div>
      ) : (
        <div className="p-6 border border-dashed border-slate-800 rounded-xl text-center space-y-2.5 bg-slate-900/10">
          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Certificado No Emitido</h5>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
              El certificado de cierre de Release Candidate se generará de manera automática tan pronto como se aprueben todos los requisitos de la compuerta y se firme el cierre de versión.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
