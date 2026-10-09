import React, { useState, useEffect } from 'react';
import StoreReadinessPanel from './StoreReadinessPanel';
import ReleaseCandidateQaCenter from './ReleaseCandidateQaCenter';
import AndroidPackagingReadinessPanel from './AndroidPackagingReadinessPanel';
import PublicPolishChecklist from './PublicPolishChecklist';
import InternalTestingReleasePackPanel from './InternalTestingReleasePackPanel';
import PilotFeedbackLoopPanel from './PilotFeedbackLoopPanel';
import FinalStabilizationFreezePanel from './FinalStabilizationFreezePanel';
import AndroidWidgetReadinessPanel from './AndroidWidgetReadinessPanel';
import { ArrowLeft, Cpu, Award, FileCheck2, Library, ShieldCheck, MessageSquare, BadgeCheck, Smartphone, Headphones } from 'lucide-react';
import { ORBI_APP_VERSION } from '../config/orbiAppVersion';
import { getCustomAudioTrack } from '../utils/audioDb';


interface AdvancedOrbiConsoleProps {
  onBack: () => void;
}

export default function AdvancedOrbiConsole({ onBack }: AdvancedOrbiConsoleProps) {
  return (
    <div className="space-y-6 animate-fade-in" id="orbi-advanced-console">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center focus:outline-none"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-sans font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" /> Centro Avanzado ORBI
            </h1>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Herramientas de validación, publicación y control técnico del compilado.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Version Details Card */}
      <div className="p-4 rounded-2xl bg-[#090f1e]/90 border border-cyan-500/10 text-[10px] space-y-3 font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-white/5">
          <Cpu className="w-4 h-4" /> Especificaciones Técnicas del Build (Build Metadata)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-300">
          <div className="flex justify-between border-b border-white/[0.02] pb-1">
            <span className="text-slate-500">App Name:</span>
            <span className="font-bold text-slate-200">{ORBI_APP_VERSION.appName}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.02] pb-1">
            <span className="text-slate-500">Version Label:</span>
            <span className="text-cyan-400 font-bold">{ORBI_APP_VERSION.version}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.02] pb-1">
            <span className="text-slate-500">Version Name:</span>
            <span className="text-slate-200">{ORBI_APP_VERSION.versionName}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.02] pb-1">
            <span className="text-slate-500">Version Code:</span>
            <span className="text-slate-200">{ORBI_APP_VERSION.versionCode}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.02] pb-1">
            <span className="text-slate-500">Build Channel:</span>
            <span className="text-slate-200">{ORBI_APP_VERSION.buildChannel}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.02] pb-1">
            <span className="text-slate-500">Build Date:</span>
            <span className="text-slate-200">{ORBI_APP_VERSION.buildDate}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.02] pb-1 md:col-span-2">
            <span className="text-slate-500">Release Label:</span>
            <span className="text-slate-200 text-right">{ORBI_APP_VERSION.releaseLabel}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.02] pb-1 md:col-span-2">
            <span className="text-slate-500">Creator:</span>
            <span className="text-slate-200 text-right font-bold">{ORBI_APP_VERSION.creator}</span>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 text-[10px] text-slate-400 leading-relaxed font-sans">
        <span className="font-bold text-slate-200 block mb-1">Nota de Control Técnico:</span>
        ORBI Clima IA mantiene la experiencia diaria simple. Estas herramientas avanzadas están separadas para no sobrecargar el uso normal en celular.
      </div>

      {/* Sections list */}
      <div className="space-y-8">
        {/* 1. QA Center */}
        <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
            <Award className="w-4 h-4" /> Módulo 9A — Aseguramiento de Calidad
          </div>
          <ReleaseCandidateQaCenter />
        </div>

        {/* 2. Android Packaging */}
        <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider">
            <Cpu className="w-4 h-4" /> Módulo 9B — Empaquetado y Firma
          </div>
          <AndroidPackagingReadinessPanel />
        </div>

        {/* 3. Store Readiness */}
        <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider">
            <Library className="w-4 h-4" /> Módulo 8B — Google Play Store Readiness
          </div>
          <StoreReadinessPanel />
        </div>

        {/* 4. Internal Testing & Final RC Closure */}
        <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-pink-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Módulo 10 — Internal Testing & Final RC Closure
          </div>
          <InternalTestingReleasePackPanel />
        </div>

        {/* 5. Pilot Feedback & Post-RC Fix Tracker */}
        <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-pink-400 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" /> Módulo 11 — Pilot Feedback & Post-RC Fix Tracker
          </div>
          <PilotFeedbackLoopPanel />
        </div>

        {/* 5.5. Android Widget Synchronization & Technical Specs */}
        <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Smartphone className="w-4 h-4" /> Módulo 6A & 19 — Sincronización y Contrato Técnico de Widgets (Android Glance)
          </div>
          <div className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 space-y-4">
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              En esta sección de ingeniería avanzada, puedes simular y forzar contratos JSON de widgets, verificar el estado de la base de datos de persistencia <strong>Heuristic Memory</strong> y monitorear la comunicación con Android Glance.
            </p>
            <AndroidWidgetReadinessPanel isCompact={false} />
          </div>
        </div>

        {/* 5.6. ORBI Zen Sound Telemetry & Diagnostics */}
        <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Headphones className="w-4 h-4" /> Módulo 9C — ORBI Zen Sound Telemetry & Diagnostics
          </div>
          <OrbiZenSoundDiagnosticsPanel />
        </div>

        {/* 6. Public Polish Checklist */}
        <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <FileCheck2 className="w-4 h-4" /> Módulo 8A — Public Polish Checklist
          </div>
          <PublicPolishChecklist />
        </div>

        {/* 7. Final Stabilization Freeze & Local Release Seal */}
        <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider">
            <BadgeCheck className="w-4 h-4" /> Módulo 12 — Final Stabilization Freeze & Local Release Seal
          </div>
          <FinalStabilizationFreezePanel />
        </div>
      </div>
    </div>
  );
}

function OrbiZenSoundDiagnosticsPanel() {
  const [telemetry, setTelemetry] = useState({
    zenEnabled: false,
    audioSource: 'crystal_arch',
    fileName: 'Ninguno',
    volume: 0.35,
    playbackState: 'Pausado',
    lifecyclePaused: false,
  });

  const updateTelemetry = async () => {
    try {
      const enabled = localStorage.getItem('orbiZenSoundEnabled') === 'true';
      const source = localStorage.getItem('orbiZenSoundTrackId') || 'crystal_arch';
      
      const win = window as any;
      const audio = win._orbiZenAudio;
      
      let playState = 'Inactivo';
      let rawVolume = 0.35;
      if (audio) {
        playState = audio.paused ? 'Pausado' : 'Reproduciendo';
        rawVolume = audio.volume;
      }

      // Read custom file name from DB if source is custom
      let customName = 'Ninguno';
      if (source === 'custom') {
        const track = await getCustomAudioTrack();
        if (track) {
          customName = track.name;
        }
      }

      setTelemetry({
        zenEnabled: enabled,
        audioSource: source,
        fileName: customName,
        volume: rawVolume,
        playbackState: playState,
        lifecyclePaused: document.hidden,
      });
    } catch (e) {
      console.warn('Telemetry check failed:', e);
    }
  };

  useEffect(() => {
    updateTelemetry();
    const interval = setInterval(updateTelemetry, 1000);
    window.addEventListener('orbi_zen_sound_preference_changed', updateTelemetry);
    document.addEventListener('visibilitychange', updateTelemetry);

    return () => {
      clearInterval(interval);
      window.removeEventListener('orbi_zen_sound_preference_changed', updateTelemetry);
      document.removeEventListener('visibilitychange', updateTelemetry);
    };
  }, []);

  return (
    <div className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 space-y-3 font-mono text-[10px]">
      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
        <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">ORBI Zen Sound Telemetry & Diagnostics</span>
        <span className="text-[9px] text-slate-500">Live Telemetry</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
        <div className="flex justify-between border-b border-white/[0.02] pb-1">
          <span className="text-slate-500">zenEnabled:</span>
          <span className={`font-bold ${telemetry.zenEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
            {telemetry.zenEnabled ? 'TRUE' : 'FALSE'}
          </span>
        </div>
        <div className="flex justify-between border-b border-white/[0.02] pb-1">
          <span className="text-slate-500">audioSource:</span>
          <span className="text-slate-100 font-semibold">{telemetry.audioSource}</span>
        </div>
        <div className="flex justify-between border-b border-white/[0.02] pb-1">
          <span className="text-slate-500">fileName:</span>
          <span className="text-slate-100 truncate max-w-[120px] font-semibold" title={telemetry.fileName}>
            {telemetry.fileName}
          </span>
        </div>
        <div className="flex justify-between border-b border-white/[0.02] pb-1">
          <span className="text-slate-500">volume:</span>
          <span className="text-slate-100 font-semibold">{telemetry.volume.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-white/[0.02] pb-1">
          <span className="text-slate-500">playbackState:</span>
          <span className={`font-bold ${telemetry.playbackState === 'Reproduciendo' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
            {telemetry.playbackState.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between border-b border-white/[0.02] pb-1">
          <span className="text-slate-500">lifecyclePaused:</span>
          <span className={`font-bold ${telemetry.lifecyclePaused ? 'text-amber-400' : 'text-slate-400'}`}>
            {telemetry.lifecyclePaused ? 'TRUE' : 'FALSE'}
          </span>
        </div>
      </div>
    </div>
  );
}

export { StoreReadinessPanel, ReleaseCandidateQaCenter, AndroidPackagingReadinessPanel, PublicPolishChecklist, InternalTestingReleasePackPanel, PilotFeedbackLoopPanel, FinalStabilizationFreezePanel };
