import { useCallback, useEffect, useState } from 'react';
import { BellRing, Clock3, MapPin, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { WeatherLocation, WeatherSourceState } from '../types/weatherTypes';
import {
  OfficialAlertBackgroundWatchStatus,
  disableOfficialAlertBackgroundWatch,
  enableOfficialAlertBackgroundWatch,
  getOfficialAlertBackgroundWatchStatus,
  isNativeOfficialAlertWatchAvailable,
  isOfficialAlertBackgroundWatchEnabled,
  runOfficialAlertBackgroundCheckNow,
  setOfficialAlertBackgroundWatchEnabled,
} from '../services/officialAlertBackgroundWatchService';

interface OfficialAlertBackgroundWatchCardProps {
  currentLocation: WeatherLocation;
  weatherSourceState: WeatherSourceState;
}

function formatEpoch(value: number | null | undefined): string {
  if (!value) return 'Aún no ejecutado';
  return new Date(value).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function resultLabel(value: string | null | undefined): string {
  switch (value) {
    case 'delivered': return 'Alerta oficial entregada';
    case 'verified_no_alert': return 'Verificado · sin alerta coincidente';
    case 'verified_partial_no_alert': return 'Cobertura parcial · sin coincidencia';
    case 'already_delivered': return 'Alertas vigentes ya entregadas';
    case 'quiet_hours': return 'Pendiente por horario silencioso';
    case 'notification_permission_missing': return 'Falta permiso de notificaciones';
    case 'unverifiable': return 'Fuente oficial no verificable';
    case 'network_retry': return 'Reintento de red programado';
    case 'outside_chile': return 'Fuera de cobertura SENAPRED';
    case 'disabled': return 'Desactivado';
    default: return 'Esperando primera verificación';
  }
}

export default function OfficialAlertBackgroundWatchCard({
  currentLocation,
  weatherSourceState,
}: OfficialAlertBackgroundWatchCardProps) {
  const nativeAvailable = isNativeOfficialAlertWatchAvailable();
  const [enabled, setEnabled] = useState(() => isOfficialAlertBackgroundWatchEnabled());
  const [status, setStatus] = useState<OfficialAlertBackgroundWatchStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    const next = await getOfficialAlertBackgroundWatchStatus();
    setStatus(next);
  }, []);

  useEffect(() => {
    void refreshStatus();
    const handleChanged = () => {
      setEnabled(isOfficialAlertBackgroundWatchEnabled());
      void refreshStatus();
    };
    window.addEventListener('orbi-official-background-watch-changed', handleChanged);
    return () => window.removeEventListener('orbi-official-background-watch-changed', handleChanged);
  }, [refreshStatus]);

  const toggle = async () => {
    if (!nativeAvailable || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      if (enabled) {
        const next = await disableOfficialAlertBackgroundWatch();
        setEnabled(false);
        setStatus(next);
        setFeedback('Vigilancia en segundo plano desactivada.');
      } else {
        const sourceIsUnsafe = weatherSourceState.provider === 'mock'
          || weatherSourceState.mode === 'mock'
          || weatherSourceState.mode === 'fallback';
        if (sourceIsUnsafe || currentLocation.id === 'initial_setup') {
          throw new Error('Selecciona primero una ubicación real con datos en vivo para activar la vigilancia oficial.');
        }
        try {
          const next = await enableOfficialAlertBackgroundWatch(currentLocation);
          setEnabled(true);
          setStatus(next);
          setFeedback('Vigilancia SENAPRED activada para la ubicación actual.');
        } catch (error) {
          setOfficialAlertBackgroundWatchEnabled(false);
          throw error;
        }
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No fue posible actualizar la vigilancia oficial.');
    } finally {
      setBusy(false);
    }
  };

  const verifyNow = async () => {
    if (!nativeAvailable || !enabled || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const queued = await runOfficialAlertBackgroundCheckNow();
      setFeedback(queued
        ? 'Verificación oficial solicitada. Android la ejecutará cuando haya red.'
        : 'No fue posible solicitar la verificación.');
      window.setTimeout(() => void refreshStatus(), 1500);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No fue posible iniciar la verificación.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-[#050914]/70 border border-white/[0.06] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
            <BellRing className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-100">Vigilancia oficial SENAPRED</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
              Revisión Android periódica usando la última ubicación confirmada en primer plano.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={!nativeAvailable || busy}
          className={`shrink-0 w-11 h-6 rounded-full border transition-all relative ${
            enabled && nativeAvailable
              ? 'bg-emerald-500/25 border-emerald-400/40'
              : 'bg-white/5 border-white/10'
          } disabled:opacity-45`}
          aria-pressed={enabled && nativeAvailable}
          aria-label="Activar vigilancia oficial SENAPRED en segundo plano"
        >
          <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-all ${
            enabled && nativeAvailable ? 'left-[22px]' : 'left-1'
          }`} />
        </button>
      </div>

      {!nativeAvailable ? (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/15 text-[10px] text-slate-400 leading-relaxed">
          <Smartphone className="w-3.5 h-3.5 text-indigo-300 shrink-0 mt-0.5" />
          <span>Disponible en la compilación Android. La vista web no ejecuta trabajos en segundo plano.</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-mono">
                <MapPin className="w-3 h-3" /> Ubicación vigilada
              </div>
              <p className="text-[10px] font-semibold text-slate-200 mt-1 truncate">
                {status?.locationName || (enabled ? currentLocation.name : 'No configurada')}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-mono">
                <Clock3 className="w-3 h-3" /> Ciclo objetivo
              </div>
              <p className="text-[10px] font-semibold text-slate-200 mt-1">
                ~{status?.intervalMinutes || 30} min · best effort
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 text-[10px] leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-200 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> {resultLabel(status?.lastResult)}
            </div>
            <p className="text-slate-500 mt-1">Última revisión: {formatEpoch(status?.lastCheckAt)}</p>
            {status?.lastAlertArea && (
              <p className="text-slate-400 mt-1">Última zona de alerta: {status.lastAlertArea}</p>
            )}
            {status?.lastError && (
              <p className="text-amber-300/80 mt-1">{status.lastError}</p>
            )}
          </div>

          <button
            type="button"
            onClick={verifyNow}
            disabled={!enabled || busy}
            className="w-full p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.07] text-[10px] font-semibold text-slate-200 flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
            Verificar ahora
          </button>
        </>
      )}

      {feedback && (
        <p className="text-[10px] text-cyan-200/90 leading-relaxed">{feedback}</p>
      )}

      <div className="text-[9px] text-slate-500 leading-relaxed border-t border-white/[0.04] pt-2.5">
        Sin GPS oculto: ORBI no solicita ubicación en segundo plano ni mantiene un servicio permanente. Android puede diferir el ciclo por Doze, batería o políticas del fabricante.
      </div>
    </div>
  );
}
