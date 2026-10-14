import React from 'react';
import NativeWidgetParityPreview from './NativeWidgetParityPreview';
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
  activeProfile: _activeProfile,
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
      <div className="flex items-center gap-2.5 px-1 pb-1">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Widgets Android</h2>
          <p className="text-[10px] text-slate-400 font-mono">NATIVE CANVAS V3 · FLUID LAUNCHER</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#090f1e]/40 border border-white/5 space-y-3">
        <span className="text-[9px] font-mono text-cyan-400 block uppercase tracking-wider">Vista previa de paridad nativa V3</span>
        <NativeWidgetParityPreview
          current={currentWeather}
          hourly={hourlyForecast}
          locationName={currentLocationName}
          shortNarrative={skyCoreSummary.recommendationLabel || skyCoreSummary.generalSummary || ''}
          bestWindow={typeof skyCoreSummary.bestWindow === 'string'
            ? skyCoreSummary.bestWindow
            : skyCoreSummary.bestWindow?.startTime && skyCoreSummary.bestWindow?.endTime
              ? `${skyCoreSummary.bestWindow.startTime}–${skyCoreSummary.bestWindow.endTime}`
              : ''}
          weatherSourceState={weatherSourceState}
        />
      </div>

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