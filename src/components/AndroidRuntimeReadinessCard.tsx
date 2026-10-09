import { useCallback, useEffect, useMemo, useState } from 'react';
import { BatteryCharging, Bell, CheckCircle2, Cpu, MapPin, RefreshCw, Smartphone, TriangleAlert, Widget } from 'lucide-react';
import {
  getAndroidRuntimeDiagnostics,
  isAndroidNativeRuntime,
  openAndroidAppSettings,
  openAndroidNotificationSettings,
  OrbiRuntimeDiagnosticsStatus,
} from '../services/androidRuntimeDiagnosticsService';

function StatusRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-white/[0.04] last:border-0">
      <div>
        <div className="text-[11px] font-bold text-slate-200">{label}</div>
        <div className="text-[9px] text-slate-500 mt-0.5">{detail}</div>
      </div>
      <span className={`text-[9px] font-black uppercase ${ok ? 'text-emerald-400' : 'text-amber-400'}`}>
        {ok ? 'OK' : 'REVISAR'}
      </span>
    </div>
  );
}

export default function AndroidRuntimeReadinessCard() {
  const nativeAndroid = isAndroidNativeRuntime();
  const [status, setStatus] = useState<OrbiRuntimeDiagnosticsStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!nativeAndroid) return;
    setLoading(true);
    setError(null);
    try {
      setStatus(await getAndroidRuntimeDiagnostics());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible leer el estado Android.');
    } finally {
      setLoading(false);
    }
  }, [nativeAndroid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const readiness = useMemo(() => {
    if (!status) return null;
    const locationReady = status.fineLocationGranted || status.coarseLocationGranted;
    const channelReady = !status.officialWatchEnabled || (status.notificationPermissionGranted && status.officialAlertChannelEnabled);
    const workReady = !status.officialWatchEnabled || status.workScheduled;
    const backgroundReady = !status.backgroundRestricted;
    const checks = [locationReady, channelReady, workReady, backgroundReady];
    return { passed: checks.filter(Boolean).length, total: checks.length };
  }, [status]);

  if (!nativeAndroid) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-950/45 border border-white/[0.05]">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
          <Smartphone className="w-4 h-4 text-slate-500" /> Device Readiness Android
        </div>
        <p className="text-[9px] text-slate-500 mt-1.5">El diagnóstico de dispositivo se activa únicamente dentro del APK Android real.</p>
      </div>
    );
  }

  const locationReady = !!status && (status.fineLocationGranted || status.coarseLocationGranted);
  const notificationsReady = !!status && status.notificationPermissionGranted;
  const officialChannelReady = !!status && (!status.officialWatchEnabled || status.officialAlertChannelEnabled);
  const workReady = !!status && (!status.officialWatchEnabled || status.workScheduled);
  const backgroundReady = !!status && !status.backgroundRestricted;

  return (
    <div className="p-3.5 rounded-xl bg-[#07101f]/80 border border-cyan-500/15 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Device Readiness</div>
            <div className="text-[9px] text-slate-500">Permisos, background, SENAPRED y widgets reales</div>
          </div>
        </div>
        <button onClick={() => void refresh()} disabled={loading} className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white disabled:opacity-40" aria-label="Actualizar diagnóstico Android">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {status && (
        <>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-500/[0.05] border border-cyan-500/10">
            <div className="text-[10px] text-slate-300">{status.manufacturer} {status.model} · Android {status.release} / API {status.sdkInt}</div>
            <div className={`text-[10px] font-black ${readiness?.passed === readiness?.total ? 'text-emerald-400' : 'text-amber-400'}`}>
              {readiness?.passed}/{readiness?.total}
            </div>
          </div>

          <div>
            <StatusRow ok={locationReady} label="Ubicación foreground" detail={status.fineLocationGranted ? 'Precisa concedida' : status.coarseLocationGranted ? 'Aproximada concedida' : 'Sin permiso de ubicación'} />
            <StatusRow ok={notificationsReady} label="Notificaciones Android" detail={notificationsReady ? 'POST_NOTIFICATIONS concedido' : 'Las alertas no pueden publicarse'} />
            <StatusRow ok={officialChannelReady} label="Canal oficial SENAPRED" detail={!status.officialWatchEnabled ? 'Watch oficial desactivado' : status.officialAlertChannelCreated ? 'Canal creado y disponible' : 'Se creará con la primera ejecución válida'} />
            <StatusRow ok={workReady} label="WorkManager SENAPRED" detail={!status.officialWatchEnabled ? 'No requerido mientras el watch esté apagado' : `${status.activeWorkItems} trabajo(s) activo(s) · ${status.workStates || 'sin estado'}`} />
            <StatusRow ok={backgroundReady} label="Restricción de background" detail={status.backgroundRestricted ? 'Android restringe ejecución en segundo plano' : status.batteryOptimizationActive ? 'Sin restricción dura; optimización de batería activa' : 'Sin restricción dura detectada'} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9px]">
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
              <div className="flex items-center gap-1.5 text-slate-400"><Widget className="w-3.5 h-3.5" /> Widgets colocados</div>
              <div className="text-lg font-black text-slate-100 mt-1">{status.placedWidgetCount}</div>
              <div className="text-slate-600">Premium 4×4: {status.widgets.commandPremium}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
              <div className="flex items-center gap-1.5 text-slate-400"><BatteryCharging className="w-3.5 h-3.5" /> Batería</div>
              <div className={`text-[11px] font-black mt-2 ${status.batteryOptimizationActive ? 'text-amber-400' : 'text-emerald-400'}`}>
                {status.batteryOptimizationActive ? 'OPTIMIZADA' : 'SIN LÍMITE'}
              </div>
              <div className="text-slate-600 mt-1">No se solicita excepción automática</div>
            </div>
          </div>

          {(status.backgroundRestricted || !notificationsReady) && (
            <div className="p-2.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 text-[9px] text-amber-200 flex gap-2">
              <TriangleAlert className="w-4 h-4 shrink-0" />
              <span>Hay ajustes del sistema que pueden afectar alertas. ORBI no cambia estas políticas sin tu autorización.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => void openAndroidAppSettings()} className="py-2 px-2 rounded-lg bg-slate-800/70 border border-white/5 text-[9px] font-bold text-slate-300 flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Ajustes app
            </button>
            <button onClick={() => void openAndroidNotificationSettings()} className="py-2 px-2 rounded-lg bg-slate-800/70 border border-white/5 text-[9px] font-bold text-slate-300 flex items-center justify-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Notificaciones
            </button>
          </div>

          <div className="text-[8px] text-slate-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> Diagnóstico local de solo lectura · sin ubicación en background · sin foreground service
          </div>
        </>
      )}

      {error && <div className="text-[9px] text-rose-400">{error}</div>}
    </div>
  );
}
