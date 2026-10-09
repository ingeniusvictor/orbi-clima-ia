import { useState } from 'react';
import { sendOrbiTestNotification } from '../services/orbiNotificationService';
import { User, HardHat, ShieldAlert, Sparkles } from 'lucide-react';

interface NotificationTestPanelProps {
  onTestSent?: () => void;
}

export default function NotificationTestPanel({ onTestSent }: NotificationTestPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleTest = async (type: 'person' | 'tech_normal' | 'critical') => {
    setLoading(type);
    try {
      if (type === 'person') {
        await sendOrbiTestNotification('person', 'info');
      } else if (type === 'tech_normal') {
        await sendOrbiTestNotification('field_tech', 'warning');
      } else {
        await sendOrbiTestNotification('field_tech', 'critical');
      }
      
      if (onTestSent) {
        onTestSent();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-3.5" id="notification-test-panel">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-cyan-500" />
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Panel de Diagnóstico & Pruebas
        </h4>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Prueba los canales de notificación locales de ORBI. Al hacer clic, se simulará o despachará una notificación instantánea según los permisos concedidos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => handleTest('person')}
          disabled={loading !== null}
          className="py-2.5 px-3 rounded-xl border border-white/5 bg-[#0e1628]/40 hover:bg-[#121c33]/60 text-xs font-medium text-slate-300 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          id="btn-test-person"
        >
          <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{loading === 'person' ? 'Enviando...' : 'Prueba Persona'}</span>
        </button>

        <button
          onClick={() => handleTest('tech_normal')}
          disabled={loading !== null}
          className="py-2.5 px-3 rounded-xl border border-white/5 bg-[#0e1628]/40 hover:bg-[#121c33]/60 text-xs font-medium text-slate-300 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          id="btn-test-tech"
        >
          <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{loading === 'tech_normal' ? 'Enviando...' : 'Prueba Técnico'}</span>
        </button>

        <button
          onClick={() => handleTest('critical')}
          disabled={loading !== null}
          className="py-2.5 px-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-medium text-rose-300 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          id="btn-test-critical"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
          <span>{loading === 'critical' ? 'Enviando...' : 'Prueba Crítica'}</span>
        </button>
      </div>
    </div>
  );
}
