import type { ReactNode } from 'react';
import { Award, Clock3, CloudRain, Target, Thermometer, Wind } from 'lucide-react';
import { ModelSkillRow, ModelSkillSummary } from '../services/modelForecastVerificationService';

interface ModelForecastSkillCardProps {
  summary: ModelSkillSummary;
}

function scoreClasses(row: ModelSkillRow): string {
  switch (row.skillBand) {
    case 'strong': return 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10';
    case 'acceptable': return 'text-cyan-300 border-cyan-500/25 bg-cyan-500/10';
    case 'variable': return 'text-amber-300 border-amber-500/25 bg-amber-500/10';
    case 'weak': return 'text-orange-300 border-orange-500/30 bg-orange-500/10';
    default: return 'text-slate-400 border-white/10 bg-white/5';
  }
}

function metric(value: number | null, unit: string): string {
  return value === null ? '—' : `${value.toFixed(1)} ${unit}`;
}

export default function ModelForecastSkillCard({ summary }: ModelForecastSkillCardProps) {
  const hasVerified = summary.verifiedForecasts > 0;

  return (
    <section className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 space-y-3" aria-label="Verificación prospectiva de modelos">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-violet-400 mt-0.5" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-violet-300">Forecast Skill Lab</p>
            <p className="text-sm font-semibold text-white">Verificación prospectiva por modelo</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Predice primero · observa después · mide el error</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-lg border border-violet-500/20 bg-violet-500/10 text-[9px] font-mono text-violet-300 text-right">
          {summary.rankingLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-1 text-slate-500"><Clock3 className="w-3 h-3" /><span className="text-[8px] font-mono uppercase">Forecasts pendientes</span></div>
          <p className="text-sm font-bold text-white mt-1">{summary.pendingForecasts}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-1 text-slate-500"><Target className="w-3 h-3" /><span className="text-[8px] font-mono uppercase">Verificados</span></div>
          <p className="text-sm font-bold text-white mt-1">{summary.verifiedForecasts}</p>
        </div>
      </div>

      {!hasVerified ? (
        <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 text-[10px] leading-relaxed text-slate-300">
          ORBI acaba de iniciar la calibración prospectiva. Los forecasts +1 h, +3 h y +6 h quedan congelados hasta que llegue una observación DMC correspondiente. No se genera ranking con datos retrospectivos ni con el clima “actual”.
        </div>
      ) : (
        <div className="space-y-2">
          {summary.models.map((row, index) => (
            <div key={row.modelId} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {index === 0 && summary.rankingStatus !== 'calibrating' ? <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" /> : null}
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-100 truncate">{row.label}</p>
                    <p className="text-[8px] font-mono uppercase text-slate-500">{row.provider} · {row.evidenceLabel}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg border text-[9px] font-bold ${scoreClasses(row)}`}>
                  {row.skillScore === null ? 'Sin score' : `${row.skillScore}/100`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <MiniMetric icon={<Thermometer className="w-2.5 h-2.5" />} label="MAE T°" value={metric(row.temperatureMaeC, '°C')} />
                <MiniMetric icon={<Wind className="w-2.5 h-2.5" />} label="MAE viento" value={metric(row.windMaeKmh, 'km/h')} />
                <MiniMetric icon={<CloudRain className="w-2.5 h-2.5" />} label="Precip." value={row.precipitationAccuracyPct === null ? '—' : `${row.precipitationAccuracyPct}%`} />
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[8px] font-mono text-slate-500">
                <span>+1 h: {row.lead1Samples}</span>
                <span>+3 h: {row.lead3Samples}</span>
                <span>+6 h: {row.lead6Samples}</span>
                <span>peso: {row.effectiveWeight.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {summary.provisionalLeaderLabel && (
        <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-slate-300">
          <span className="font-semibold text-amber-200">Mejor desempeño observado hasta ahora: {summary.provisionalLeaderLabel}.</span>{' '}
          {summary.rankingStatus === 'provisional' ? 'La clasificación sigue siendo provisional.' : 'La evidencia cumple el umbral estable definido por ORBI.'}
        </div>
      )}

      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[9px] leading-relaxed text-slate-500">
        <p>{summary.interpretation}</p>
        <p className="mt-1">El ranking no modifica todavía el forecast principal. La selección adaptativa se habilitará únicamente en una fase explícita y con salvaguardas de evidencia.</p>
      </div>
    </section>
  );
}

function MiniMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-black/10 border border-white/5">
      <div className="flex items-center gap-1 text-slate-500">{icon}<span className="text-[7px] font-mono uppercase">{label}</span></div>
      <p className="text-[9px] font-bold text-slate-200 mt-0.5">{value}</p>
    </div>
  );
}
