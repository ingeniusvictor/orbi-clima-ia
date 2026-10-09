import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, Smartphone, Eye, Users, HardHat, Check, ArrowRight, BrainCircuit } from 'lucide-react';

interface FirstLaunchOnboardingProps {
  onComplete: () => void;
}

export default function FirstLaunchOnboarding({ onComplete }: FirstLaunchOnboardingProps) {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      localStorage.setItem('orbi_clima_first_launch_completed_v1', 'true');
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center py-4"
          >
            <div className="flex justify-center mb-2">
              <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                <BrainCircuit className="w-12 h-12 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                ORBI Clima IA
              </h1>
              <p className="text-xs font-mono text-indigo-400 tracking-wider uppercase">
                Powered by ORBI SkyCore™
              </p>
              <p className="text-sm text-indigo-300 font-sans font-medium">
                Tu núcleo climático inteligente.
              </p>
            </div>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed font-sans">
              ORBI transforma el pronóstico en decisiones simples para tu día y tu trabajo en terreno.
            </p>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 py-2 text-left"
          >
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-slate-100 font-sans">Dos Perfiles Optimizados</h2>
              <p className="text-xs text-slate-400 mt-1">Elige o cambia tu enfoque en cualquier momento</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex gap-3.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 h-fit shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block font-sans">Perfil Persona</span>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">
                    Clima explicado para tu vida diaria: ropa ideal, probabilidad de lluvia, índice UV, frío, calor y sugerencias de la mejor hora para salir.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 h-fit shrink-0">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block font-sans">Perfil Técnico Terreno</span>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">
                    Condiciones preventivas y límites para trabajo exterior: humedad relativa, ráfagas de viento, precipitaciones, UV extremo, tormentas eléctricas y ventanas operativas recomendadas.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 py-2 text-left"
          >
            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-slate-100 font-sans flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Privacidad y Transparencia Local
              </h2>
              <p className="text-xs text-slate-400 mt-1">Sin trucos, tus datos te pertenecen por completo</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans text-center mb-2">
              Tus preferencias y memoria climática se guardan localmente en este dispositivo. ORBI Clima IA no requiere cuenta, backend ni nube para funcionar.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium font-sans">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-300">Sin login ni registro</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-300">Sin nube ni servidores</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-300">Sin tracking de terceros</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-300">GPS solo bajo permiso</span>
              </div>
              <div className="col-span-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-300">Memoria editable y eliminable de forma segura</span>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5 text-center py-2"
          >
            <div className="flex justify-center">
              <div className="p-4 rounded-3xl bg-teal-500/15 text-teal-400 border border-teal-500/20 shadow-xl shadow-teal-500/5">
                <Smartphone className="w-10 h-10 animate-bounce" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-sans">Soporte de Widgets de Escritorio</h2>
              <p className="text-xs text-slate-400 mt-1">El clima en tu pantalla de inicio de Android</p>
            </div>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed font-sans">
              Agrega ORBI SkyOrb Widget™ a tu pantalla de inicio para ver clima, alertas y mejor ventana de trabajo de un solo vistazo sin necesidad de abrir la aplicación.
            </p>
            <div className="p-3 bg-[#0d1e2d] border border-teal-500/20 rounded-xl inline-flex items-center gap-2 text-[10px] text-teal-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
              <span>Multi-formato: SkyOrb Mini, SkyPanel, Field Command y Cinematic Bar</span>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div id="first-launch-onboarding" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#080d19] border border-indigo-500/20 rounded-3xl shadow-2xl shadow-indigo-500/5 overflow-hidden relative">
        
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Outer content container */}
        <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[460px] relative z-10">
          
          {/* Progress bar */}
          <div className="flex items-center justify-between gap-1.5 mb-6">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                  num <= step ? 'bg-indigo-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Stepper Content */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-900">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all hover:bg-slate-900"
              >
                Atrás
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/10 transition-all active:scale-95"
            >
              {step === 4 ? (
                <>
                  Entrar a ORBI Clima IA <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continuar <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
