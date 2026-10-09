import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, User, Cpu } from 'lucide-react';
import { loadScheduledSummarySettings } from '../services/scheduledSummaryService';
import { loadDeferredAlerts } from '../services/deferredAlertQueueService';

interface ScheduledEvent {
  type: string;
  timeLabel: string;
  timeMs: number;
  profile: 'person' | 'field_tech';
  reason: string;
}

export default function NextScheduledAlertCard() {
  const [nextEvent, setNextEvent] = useState<ScheduledEvent | null>(null);

  const calculateNextEvent = () => {
    const summarySettings = loadScheduledSummarySettings();
    const deferredAlerts = loadDeferredAlerts();
    const events: ScheduledEvent[] = [];
    const now = new Date();

    // 1. Morning Person Summary
    if (summarySettings.personMorningEnabled) {
      const [h, m] = summarySettings.personMorningTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const d = new Date();
        d.setHours(h, m, 0, 0);
        if (d.getTime() <= now.getTime()) {
          d.setDate(d.getDate() + 1);
        }
        events.push({
          type: 'Resumen Matutino Persona',
          timeLabel: `${d.toLocaleDateString([], { weekday: 'short' })} ${summarySettings.personMorningTime}`,
          timeMs: d.getTime(),
          profile: 'person',
          reason: 'Programación diaria para Perfil Persona (con datos climáticos frescos).'
        });
      }
    }

    // 2. Technical Shift Summary
    if (summarySettings.fieldPreShiftEnabled) {
      const [h, m] = summarySettings.fieldPreShiftTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const d = new Date();
        d.setHours(h, m, 0, 0);
        if (d.getTime() <= now.getTime()) {
          d.setDate(d.getDate() + 1);
        }
        events.push({
          type: 'Resumen Pre-jornada Técnico',
          timeLabel: `${d.toLocaleDateString([], { weekday: 'short' })} ${summarySettings.fieldPreShiftTime}`,
          timeMs: d.getTime(),
          profile: 'field_tech',
          reason: 'Programación diaria para Perfil Técnico Terreno (incluye directrices HSE).'
        });
      }
    }

    // 3. Deferred Alerts
    deferredAlerts.forEach(alert => {
      const t = new Date(alert.scheduledFor);
      if (t.getTime() > now.getTime()) {
        events.push({
          type: `Alerta Diferida: ${alert.title}`,
          timeLabel: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeMs: t.getTime(),
          profile: alert.profile,
          reason: `Postergada por horario silencioso. Motivo: ${alert.reason}`
        });
      }
    });

    // Sort by timeMs ascending
    events.sort((a, b) => a.timeMs - b.timeMs);

    if (events.length > 0) {
      setNextEvent(events[0]);
    } else {
      setNextEvent(null);
    }
  };

  useEffect(() => {
    calculateNextEvent();
    
    // Refresh when events occur or settings change
    window.addEventListener('orbi-deferred-alerts-changed', calculateNextEvent);
    window.addEventListener('orbi-summary-settings-changed', calculateNextEvent);
    
    const interval = setInterval(calculateNextEvent, 30000); // refresh every 30s
    return () => {
      window.removeEventListener('orbi-deferred-alerts-changed', calculateNextEvent);
      window.removeEventListener('orbi-summary-settings-changed', calculateNextEvent);
      clearInterval(interval);
    };
  }, []);

  return (
    <div id="next-scheduled-alert-card" className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4.5 h-4.5 text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-100 font-sans">Próxima Alerta / Resumen Programado</h3>
      </div>

      {!nextEvent ? (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center flex flex-col items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-slate-600 mb-1.5" />
          <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm">
            No hay alertas programadas. SkyCore seguirá observando condiciones relevantes.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-200 font-sans">{nextEvent.type}</span>
            <span className="text-xs font-mono text-blue-400 font-bold bg-blue-500/10 border border-blue-500/15 px-2.5 py-0.5 rounded-full">
              {nextEvent.timeLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Perfil objetivo:</span>
            <div className="flex items-center gap-1">
              {nextEvent.profile === 'person' ? (
                <>
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-amber-400 font-sans">Persona</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-blue-400 font-sans">Técnico Terreno</span>
                </>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
            <span className="font-semibold text-slate-300">Razón de programación:</span> {nextEvent.reason}
          </div>
        </div>
      )}
    </div>
  );
}
