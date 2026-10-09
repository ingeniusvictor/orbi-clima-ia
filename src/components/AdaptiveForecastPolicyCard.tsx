import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, CheckCircle2, ShieldCheck, TriangleAlert } from 'lucide-react';
import { WeatherLocation } from '../types/weatherTypes';
import {
  AdaptiveForecastPolicyDecision,
  AdaptiveForecastRuntimeTrace,
  loadAdaptiveForecastRuntime,
  resolveAdaptiveForecastPolicy,
} from '../services/adaptiveForecastPolicyService';
import { ModelSkillSummary } from '../services/modelForecastVerificationService';

interface AdaptiveForecastPolicyCardProps {
  location: WeatherLocation;
  modelSkill: ModelSkillSummary;
}

function policyClasses(decision: AdaptiveForecastPolicyDecision): string {
  return decision.mode === 'adaptive_model'
    ? 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10'
    : 'text-cyan-300 border-cyan-500/20 bg-cyan-500/10';
}

export default function AdaptiveForecastPolicyCard({ location, modelSkill }: AdaptiveForecastPolicyCardProps) {
  const decision = useMemo(
    () => resolveAdaptiveForecastPolicy(location, modelSkill),
    [location.latitude, location.longitude, modelSkill],
  );
  const [runtime, setRuntime] = useState<AdaptiveForecastRuntimeTrace | null>(() => loadAdaptiveForecastRuntime());

  useEffect(() => {
    const refreshRuntime = (event: Event) => {
      const detail = (event as CustomEvent<AdaptiveForecastRuntimeTrace>).detail;
      setRuntime(detail ?? loadAdaptiveForecastRuntime());
    };
    window.addEventListener('orbi-adaptive-forecast-runtime-updated', refreshRuntime);
    return () => window.removeEventListener('orbi-adaptive-forecast-runtime-updated', refreshRuntime);
  }, []);

  const runtimeMatchesLocation = runtime
    && Math.abs(runtime.latitude - location.latitude) < 0.02
    && Math.abs(runtime.longitude - location.longitude) < 0.02;

  return (
    <section className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 space-y-3" aria-label="Política adaptativa de forecast">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <BrainCircuit className="w-4 h-4 text-emerald-400 mt-0.5" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">Adaptive Forecast Policy</p>
            <p className="text-sm font-semibold text-white">Selección de modelo con salvaguardas</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-lg border text-[9px] font-bold text-right ${policyClasses(decision)}`}>
          {decision.mode === 'adaptive_model' ? 'ADAPTATIVO' : 'BEST MATCH'}
        </span>
      </div>

      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
        <div className="flex items-center gap-1.5">
          {decision.mode === 'adaptive_model'
            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            : <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
          <p className="text-[10px] font-semibold text-slate-200">{decision.selectedModelLabel}</p>
        </div>
        <p className="text-[9px] leading-relaxed text-slate-400">{decision.reasonLabel}</p>
        <p className="text-[8px] font-mono text-slate-500">{decision.evidenceSummary}</p>
      </div>

      {runtimeMatchesLocation && runtime && (
        <div className={`p-2.5 rounded-xl border ${runtime.fallbackUsed ? 'border-amber-500/20 bg-amber-500/5' : 'border-emerald-500/15 bg-emerald-500/5'}`}>
          <div className="flex items-start gap-2">
            {runtime.fallbackUsed
              ? <TriangleAlert className="w-3.5 h-3.5 text-amber-300 mt-0.5" />
              : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 mt-0.5" />}
            <div className="text-[9px] leading-relaxed">
              <p className="font-semibold text-slate-200">
                Último refresh: {runtime.effectiveModelLabel}
              </p>
              <p className="text-slate-500 mt-0.5">
                {runtime.effectiveMode === 'adaptive_model'
                  ? 'El forecast principal fue solicitado al modelo adaptativo seleccionado.'
                  : runtime.effectiveMode === 'best_match_fallback'
                    ? 'La consulta adaptativa falló y ORBI recuperó automáticamente Best Match.'
                    : 'El forecast principal usó Open-Meteo Best Match.'}
              </p>
              {runtime.fallbackReason && (
                <p className="text-amber-300/80 mt-1">Fallback: {runtime.fallbackReason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-[8px] font-mono text-slate-500">
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">Skill mínimo: {decision.safetyThresholds.minSkillScore}/100</div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">Ventaja mínima: {decision.safetyThresholds.minScoreMargin} pts</div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">Mín. por horizonte: {decision.safetyThresholds.minLeadSamplesPerHorizon}</div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">Estación mediana: ≤{decision.safetyThresholds.maxMedianStationDistanceKm} km</div>
      </div>

      <p className="text-[9px] leading-relaxed text-slate-500">
        ORBI solo abandona Best Match cuando la evidencia prospectiva es estable, cubre +1/+3/+6 h y el líder supera al segundo por un margen material. Un fallo del modelo adaptativo nunca bloquea el clima: activa fallback automático.
      </p>
    </section>
  );
}
