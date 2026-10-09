import type { ReactNode } from 'react';
import { Droplets, Eye, Gauge, SunMedium } from 'lucide-react';
import { CurrentWeather } from '../types/weatherTypes';

type MicroclimateWeather = CurrentWeather & {
  dewPointC?: number;
  dewPointDepressionC?: number;
  visibilityM?: number;
  shortwaveRadiationWm2?: number;
  conditionLabel?: string;
};

interface MicroclimateCardProps {
  current: CurrentWeather;
}

function formatVisibility(meters?: number): string {
  if (meters === undefined || !Number.isFinite(meters)) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

function saturationLabel(depression?: number): { label: string; note: string } {
  if (depression === undefined || !Number.isFinite(depression)) {
    return { label: 'Sin dato', note: 'Punto de rocío no disponible.' };
  }
  if (depression <= 1) {
    return {
      label: 'Muy cerca de saturación',
      note: 'El aire está muy cerca del punto de rocío. Superficies más frías pueden presentar condensación; debe verificarse físicamente.',
    };
  }
  if (depression <= 3) {
    return {
      label: 'Cerca de saturación',
      note: 'Existe margen térmico pequeño respecto del punto de rocío. En terreno conviene vigilar niebla, rocío y condensación superficial.',
    };
  }
  return {
    label: 'Margen estable',
    note: 'La temperatura está suficientemente separada del punto de rocío para que la saturación inmediata sea menos probable.',
  };
}

export default function MicroclimateCard({ current }: MicroclimateCardProps) {
  const data = current as MicroclimateWeather;
  const saturation = saturationLabel(data.dewPointDepressionC);

  return (
    <section className="p-4 rounded-2xl bg-[#090f1e]/75 border border-white/5 space-y-3" aria-label="Microclima local modelado">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Microclima</p>
            <p className="text-sm font-semibold text-white">Humedad, rocío y visibilidad</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/15 text-[9px] font-mono text-cyan-300 uppercase">
          modelado
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric icon={<Droplets className="w-3 h-3" />} label="Punto de rocío" value={data.dewPointC === undefined ? '—' : `${data.dewPointC.toFixed(1)} °C`} />
        <Metric icon={<Gauge className="w-3 h-3" />} label="Margen al rocío" value={data.dewPointDepressionC === undefined ? '—' : `${data.dewPointDepressionC.toFixed(1)} °C`} />
        <Metric icon={<Eye className="w-3 h-3" />} label="Visibilidad" value={formatVisibility(data.visibilityM)} />
        <Metric icon={<SunMedium className="w-3 h-3" />} label="Radiación GHI" value={data.shortwaveRadiationWm2 === undefined ? '—' : `${Math.round(data.shortwaveRadiationWm2)} W/m²`} />
      </div>

      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] leading-relaxed text-slate-300">
        <p className="font-semibold text-white">{saturation.label}</p>
        <p className="mt-1">{saturation.note}</p>
        <p className="text-slate-500 mt-1">Estas señales describen el aire/modelo en la celda meteorológica; no sustituyen una medición de superficie o sensor en sitio.</p>
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-1 text-slate-500">{icon}<span className="text-[9px] font-mono uppercase">{label}</span></div>
      <p className="text-xs font-bold text-white mt-1">{value}</p>
    </div>
  );
}
