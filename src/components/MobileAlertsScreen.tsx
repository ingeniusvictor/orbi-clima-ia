import React from 'react';
import SmartAlertsPanel from './SmartAlertsPanel';
import NotificationSettingsPanel from './NotificationSettingsPanel';
import SmartSchedulerPanel from './SmartSchedulerPanel';
import CompactSectionCard from './CompactSectionCard';
import { Bell, Sliders, ShieldCheck } from 'lucide-react';

interface MobileAlertsScreenProps {
  smartAlerts: any[];
  hourlyForecast: any[];
  activeProfile: any;
  weatherSourceState: any;
}

export default function MobileAlertsScreen({
  smartAlerts,
  hourlyForecast,
  activeProfile,
  weatherSourceState
}: MobileAlertsScreenProps) {
  return (
    <div
      className="space-y-6 animate-fade-in"
      id="orbi-mobile-alerts-screen"
      style={{
        paddingBottom: 'calc(110px + env(safe-area-inset-bottom))',
        paddingTop: 'env(safe-area-inset-top)'
      }}
    >
      <div className="flex items-center gap-2.5 px-1 pb-1">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Centro de Alertas</h2>
          <p className="text-[10px] text-slate-400 font-mono">NUEVAS · ACTIVAS · HISTORIAL</p>
        </div>
      </div>

      <SmartAlertsPanel
        alerts={smartAlerts}
        hourly={hourlyForecast}
        profile={activeProfile}
      />

      <CompactSectionCard
        title="Canales de Notificaciones"
        subtitle="Elige cómo quieres recibir los avisos"
        status="Sincronizado"
        icon={<Sliders className="w-4 h-4 text-cyan-400" />}
      >
        <NotificationSettingsPanel />
      </CompactSectionCard>

      <CompactSectionCard
        title="Horario Silencioso"
        subtitle="Define cuándo ORBI puede evitar interrupciones"
        status="Configurado"
        icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
      >
        <SmartSchedulerPanel
          weatherMode={weatherSourceState.mode as any}
          lastUpdatedStr={weatherSourceState.lastUpdated}
        />
      </CompactSectionCard>
    </div>
  );
}
export type { MobileAlertsScreenProps };
