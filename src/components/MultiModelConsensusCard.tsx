import type { ReactNode } from 'react';
import { CloudRain, GitCompareArrows, Thermometer, Wind } from 'lucide-react';
import { MultiModelConsensusReport } from '../services/openMeteoMultiModelService';

interface MultiModelConsensusCardProps {
  report: MultiModelConsensusReport | null;
  loading?: boolean;
}

function agreementClasses(band?: MultiModelConsensusReport['agreementBand']) {
  switch (band) {
    case 'high': return 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10';
    case 'moderate': return 'text-amber-300 border-amber-500/25 bg-amber-500/10';
    case 'low': return 'text-orange-300 border-orange-500/30 bg-orange-500/10';
    default: return 'text-slate-300 border-white/10 bg-white/5';
  }
}

function conditionLabel(group: string): string {
  const labels: Record<string, string> = {
    despejado: 'Despejado',
    mayormente_despejado: 'Mayormente despejado',
    parcial: 'Parcial',
    nublado: 'Nublado',
    niebla: 'Niebla',
    llovizna: 'Llovizna',
    llovizna_engelante: 'Llovizna engelante',
    lluvia: 'Lluvia',
    lluvia_engelante: 'Lluvia engelante',
    chubascos: 'Chubascos',
    nieve: 'Nieve',
    nieve_chubascos: 'Chubascos de nieve',
    tormenta: 'Tormenta',
    otro: 'Otro',
    sin_dato: 'Sin dato',
  };
  return labels[group] ?? group;
}

function valueOrDash(value: number | null, unit: string): string {
  return value === null ? '—' : `${value.toFixed(1)} ${unit}`;
}

export default function MultiModelConsensusCard({ report, loading = false }: MultiModelConsensusCardProps) {
  if (loading && !report) {
    return (
      <div className="p-4 rounded-2xl bg-[#090f1e]/70 border border-white/5 text-xs text-slate-400">
        Comparando ECMWF · GFS · ICON · ACCESS…
      </div>
    );
  }

  if (!report) return null;

  return (
    <section className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 space-y-3" aria-label="Consenso de modelos meteorológicos">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <GitCompareArrows className="w-4 h-4 text-indigo-400 mt-0.5" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">True Multi-Model</p>
            <p className="text-sm font-semibold text-white">Consenso de modelos globales</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{report.availableModels}/{report.requestedModels} modelos disponibles</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-xl border text-[9px] font-bold text-right ${agreementClasses(report.agreementBand)}`}>
          {report.agreementScore === null ? report.agreementLabel : `${report.agreementLabel} · ${report.agreementScore}/100`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric icon={<Thermometer className="w-3 h-3" />} label="Spread temp." value={valueOrDash(report.temperatureSpreadNowC, '°C')} />
        <Metric icon={<CloudRain className="w-3 h-3" />} label="Spread lluvia 6 h" value={valueOrDash(report.precipitationSpread6hMm, 'mm')} />
        <Metric icon={<Wind className="w-3 h-3" />} label="Spread viento" value={valueOrDash(report.windSpreadNowKmh, 'km/h')} />
      </div>

      <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
        <p className="text-[10px] font-semibold text-indigo-200">{report.precipitationConsensusLabel}</p>
        <p className="text-[10px] leading-relaxed text-slate-300">{report.interpretation}</p>
      </div>

      <div className="space-y-1.5">
        {report.models.map(model => (
          <div key={model.modelId} className="grid grid-cols-[1.45fr_0.8fr_0.8fr] items-center gap-2 px-2.5 py-2 rounded-xl bg-white/5 border border-white/5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-200 truncate">{model.label}</p>
              <p className="text-[8px] font-mono text-slate-500 uppercase">{model.provider} · {model.available ? conditionLabel(model.currentConditionGroup) : 'No disponible'}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-mono uppercase text-slate-500">Ahora</p>
              <p className="text-[10px] font-bold text-white">{model.currentTemperatureC === null ? '—' : `${model.currentTemperatureC.toFixed(1)}°`}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-mono uppercase text-slate-500">Lluvia 6 h</p>
              <p className="text-[10px] font-bold text-white">{model.precipitationNext6hMm === null ? '—' : `${model.precipitationNext6hMm.toFixed(1)} mm`}</p>
            </div>
          </div>
        ))}
      </div>

      <details>
        <summary className="cursor-pointer text-[9px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-300">Qué significa este consenso</summary>
        <div className="mt-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-[9px] text-slate-500 leading-relaxed space-y-1">
          <p>{report.sourceLabel}.</p>
          <p>• Son modelos meteorológicos reales de instituciones diferentes; no son copias perturbadas de una misma predicción.</p>
          <p>• El score mide acuerdo entre modelos, no exactitud frente al clima real.</p>
          <p>• ORBI no elige todavía un “modelo ganador” por este score. La selección por desempeño requiere verificar forecasts emitidos contra observaciones posteriores.</p>
        </div>
      </details>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-1 text-slate-500">{icon}<span className="text-[8px] font-mono uppercase">{label}</span></div>
      <p className="text-[10px] font-bold text-white mt-1">{value}</p>
    </div>
  );
}
