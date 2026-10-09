import type { ReactNode } from 'react';
import { BarChart3, CloudRain, Thermometer, Wind } from 'lucide-react';
import { ForecastUncertaintyReport } from '../services/openMeteoEnsembleService';

interface ForecastUncertaintyCardProps {
  report: ForecastUncertaintyReport | null;
  loading?: boolean;
}

function bandClasses(band?: ForecastUncertaintyReport['band']) {
  switch (band) {
    case 'low': return 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10';
    case 'moderate': return 'text-amber-300 border-amber-500/25 bg-amber-500/10';
    case 'high':
    case 'very_high': return 'text-orange-300 border-orange-500/25 bg-orange-500/10';
    default: return 'text-slate-300 border-white/10 bg-white/5';
  }
}

export default function ForecastUncertaintyCard({ report, loading = false }: ForecastUncertaintyCardProps) {
  if (loading && !report) {
    return <div className="p-4 rounded-2xl bg-[#090f1e]/70 border border-white/5 text-xs text-slate-400">Calculando dispersión del ensemble…</div>;
  }
  if (!report) return null;

  return (
    <section className="p-4 rounded-2xl bg-[#090f1e]/75 border border-white/5 space-y-3" aria-label="Incertidumbre del pronóstico">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Ensemble 0–6 h</p>
            <p className="text-sm font-semibold text-white">Incertidumbre del pronóstico</p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${bandClasses(report.band)}`}>
          {report.label}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric icon={<Thermometer className="w-3 h-3" />} label="Temp." value={report.temperatureSpread6hC} unit="°C σ" />
        <Metric icon={<CloudRain className="w-3 h-3" />} label="Precip." value={report.precipitationSpread6hMm} unit="mm σ" />
        <Metric icon={<Wind className="w-3 h-3" />} label="Viento" value={report.windSpread6hKmh} unit="km/h σ" />
      </div>

      <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[10px] leading-relaxed text-slate-300">
        <p>{report.interpretation}</p>
        <p className="text-slate-500 mt-1">Índice de estabilidad del ensemble: {report.stabilityScore}/100 · {report.sourceLabel}.</p>
      </div>
    </section>
  );
}

function Metric({ icon, label, value, unit }: { icon: ReactNode; label: string; value: number | null; unit: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-1 text-slate-500">{icon}<span className="text-[9px] font-mono uppercase">{label}</span></div>
      <p className="text-xs font-bold text-white mt-1">{value === null ? '—' : value.toFixed(1)} <span className="text-[9px] font-normal text-slate-500">{unit}</span></p>
    </div>
  );
}
