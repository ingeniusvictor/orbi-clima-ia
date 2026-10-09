import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { checkOrbiNotificationPermission, requestOrbiNotificationPermission } from '../services/notificationPermissionService';
import { OrbiNotificationPermissionState } from '../types/weatherTypes';
import { Bell, BellOff, ShieldAlert, CheckCircle, Smartphone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface NotificationPermissionCardProps {
  onPermissionChange?: (state: OrbiNotificationPermissionState) => void;
}

export default function NotificationPermissionCard({ onPermissionChange }: NotificationPermissionCardProps) {
  const [permissionState, setPermissionState] = useState<OrbiNotificationPermissionState>('unknown');
  const [loading, setLoading] = useState(false);

  const updatePermission = async () => {
    const state = await checkOrbiNotificationPermission();
    setPermissionState(state);
    if (onPermissionChange) {
      onPermissionChange(state);
    }
  };

  useEffect(() => {
    updatePermission();
    
    // Listen for custom mock activation triggers
    const handlePermissionReset = () => {
      updatePermission();
    };
    window.addEventListener('orbi-permission-reset', handlePermissionReset);
    return () => {
      window.removeEventListener('orbi-permission-reset', handlePermissionReset);
    };
  }, []);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const result = await requestOrbiNotificationPermission();
      setPermissionState(result);
      if (onPermissionChange) {
        onPermissionChange(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isNative = Capacitor.isNativePlatform();

  const getCardDetails = () => {
    switch (permissionState) {
      case 'granted':
        return {
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" id="perm-icon-granted" />,
          title: 'Alertas ORBI activas',
          desc: 'Recibirás avisos críticos y alertas priorizadas en tiempo real.',
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100',
          button: null
        };
      case 'denied':
        return {
          icon: <BellOff className="w-5 h-5 text-rose-400" id="perm-icon-denied" />,
          title: 'Las notificaciones están bloqueadas',
          desc: 'Puedes habilitar los permisos de notificación desde la sección de ajustes de Android para ORBI Clima.',
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-100',
          button: null
        };
      case 'prompt':
      case 'unknown':
      default:
        return {
          icon: <Bell className="w-5 h-5 text-cyan-400 animate-pulse" id="perm-icon-prompt" />,
          title: 'Activa alertas ORBI',
          desc: 'ORBI puede avisarte solo cuando detecte condiciones importantes, como lluvia próxima, UV alto o riesgo técnico de terreno.',
          bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100',
          button: (
            <button
              onClick={handleActivate}
              disabled={loading}
              className="mt-3 w-full py-2 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20 active:scale-98 disabled:opacity-50"
              id="btn-activate-alerts"
            >
              {loading ? 'Activando...' : 'Permitir Alertas'}
            </button>
          )
        };
    }
  };

  const card = getCardDetails();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border ${card.bg} flex flex-col gap-3 relative overflow-hidden`}
      id="orbi-permission-card"
    >
      <div className="flex gap-3">
        <div className="p-2 rounded-xl bg-white/5 shrink-0 h-9 w-9 flex items-center justify-center">
          {card.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm leading-snug">{card.title}</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
          {card.button}
        </div>
      </div>

      {!isNative && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-slate-400">
          <Smartphone className="w-3.5 h-3.5 text-cyan-500" />
          <span>Vista web: las notificaciones Android se activan al compilar la app nativa.</span>
        </div>
      )}
    </motion.div>
  );
}
