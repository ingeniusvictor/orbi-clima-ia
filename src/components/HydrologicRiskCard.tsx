import type { ReactNode } from 'react';
import { AlertTriangle, CloudRain, Droplets, ShieldAlert, Waves } from 'lucide-react';
import { FloodContextSnapshot } from '../services/openMeteoFloodService';
import { HydroPrecipSnapshot } from '../services/openMeteoHydroPrecipService';
import { OfficialAlertsResult } from '../services/officialWeatherAlertsService';
import { HydrologicRiskAssessment } from '../utils/hydrologicRiskEngine';

interface HydrologicRiskCardProps {
  precipitation: HydroPrecipSnapshot | null;
  flood: FloodContextSnapshot | null;
  assessment: HydrologicRiskAssessment | null;
  officialAlerts: OfficialAlertsResult | null;
  loading?: boolean;
}

function riskClasses(level?: HydrologicRiskAssessment['level']) {
  switch (level) {
    case 'high': return 'text-red-300 border-red-500/30 bg-red-500/10';
    case 'medium': return 'text-orange-300 border-orange-500/30 bg-orange-500/10';
    case 'low': return 'text-amber-300 border-amber-500/25 bg-amber-500/10';
    default: return 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10';
  }
}

function formatDischarge(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (value >= 1000) return `${Math.round(value).toLocaleString('es-CL')} m³/s`;
  return `${value.toFixed(value < 10 ? 1 : 0)} m³/s`;
}

export default function HydrologicRiskCard({
  precipitation,
  flood,
  assessment,
  officialAlerts,
  loading = false,
}: HydrologicRiskCardProps) {
  if (loading && !assessment) {
    return <div className="p-4 rounded-2xl bg-[#090f1e]/70 border border-white/5 text-xs text-slate-400">Analizando contexto hidrológico…</div>;
  }

  if (!precipitation || !assessment) return null;

  const officialCoverage = officialAlerts?.hasVerifiedCoverage === true;
  const officialCount = officialAlerts?.alerts.length ?? 0;

  return (
    <section className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 space-y-3" aria-label="Riesgo hidrológico inferido">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-400 mt-0.5" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">HydroWatch ORBI</p>
            <p className="text-sm font-semibold text-white">{assessment.title}</p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${riskClasses(assessment.level)}`}>
          {assessment.level === 'none' ? 'SIN SEÑAL' : assessment.level.toUpperCase()} · {assessment.score}/100
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-[10px] leading-relaxed text-slate-300">
        <p>{assessment.summary}</p>
        <p className="mt-1 text-cyan-200">{assessment.recommendation}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric icon={<CloudRain className="w-3 h-3" />} label="Lluvia pasada 24 h" value={`${precipitation.past24hMm} mm`} />
        <Metric icon={<CloudRain className="w-3 h-3" />} label="Próximas 6 h" value={`${precipitation.next6hMm} mm`} />
        <Metric icon={<Droplets className="w-3 h-3" />} label="Pico horario 24 h" value={`${precipitation.next24hMaxHourlyMm} mm/h`} />
        <Metric icon={<Waves className="w-3 h-3" />} label="Caudal GloFAS" value={formatDischarge(flood?.currentDischargeM3s)} />
      </div>

      {flood && (
        <div className="grid grid-cols-2 gap-2">
          <Metric
            icon={<Waves className="w-3 h-3" />}
            label="Tendencia de caudal"
            value={flood.trend === 'rising' ? 'Ascendente' : flood.trend === 'falling' ? 'Descendente' : flood.trend === 'stable' ? 'Estable' : 'Sin dato'}
          />
          <Metric
            icon={<Waves className="w-3 h-3" />}
            label="Pico previsto 7 d"
            value={formatDischarge(flood.upcoming7DayPeakM3s)}
          />
        </div>
      )}

      {assessment.evidence.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Señales que elevan el índice</p>
          {assessment.evidence.slice(0, 4).map(item => (
            <div key={item.id} className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-300">{item.label}</span>
              <span className="text-[10px] font-mono font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`p-2.5 rounded-xl border ${officialCoverage ? 'border-red-500/25 bg-red-500/10' : 'border-amber-500/15 bg-amber-500/5'}`}>
        <div className="flex items-start gap-2">
          {officialCoverage ? <ShieldAlert className="w-3.5 h-3.5 text-red-300 mt-0.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-300 mt-0.5 shrink-0" />}
          <div className="text-[10px] leading-relaxed">
            <p className={officialCoverage ? 'text-red-200 font-semibold' : 'text-amber-200 font-semibold'}>
              {officialCoverage
                ? `Alertas oficiales verificadas: ${officialCount}`
                : 'NO ES UNA ALERTA OFICIAL'}
            </p>
            {!officialCoverage && (
              <p className="text-slate-400 mt-1">
                ORBI aún no tiene configurado un feed oficial validado de alertas DMC/SENAPRED. Para decisiones de seguridad, consulta siempre las autoridades competentes.
              </p>
            )}
          </div>
        </div>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-[9px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-300">Limitaciones y fuentes</summary>
        <div className="mt-2 p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-[9px] leading-relaxed text-slate-500">
          <p>{precipitation.sourceLabel}.</p>
          {flood && <p>{flood.sourceLabel} · resolución aproximada {flood.resolutionKm} km.</p>}
          {assessment.limitations.map((item, index) => <p key={index}>• {item}</p>)}
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
