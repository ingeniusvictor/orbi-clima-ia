import type { ReactNode } from 'react';
import { CloudRain, Droplets, Eye, Gauge, MapPin, Radio, Thermometer, Wind } from 'lucide-react';
import { DmcObservationSnapshot, ObservationComparison } from '../services/dmcObservationService';

interface DmcObservationCardProps {
  observation: DmcObservationSnapshot | null;
  comparison: ObservationComparison | null;
  loading?: boolean;
}

function agreementClasses(band?: ObservationComparison['band']) {
  switch (band) {
    case 'close': return 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10';
    case 'mixed': return 'text-amber-300 border-amber-500/25 bg-amber-500/10';
    case 'divergent': return 'text-orange-300 border-orange-500/30 bg-orange-500/10';
    default: return 'text-slate-300 border-white/10 bg-white/5';
  }
}

function qualityLabel(observation: DmcObservationSnapshot): string {
  switch (observation.quality) {
    case 'strong': return 'CERCANA / RECIENTE';
    case 'contextual': return 'REFERENCIA REGIONAL';
    case 'stale': return 'DATO ANTIGUO';
    default: return 'ESTACIÓN DISTANTE';
  }
}

function formatAge(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes > 999) return 'edad desconocida';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `hace ${hours} h ${remainder} min` : `hace ${hours} h`;
}

function formatNumber(value: number | null, unit: string, digits = 0): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)} ${unit}`;
}

function deltaText(value: number | null, unit: string): string {
  if (value === null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} ${unit}`;
}

function precipitationComparisonLabel(signal: ObservationComparison['precipitationSignal']): string {
  switch (signal) {
    case 'agree_wet': return 'Ambos detectan precipitación';
    case 'agree_dry': return 'Ambos sin precipitación activa';
    case 'station_wetter': return 'Estación más húmeda que modelo';
    case 'model_wetter': return 'Modelo más húmedo que estación';
    default: return 'Sin comparación';
  }
}

export default function DmcObservationCard({ observation, comparison, loading = false }: DmcObservationCardProps) {
  if (loading && !observation) {
    return (
      <div className="p-4 rounded-2xl bg-[#090f1e]/70 border border-white/5 text-xs text-slate-400">
        Buscando estación oficial DMC cercana…
      </div>
    );
  }

  if (!observation) return null;

  return (
    <section className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 space-y-3" aria-label="Observación oficial DMC cercana">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Radio className="w-4 h-4 text-cyan-400 mt-0.5" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Observación oficial · DMC</p>
            <p className="text-sm font-semibold text-white">{observation.stationName}</p>
            <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{observation.distanceKm.toFixed(1)} km · {formatAge(observation.ageMinutes)}</span>
            </div>
          </div>
        </div>
        <span className="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/15 text-[8px] font-mono text-cyan-300 text-right">
          {qualityLabel(observation)}
        </span>
      </div>

      {observation.presentWeatherLabel && (
        <div className="px-3 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
          <p className="text-[9px] font-mono uppercase text-slate-500">Tiempo presente reportado</p>
          <p className="text-xs font-semibold text-cyan-100 mt-0.5">{observation.presentWeatherLabel}</p>
          {observation.presentWeatherRaw && (
            <p className="text-[9px] text-slate-500 mt-1 line-clamp-2">WMO: {observation.presentWeatherRaw}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Metric icon={<Thermometer className="w-3 h-3" />} label="Temperatura" value={formatNumber(observation.temperatureC, '°C', 1)} />
        <Metric icon={<Droplets className="w-3 h-3" />} label="Humedad" value={formatNumber(observation.humidityPct, '%', 0)} />
        <Metric icon={<Wind className="w-3 h-3" />} label="Viento" value={formatNumber(observation.windSpeedKmh, 'km/h', 1)} />
        <Metric icon={<Gauge className="w-3 h-3" />} label="Presión" value={formatNumber(observation.pressureHpa, 'hPa', 1)} />
        <Metric icon={<Eye className="w-3 h-3" />} label="Visibilidad" value={observation.visibilityM === null ? '—' : observation.visibilityM >= 1000 ? `${(observation.visibilityM / 1000).toFixed(1)} km` : `${Math.round(observation.visibilityM)} m`} />
        <Metric icon={<CloudRain className="w-3 h-3" />} label="Precip. reciente" value={formatNumber(observation.precipitationRecentMm, 'mm', 1)} />
      </div>

      {comparison && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Estación DMC vs modelo ORBI</p>
              <p className="text-[10px] text-slate-400">No es un puntaje de exactitud absoluta; mide concordancia entre dos puntos/fuentes.</p>
            </div>
            <span className={`px-2 py-1 rounded-lg border text-[9px] font-bold ${agreementClasses(comparison.band)}`}>
              {comparison.score === null ? comparison.label : `${comparison.label} · ${comparison.score}/100`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Delta label="Δ Temperatura" value={deltaText(comparison.temperatureDeltaC, '°C')} />
            <Delta label="Δ Humedad" value={deltaText(comparison.humidityDeltaPct, 'pp')} />
            <Delta label="Δ Viento" value={deltaText(comparison.windDeltaKmh, 'km/h')} />
            <Delta label="Δ Presión" value={deltaText(comparison.pressureDeltaHpa, 'hPa')} />
          </div>

          <div className={`p-2.5 rounded-xl border ${agreementClasses(comparison.band)} text-[10px] leading-relaxed`}>
            <p className="font-semibold">{precipitationComparisonLabel(comparison.precipitationSignal)}</p>
            <p className="mt-1 opacity-90">{comparison.interpretation}</p>
          </div>
        </div>
      )}

      <details>
        <summary className="cursor-pointer text-[9px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-300">Fuente y limitaciones</summary>
        <div className="mt-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-[9px] text-slate-500 leading-relaxed space-y-1">
          <p>{observation.sourceLabel} · WIGOS {observation.stationId}.</p>
          {observation.limitations.map((item, index) => <p key={index}>• {item}</p>)}
        </div>
      </details>
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

function Delta({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/5">
      <p className="text-[8px] font-mono uppercase text-slate-500">{label}</p>
      <p className="text-[10px] font-bold text-slate-200 mt-0.5">{value}</p>
    </div>
  );
}
