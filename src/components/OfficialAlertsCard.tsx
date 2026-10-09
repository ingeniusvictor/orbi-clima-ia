import { AlertTriangle, ExternalLink, MapPin, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  OfficialAlertsProviderStatus,
  OfficialAlertsResult,
  OfficialWeatherAlert,
} from '../services/officialWeatherAlertsService';

interface OfficialAlertsCardProps {
  result: OfficialAlertsResult | null;
  loading?: boolean;
}

function alertClasses(alert: OfficialWeatherAlert): string {
  switch (alert.severity) {
    case 'extreme': return 'border-red-500/35 bg-red-500/10 text-red-200';
    case 'severe': return 'border-orange-500/35 bg-orange-500/10 text-orange-200';
    case 'warning': return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
    case 'watch': return 'border-yellow-500/25 bg-yellow-500/5 text-yellow-100';
    default: return 'border-cyan-500/20 bg-cyan-500/5 text-cyan-100';
  }
}

function senapredProvider(result: OfficialAlertsResult): OfficialAlertsProviderStatus | null {
  return result.providers.find(provider => provider.providerId === 'senapred_official_alerts') ?? null;
}

export default function OfficialAlertsCard({ result, loading = false }: OfficialAlertsCardProps) {
  if (loading && !result) {
    return (
      <div className="p-4 rounded-2xl bg-[#090f1e]/70 border border-white/5 text-xs text-slate-400">
        Verificando alertas oficiales SENAPRED…
      </div>
    );
  }

  if (!result) return null;

  const provider = senapredProvider(result);
  const verified = result.hasVerifiedCoverage;
  const alerts = result.alerts;

  return (
    <section className="p-4 rounded-2xl bg-[#090f1e]/85 border border-white/5 space-y-3" aria-label="Alertas oficiales SENAPRED">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {alerts.length > 0
            ? <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5" />
            : verified
              ? <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5" />
              : <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Fuente oficial territorial</p>
            <p className="text-sm font-semibold text-white">SENAPRED · Alertas meteorológicas</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-lg border text-[8px] font-mono font-bold ${
          verified
            ? result.coveragePartial
              ? 'border-amber-500/25 bg-amber-500/10 text-amber-300'
              : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
            : 'border-orange-500/25 bg-orange-500/10 text-orange-300'
        }`}>
          {verified ? (result.coveragePartial ? 'COBERTURA PARCIAL' : 'FEED VERIFICADO') : 'NO VERIFICABLE'}
        </span>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-3 rounded-xl border space-y-2 ${alertClasses(alert)}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[8px] font-mono uppercase opacity-70">ALERTA OFICIAL · {alert.authority}</p>
                  <p className="text-xs font-bold mt-0.5">{alert.title}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md border border-current/20 text-[8px] font-mono uppercase shrink-0">
                  {alert.alertLevel.replaceAll('_', ' ')}
                </span>
              </div>

              <p className="text-[10px] leading-relaxed text-slate-200">{alert.description}</p>

              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                <MapPin className="w-3 h-3" />
                <span>{alert.area}</span>
              </div>

              <div className="flex items-center justify-between gap-2 text-[8px] font-mono text-slate-500">
                <span>{alert.startsAt ? `Desde ${alert.startsAt}` : `Consultado ${new Date(result.checkedAt).toLocaleString('es-CL')}`}</span>
                {alert.sourceUrl && (
                  <a
                    href={alert.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200"
                  >
                    SENAPRED <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : verified ? (
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[10px] leading-relaxed">
          <p className="font-semibold text-emerald-200">Sin alerta meteorológica SENAPRED coincidente en el punto consultado.</p>
          <p className="text-slate-400 mt-1">
            ORBI verificó las capas meteorológicas oficiales disponibles por intersección geográfica. Esto no significa ausencia de otros tipos de emergencia ni reemplaza instrucciones de la autoridad.
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[10px] leading-relaxed">
          <p className="font-semibold text-amber-200">No se pudo confirmar el estado oficial.</p>
          <p className="text-slate-400 mt-1">
            ORBI no interpretará una falla de consulta como “sin alertas”. Revisa SENAPRED directamente si la decisión es sensible a seguridad.
          </p>
        </div>
      )}

      {provider && (
        <details>
          <summary className="cursor-pointer text-[9px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-300">Cobertura e integridad</summary>
          <div className="mt-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-[9px] leading-relaxed text-slate-500 space-y-1">
            <p>{provider.message}</p>
            <p>• Coincidencia: punto GPS/ubicación → polígono oficial SENAPRED.</p>
            <p>• ORBI no convierte HydroWatch, lluvia modelada ni riesgo propio en una alerta oficial.</p>
            <p>• DMC WIS2 sigue siendo observación oficial; su feed definitivo de Avisos/Alertas/Alarmas aún se mantiene separado hasta validación específica.</p>
          </div>
        </details>
      )}
    </section>
  );
}
