import React, { useState, useEffect } from 'react';
import { Sliders, Shield, Brain, Cpu, Info } from 'lucide-react';
import PreferredLocationCard from './PreferredLocationCard';
import ProfilePreferenceCard from './ProfilePreferenceCard';
import WidgetPreferenceCard from './WidgetPreferenceCard';
import FxQualitySettingsCard from './FxQualitySettingsCard';
import AlertSensitivityCard from './AlertSensitivityCard';
import PrivacyTrustCard from './PrivacyTrustCard';
import WeatherMemoryPanel from './WeatherMemoryPanel';
import DeveloperModeGate, { isDeveloperModeEnabled } from './DeveloperModeGate';
import CompactSectionCard from './CompactSectionCard';
import OrbiZenSoundSettingsCard from './OrbiZenSoundSettingsCard';
import { loadFinalReleaseSealState } from '../services/finalReleaseSealService';
import { ORBI_APP_VERSION } from '../config/orbiAppVersion';

interface MobileSettingsScreenProps {
  currentLocation: any;
  weatherSourceState: any;
  onOpenAdvancedConsole: () => void;
}

export default function MobileSettingsScreen({
  currentLocation,
  weatherSourceState,
  onOpenAdvancedConsole
}: MobileSettingsScreenProps) {
  const [devModeActive, setDevModeActive] = useState(() => isDeveloperModeEnabled());
  const [sealState, setSealState] = useState(() => loadFinalReleaseSealState());

  useEffect(() => {
    const checkDevMode = () => {
      setDevModeActive(isDeveloperModeEnabled());
    };
    const handleSealChange = () => {
      setSealState(loadFinalReleaseSealState());
    };
    window.addEventListener('orbi_dev_mode_changed', checkDevMode);
    window.addEventListener('orbi_release_seal_changed', handleSealChange);
    return () => {
      window.removeEventListener('orbi_dev_mode_changed', checkDevMode);
      window.removeEventListener('orbi_release_seal_changed', handleSealChange);
    };
  }, []);

  return (
    <div 
      className="space-y-6 animate-fade-in" 
      id="orbi-mobile-settings-screen"
      style={{
        paddingBottom: 'calc(110px + env(safe-area-inset-bottom))',
        paddingTop: 'env(safe-area-inset-top)'
      }}
    >
      {/* Tab Header */}
      <div className="flex items-center gap-2.5 px-1 pb-1">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Ajustes Generales</h2>
          <p className="text-[10px] text-slate-400 font-mono">PREFERENCIAS DE USUARIO Y PRIVACIDAD</p>
        </div>
      </div>

      {/* 1. Preferred Location & Profile Defaults */}
      <CompactSectionCard
        title="Perfil y Estación Favorita"
        subtitle="Configurar perfil por defecto y estación de inicio"
        status="Guardado"
        icon={<Sliders className="w-4 h-4 text-cyan-400" />}
      >
        <div className="space-y-4 text-left">
          <PreferredLocationCard
            currentLocation={currentLocation}
            weatherSourceMode={weatherSourceState.mode as any}
          />
          <ProfilePreferenceCard />
        </div>
      </CompactSectionCard>

      {/* 2. Visual Layouts & Sensitive Alert Filters */}
      <CompactSectionCard
        title="Filtros y Personalización"
        subtitle="Sensibilidad de avisos y estilo de widgets preferido"
        status="Sincronizado"
        icon={<Sliders className="w-4 h-4 text-pink-400" />}
      >
        <div className="space-y-4 text-left">
          <WidgetPreferenceCard />
          <FxQualitySettingsCard />
          <OrbiZenSoundSettingsCard />
          <AlertSensitivityCard />
        </div>
      </CompactSectionCard>

      {/* 3. Local Privacy and Trust Card */}
      <CompactSectionCard
        title="Seguridad y Privacidad"
        subtitle="Políticas de retención y control de cookies"
        status="Seguro"
        icon={<Shield className="w-4 h-4 text-emerald-400" />}
      >
        <div className="text-left">
          <PrivacyTrustCard />
        </div>
      </CompactSectionCard>

      {/* 4. Local Climate Memory Panel */}
      <CompactSectionCard
        title="Memoria Climática"
        subtitle="Lugares más buscados, perfiles y estadísticas locales"
        status="Activa"
        icon={<Brain className="w-4 h-4 text-teal-400" />}
      >
        <div className="text-left">
          <WeatherMemoryPanel />
        </div>
      </CompactSectionCard>

      {/* 5. Developer Mode Control */}
      <DeveloperModeGate onStateChange={setDevModeActive} />

      {/* 6. Advanced Center Shortcut */}
      {devModeActive && (
        <div className="space-y-3">
          <button
            onClick={onOpenAdvancedConsole}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 border border-white/10 text-white font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer shadow-lg focus:outline-none"
          >
            <Cpu className="w-4 h-4" /> ABRIR CENTRO AVANZADO ORBI ➔
          </button>

          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">Estado de versión:</span>
            <span className={`font-bold ${sealState.localSealIssued ? 'text-emerald-400' : 'text-amber-400'}`}>
              v1.0 Local Release Seal — {sealState.localSealIssued ? 'Emitido' : 'Pendiente'}
            </span>
          </div>
        </div>
      )}

      {/* 7. Acerca de la aplicación */}
      <div className="p-4 rounded-2xl bg-[#0a1122]/30 border border-white/5 text-left space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-sans font-bold text-slate-100 tracking-wider uppercase">Acerca de la Aplicación</h3>
        </div>
        <div className="p-3.5 rounded-xl bg-[#050914]/60 border border-white/[0.03] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">{ORBI_APP_VERSION.appName}</span>
            <span className="text-[9px] font-mono font-black text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">{ORBI_APP_VERSION.buildChannel}</span>
          </div>
          <div className="text-[11px] space-y-1 text-slate-400 font-sans">
            <div className="flex justify-between">
              <span>Versión:</span>
              <span className="font-mono text-slate-300 font-bold">{ORBI_APP_VERSION.version}</span>
            </div>
            <div className="flex justify-between">
              <span>Build Channel:</span>
              <span className="font-mono text-slate-300">{ORBI_APP_VERSION.buildChannel}</span>
            </div>
            <div className="flex justify-between">
              <span>Tecnología:</span>
              <span className="text-slate-300 font-medium">{ORBI_APP_VERSION.poweredBy}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/[0.03] text-[10px]">
              <span>Creador:</span>
              <span className="text-slate-400 font-medium">{ORBI_APP_VERSION.creator}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
