import React, { useEffect, useState } from 'react';
import { ShieldCheck, Info, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert, BarChart3, CloudRain, Thermometer, Wind } from 'lucide-react';
import { WeatherLocation, WeatherSourceState } from '../types/weatherTypes';
import { calculateSkyCoreTrust, registeredTrustProviders } from '../services/skyCoreSourceTrustService';
import {
  LocalVerificationSummary,
  buildVerificationLocationKey,
  summarizeVerificationHistory,
} from '../services/weatherVerificationService';

interface SkyCoreTrustCardProps {
  sourceState: WeatherSourceState;
  location: WeatherLocation;
}

function metricValue(value: number | null, unit: string): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(1)} ${unit}`;
}

export default function SkyCoreTrustCard({ sourceState, location }: SkyCoreTrustCardProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [verification, setVerification] = useState<LocalVerificationSummary>(() => summarizeVerificationHistory(location));

  useEffect(() => {
    setVerification(summarizeVerificationHistory(location));
    const expectedLocationKey = buildVerificationLocationKey(location);

    const handleVerificationUpdate = (event: Event) => {
      const detail = (event as CustomEvent<LocalVerificationSummary>).detail;
      if (detail?.locationKey === expectedLocationKey) {
        setVerification(detail);
      }
    };

    window.addEventListener('orbi-weather-verification-updated', handleVerificationUpdate);
    return () => window.removeEventListener('orbi-weather-verification-updated', handleVerificationUpdate);
  }, [location.latitude, location.longitude, location.name]);

  const trust = calculateSkyCoreTrust(sourceState, location, 'buena', verification);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return {
          label: 'EN VIVO',
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400 animate-ping'
        };
      case 'cache':
        return {
          label: 'CACHÉ',
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400'
        };
      case 'fallback':
        return {
          label: 'RESPALDO',
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400 animate-pulse'
        };
      case 'demo':
      default:
        return {
          label: 'DEMO / SIM',
          bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
          dot: 'bg-indigo-400'
        };
    }
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'Alta':
        return {
          label: 'Alta',
          text: 'text-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        };
      case 'Media':
        return {
          label: 'Media',
          text: 'text-amber-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        };
      case 'Sin calibrar':
        return {
          label: 'Sin calibrar',
          text: 'text-slate-300',
          icon: <BarChart3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        };
      case 'Baja':
      default:
        return {
          label: 'Baja',
          text: 'text-rose-400',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        };
    }
  };

  const statusBadge = getStatusBadge(trust.sourceStatus);
  const confidenceBadge = getConfidenceBadge(trust.confidenceLevel);
  const showMeasuredMetrics = verification.sampleCount > 0;

  return (
    <div
      className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900/40 via-[#0a1122]/70 to-[#0e172e]/40 border border-white/5 space-y-3 shadow-md shadow-black/20"
      id="skycore-weather-trust-layer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">
            Evidencia Meteorológica SkyCore™
          </span>
        </div>
        <button
          onClick={() => setShowDisclaimer(!showDisclaimer)}
          className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer"
          title="Ver metodología y atribución"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-left">
        <div className="p-2.5 rounded-xl bg-white/2 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Fuentes activas</span>
            <div className={`px-1.5 py-0.5 text-[8px] font-mono rounded-md border font-bold flex items-center gap-1 ${statusBadge.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </div>
          </div>
          <span className="text-[11px] font-sans font-bold text-white mt-1.5 block line-clamp-2">
            {trust.activePrimarySource}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/2 border border-white/5 flex flex-col justify-between">
          <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider">Evidencia local</span>
          <div className="flex items-center justify-between gap-1.5 mt-1.5">
            <div className="flex items-center gap-1">
              {confidenceBadge.icon}
              <span className={`text-xs font-sans font-bold ${confidenceBadge.text}`}>
                {confidenceBadge.label}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">
              {trust.confidenceScore === null ? 'Score: —' : `Score: ${trust.confidenceScore}/100`}
            </span>
          </div>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-300">{trust.scoreLabel}</span>
          <span className="text-[9px] font-mono text-slate-400">{trust.verificationEvidenceLabel}</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-300">{trust.userMessage}</p>
      </div>

      {showMeasuredMetrics && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <MeasuredMetric icon={<Thermometer className="w-3 h-3" />} label="MAE temperatura" value={metricValue(verification.temperatureMaeC, '°C')} />
            <MeasuredMetric icon={<Wind className="w-3 h-3" />} label="MAE viento" value={metricValue(verification.windMaeKmh, 'km/h')} />
            <MeasuredMetric icon={<BarChart3 className="w-3 h-3" />} label="MAE humedad" value={metricValue(verification.humidityMaePct, 'pp')} />
            <MeasuredMetric
              icon={<CloudRain className="w-3 h-3" />}
              label="Acierto precipitación"
              value={verification.precipitationAccuracyPct === null ? '—' : `${verification.precipitationAccuracyPct}% · n=${verification.precipitationSamples}`}
            />
          </div>
          <div className="flex items-center justify-between px-1 text-[9px] font-mono text-slate-500">
            <span>{verification.sampleCount} muestras válidas</span>
            <span>{verification.medianStationDistanceKm === null ? 'Distancia —' : `Distancia mediana ${verification.medianStationDistanceKm.toFixed(1)} km`}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1 border-t border-white/5 pt-2">
        <div className="flex items-center gap-1">
          <RefreshCw className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
          <span>Datos: {trust.lastUpdatedMinutesText}</span>
        </div>
        <div className="text-slate-500">
          Estado: <span className="text-cyan-400 font-bold">{trust.dataQuality}</span>
        </div>
      </div>

      {showDisclaimer && (
        <div className="mt-2.5 p-3 bg-slate-950/80 border border-white/5 rounded-xl space-y-2.5 animate-fadeIn text-left text-[9px] text-slate-300 font-sans leading-relaxed">
          <p>
            <strong className="text-cyan-400">Atribución:</strong>{' '}
            {registeredTrustProviders.filter(provider => provider.status === 'active').map(provider => provider.attributionLabel).join(' · ')}.
          </p>
          <p>
            El score solo aparece cuando existe suficiente historial de comparaciones entre el modelo y observaciones DMC cercanas y recientes. Es una métrica de desempeño observado histórico, no una garantía de acierto del próximo pronóstico ni una medición exacta del microclima GPS.
          </p>
          <p>
            Las muestras se ponderan por distancia a la estación, antigüedad del reporte y alineación temporal. ORBI conserva hasta 45 días de historial local en el dispositivo.
          </p>

          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] leading-normal text-amber-200">
            <strong className="text-amber-400 uppercase font-mono block mb-0.5">
              Directiva HSE Terreno
            </strong>
            Las alertas y métricas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno, instrumentos certificados ni instrucciones de autoridades competentes.
          </div>
        </div>
      )}
    </div>
  );
}

function MeasuredMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-1 text-slate-500">{icon}<span className="text-[8px] font-mono uppercase">{label}</span></div>
      <p className="text-[10px] font-bold text-white mt-1">{value}</p>
    </div>
  );
}
