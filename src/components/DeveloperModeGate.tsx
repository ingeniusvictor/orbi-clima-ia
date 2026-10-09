import React, { useState, useEffect, useRef } from 'react';
import { ToggleLeft, ToggleRight, ShieldAlert, CheckCircle, Lock, Unlock, KeyRound, X } from 'lucide-react';

const DEV_MODE_KEY = 'orbi_clima_developer_mode_enabled_v1';
const DEV_UNLOCKED_KEY = 'orbi_clima_developer_unlocked_v1';
const ORBI_DEV_PIN = 'orbi2026';

interface DeveloperModeGateProps {
  onStateChange?: (enabled: boolean) => void;
}

export default function DeveloperModeGate({ onStateChange }: DeveloperModeGateProps) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    return localStorage.getItem(DEV_MODE_KEY) === 'true';
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DEV_UNLOCKED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pressProgress, setPressProgress] = useState(0);
  const [showPinInput, setShowPinInput] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const pressIntervalRef = useRef<any>(null);
  const isPressingRef = useRef(false);

  // Manage cooldown countdown
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const handleToggle = () => {
    if (!isUnlocked) {
      setPinError('Debes desbloquear el acceso de desarrollo primero.');
      return;
    }
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem(DEV_MODE_KEY, String(newState));
    if (onStateChange) {
      onStateChange(newState);
    }
    // Dispatch event to sync state immediately
    window.dispatchEvent(new Event('orbi_dev_mode_changed'));
  };

  const handleLockSession = () => {
    setIsUnlocked(false);
    setEnabled(false);
    try {
      sessionStorage.removeItem(DEV_UNLOCKED_KEY);
      localStorage.setItem(DEV_MODE_KEY, 'false');
    } catch {}
    if (onStateChange) {
      onStateChange(false);
    }
    setPinInput('');
    setPinError(null);
    setShowPinInput(false);
    window.dispatchEvent(new Event('orbi_dev_mode_changed'));
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownRemaining > 0) {
      setPinError(`Demasiados intentos. Intenta nuevamente en unos segundos.`);
      return;
    }
    if (pinInput === ORBI_DEV_PIN) {
      setIsUnlocked(true);
      setAttempts(0);
      try {
        sessionStorage.setItem(DEV_UNLOCKED_KEY, 'true');
      } catch {}
      setPinError(null);
      setShowPinInput(false);
      setPinInput('');
      window.dispatchEvent(new Event('orbi_dev_mode_changed'));
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setCooldownRemaining(30);
        setPinError('Demasiados intentos. Intenta nuevamente en unos segundos.');
        setAttempts(0); // reset attempts counter on locking
      } else {
        setPinError(`PIN incorrecto. Intento ${nextAttempts} de 5.`);
      }
    }
  };

  // Holding Gesture Timer
  const startPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (isUnlocked) return;
    e.preventDefault();
    isPressingRef.current = true;
    setPinError(null);
    setPressProgress(0);

    const startTime = Date.now();
    pressIntervalRef.current = setInterval(() => {
      if (!isPressingRef.current) {
        clearInterval(pressIntervalRef.current);
        return;
      }
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 5000) * 100, 100);
      setPressProgress(Math.round(progress));

      if (progress >= 100) {
        clearInterval(pressIntervalRef.current);
        isPressingRef.current = false;
        setShowPinInput(true);
        setPressProgress(0);
      }
    }, 100);
  };

  const endPress = () => {
    isPressingRef.current = false;
    if (pressIntervalRef.current) {
      clearInterval(pressIntervalRef.current);
      pressIntervalRef.current = null;
    }
    setPressProgress(0);
  };

  // Sync state on mount and external changes
  useEffect(() => {
    const syncState = () => {
      try {
        const isEnabled = localStorage.getItem(DEV_MODE_KEY) === 'true';
        const isSessionUnlocked = sessionStorage.getItem(DEV_UNLOCKED_KEY) === 'true';
        setEnabled(isEnabled && isSessionUnlocked);
        setIsUnlocked(isSessionUnlocked);
      } catch {}
    };

    window.addEventListener('orbi_dev_mode_changed', syncState);
    return () => {
      window.removeEventListener('orbi_dev_mode_changed', syncState);
      if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
    };
  }, []);

  return (
    <div className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 space-y-4 text-left relative overflow-hidden" id="orbi-dev-mode-lock-root">
      {/* Visual background loader during press */}
      {pressProgress > 0 && (
        <div 
          className="absolute inset-0 bg-cyan-500/10 transition-all duration-100 ease-out pointer-events-none"
          style={{ width: `${pressProgress}%` }}
        />
      )}

      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-5 h-5 ${isUnlocked ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <div>
            <span className="text-xs font-sans font-bold text-slate-200 block">Modo Desarrollador ORBI</span>
            <span className="text-[10px] text-slate-500 font-mono">
              ESTADO: {isUnlocked ? (enabled ? 'DESBLOQUEADO · ACTIVO' : 'DESBLOQUEADO · INACTIVO') : 'BLOQUEADO 🔒'}
            </span>
          </div>
        </div>

        {isUnlocked ? (
          <button
            onClick={handleToggle}
            className="cursor-pointer transition-all active:scale-95 text-slate-300 hover:text-white focus:outline-none"
            title="Activar/desactivar modo desarrollador"
          >
            {enabled ? (
              <ToggleRight className="w-10 h-10 text-cyan-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-600" />
            )}
          </button>
        ) : (
          <div className="flex flex-col items-end">
            <button
              onMouseDown={startPress}
              onMouseUp={endPress}
              onMouseLeave={endPress}
              onTouchStart={startPress}
              onTouchEnd={endPress}
              onClick={() => {
                if (pressProgress < 100) {
                  setPinError('Mantén presionado por 5 segundos para revelar el acceso.');
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-[10px] font-sans font-bold text-slate-300 cursor-pointer select-none transition-all flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>{pressProgress > 0 ? `Sostén... ${pressProgress}%` : 'Sostén 5s'}</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-400 font-sans leading-relaxed relative z-10">
        Las herramientas avanzadas muestran QA, publicación, packaging y reportes técnicos.
        {!isUnlocked && ' Requiere autenticación técnica de ORBI para prevenir accidentes.'}
      </p>

      {/* PIN entry form */}
      {showPinInput && !isUnlocked && (
        <form onSubmit={handleVerifyPin} className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 space-y-3 relative z-10 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1 uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5" /> PIN de Desarrollo
            </span>
            <button 
              type="button" 
              onClick={() => setShowPinInput(false)}
              className="text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[9px] text-slate-400 leading-normal">
            Acceso técnico protegido. Solicita el PIN al responsable ORBI.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="••••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
              autoFocus
              autoComplete="new-password"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-black text-xs uppercase cursor-pointer transition-all"
            >
              Validar
            </button>
          </div>
        </form>
      )}

      {/* Errors display */}
      {pinError && (
        <p className="text-[9px] text-rose-400 font-mono leading-tight animate-pulse relative z-10">
          ⚠️ {pinError}
        </p>
      )}

      {/* Unlock State & Manual Session Lock */}
      {isUnlocked && (
        <div className="flex flex-col gap-2 relative z-10">
          <div className="p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-between text-[9px] text-cyan-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5" />
              <span>SESIÓN DE DESARROLLO DESBLOQUEADA</span>
            </div>
            <button
              onClick={handleLockSession}
              className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-sans font-bold uppercase hover:bg-rose-500/20 cursor-pointer transition-all text-[8px]"
            >
              Bloquear modo desarrollador
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function isDeveloperModeEnabled(): boolean {
  try {
    const isEnabled = localStorage.getItem(DEV_MODE_KEY) === 'true';
    const isUnlocked = sessionStorage.getItem(DEV_UNLOCKED_KEY) === 'true';
    return isEnabled && isUnlocked;
  } catch {
    return false;
  }
}
