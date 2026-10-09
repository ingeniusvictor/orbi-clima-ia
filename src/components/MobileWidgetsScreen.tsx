import React from 'react';
import WidgetsPreviews from './WidgetsPreviews';
import AndroidWidgetReadinessPanel from './AndroidWidgetReadinessPanel';
import { Smartphone } from 'lucide-react';

interface MobileWidgetsScreenProps {
  currentWeather: any;
  hourlyForecast: any[];
  currentLocationName: string;
  skyCoreSummary: any;
  activeProfile: any;
  weatherSourceState: any;
}

export default function MobileWidgetsScreen({
  currentWeather,
  hourlyForecast,
  currentLocationName,
  skyCoreSummary,
  activeProfile,
  weatherSourceState
}: MobileWidgetsScreenProps) {
  return (
    <div 
      className="space-y-6 animate-fade-in" 
      id="orbi-mobile-widgets-screen"
      style={{
        paddingBottom: 'calc(110px + env(safe-area-inset-bottom))',
        paddingTop: 'env(safe-area-inset-top)'
      }}
    >
      {/* Tab Header */}
      <div className="flex items-center gap-2.5 px-1 pb-1">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Widgets Android</h2>
          <p className="text-[10px] text-slate-400 font-mono">SIMULADOR COMPACTO JETPACK GLANCE</p>
        </div>
      </div>

      {/* 1. Widgets Preview Component (Uncollapsed) */}
      <div className="p-4 rounded-2xl bg-[#090f1e]/40 border border-white/5 space-y-3">
        <span className="text-[9px] font-mono text-cyan-400 block uppercase tracking-wider">Simulador Visual de Pantalla de Inicio</span>
        <WidgetsPreviews
          current={currentWeather}
          hourly={hourlyForecast}
          locationName={currentLocationName}
          riskLevel={skyCoreSummary.riskLevel}
          shortNarrative={skyCoreSummary.recommendationLabel}
          bestWindow={skyCoreSummary.bestWindow}
          activeProfile={activeProfile}
          weatherSourceState={weatherSourceState}
        />
      </div>

      {/* 2. Compact Sync / Control Panel */}
      <div className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5">
        <AndroidWidgetReadinessPanel
          lastUpdatedTrigger={weatherSourceState.lastUpdated}
          currentContract={null}
          isCompact={true}
        />
      </div>
    </div>
  );
}
export type { MobileWidgetsScreenProps };
