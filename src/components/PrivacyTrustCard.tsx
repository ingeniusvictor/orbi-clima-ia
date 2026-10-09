import React, { useState } from 'react';
import { ShieldCheck, EyeOff, Radio, CloudOff, UserX, MapPin, Eraser, Eye, Copy, Check, FileText, Database } from 'lucide-react';
import { getPrivacyDisclosureText } from '../utils/privacyDisclosureBuilder';
import { loadWeatherMemory } from '../services/weatherMemoryService';
import MemoryPrivacyCard from './MemoryPrivacyCard';

export default function PrivacyTrustCard() {
  const [activeTab, setActiveTab] = useState<'principles' | 'policy' | 'datasafety' | 'memory'>('principles');
  const [copied, setCopied] = useState(false);
  const [memory, setMemory] = useState(() => loadWeatherMemory());

  const privacyText = getPrivacyDisclosureText();

  const handleCopyPolicy = () => {
    navigator.clipboard.writeText(privacyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshMemory = () => {
    setMemory(loadWeatherMemory());
  };

  const principles = [
    { label: 'Sin cuentas ni perfiles en la nube', icon: UserX },
    { label: 'Sin backend ni almacenamiento remoto', icon: CloudOff },
    { label: 'Sin tracking ni telemetría comercial', icon: EyeOff },
    { label: 'Ubicación GPS opcional y con permiso directo', icon: MapPin },
    { label: 'Toda la memoria local es editable y eliminable', icon: Eraser },
    { label: 'Procesamiento de datos 100% en el dispositivo', icon: ShieldCheck },
  ];

  return (
    <div id="privacy-trust-card" className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#070b13]/85 border border-slate-800 flex flex-col gap-4 font-sans shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Privacidad y Datos</h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Centro de Transparencia Local de ORBI</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1 bg-[#060a12]/80 p-1 rounded-xl border border-slate-800/60 text-[11px]">
          <button
            onClick={() => setActiveTab('principles')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'principles' ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Principios
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'policy' ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Política Borrador
          </button>
          <button
            onClick={() => setActiveTab('datasafety')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'datasafety' ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Data Safety
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'memory' ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Memoria
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'principles' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            ORBI Clima IA guarda preferencias, histórico de uso y memoria climática de forma estricta <strong>solo en este dispositivo</strong>. Puedes exportar o borrar toda esta información en cualquier momento desde el panel de preferencias.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5">
            {principles.map((point, index) => {
              const Icon = point.icon;
              return (
                <div key={index} className="flex items-center gap-2 p-2 rounded-xl bg-[#090d19] border border-white/5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10.5px] font-medium text-slate-300 leading-tight">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'policy' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl border border-slate-900">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Borrador Técnico de Privacidad
            </span>
            <button
              onClick={handleCopyPolicy}
              className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-slate-800/80 max-h-48 overflow-y-auto text-[11px] text-slate-300 font-sans leading-relaxed space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
            {privacyText.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'datasafety' && (
        <div className="space-y-3">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 text-[10px] text-slate-400 font-sans leading-relaxed">
            <span className="font-bold text-emerald-400 block mb-1 uppercase tracking-wider">Resumen de Declaración (Data Safety)</span>
            Esta sección describe cómo la app gestiona la recopilación y transferencia de datos para la Play Store de Google de forma 100% transparente:
          </div>

          <div className="space-y-2 text-[11px] font-sans">
            <div className="p-2 bg-slate-950/40 border border-slate-900 rounded-lg">
              <strong className="text-slate-200">📍 Ubicación aproximada / precisa:</strong>
              <p className="text-slate-400 mt-0.5">Se usa únicamente de forma anónima para descargar el clima local desde Open-Meteo. No se almacena de forma remota.</p>
            </div>
            <div className="p-2 bg-slate-950/40 border border-slate-900 rounded-lg">
              <strong className="text-slate-200">⚙️ Configuración y Preferencias:</strong>
              <p className="text-slate-400 mt-0.5">Guardadas localmente en el dispositivo. No se comparten con ningún servidor ni tracker publicitario.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'memory' && (
        <div className="pt-1">
          <MemoryPrivacyCard memory={memory} onRefresh={refreshMemory} />
        </div>
      )}
    </div>
  );
}
