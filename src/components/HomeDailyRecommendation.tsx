import React from 'react';
import { CurrentWeather, HourlyForecast, DailyForecast, WeatherProfile } from '../types/weatherTypes';
import { Lightbulb, Check, HelpCircle, AlertTriangle, Shield, Thermometer, Wind, Droplets, Sun, CloudRain } from 'lucide-react';

interface HomeDailyRecommendationProps {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  activeProfile: WeatherProfile;
  bestWindow?: string;
}

export default function HomeDailyRecommendation({
  current,
  hourly,
  daily,
  activeProfile,
  bestWindow
}: HomeDailyRecommendationProps) {
  const isTech = activeProfile === 'field_tech';

  // Calculate human-friendly recommendation narrative for Person profile
  const getPersonNarrative = () => {
    const temp = current.temperatureC;
    const isRainy = current.precipitationMm > 0 || (daily[0]?.precipitationProbability > 40);

    let intro = "La mañana se ve favorable para tus planes.";
    if (temp < 13) {
      intro = "Se siente una brisa fresca en el ambiente.";
    } else if (temp > 24) {
      intro = "Un día cálido y despejado por delante.";
    }

    if (isRainy) {
      return `${intro} Hay probabilidad de precipitaciones hoy. Te sugerimos llevar paraguas y priorizar actividades en espacios cubiertos. ¡ORBI te acompaña!`;
    }
    
    if (temp < 12) {
      return `${intro} Lleva una chaqueta ligera si sales temprano. Disfruta de una tarde templada y aire puro para pasear abrigado.`;
    }

    if (temp >= 25) {
      return `${intro} El sol brillará con intensidad hoy. Es recomendable planificar tus paseos o salidas temprano en la mañana o al atardecer para evitar la radiación pico.`;
    }

    return `${intro} Un clima templado y sumamente agradable para disfrutar al aire libre. Perfecto para pasear o realizar deporte ligero a media tarde.`;
  };

  // Compact status values for Persona 2.1
  const jacketCompact = current.temperatureC < 13 
    ? "Sí" 
    : (current.temperatureC < 18 ? "Ligera" : "No");

  const umbrellaCompact = (current.precipitationMm > 0)
    ? "Sí"
    : ((daily[0]?.precipitationProbability > 40) ? "Recomendado" : "No");

  const uvCompact = current.uvIndex >= 6
    ? "Alto"
    : (current.uvIndex >= 3 ? "Moderado" : "Bajo");

  const bestHourCompact = (current.condition === 'storm' || current.condition === 'rain')
    ? "Reprogramar"
    : (current.temperatureC >= 25 ? "08:00 - 11:00" : "10:00 - 16:00");

  const getPersonPremiumSummary = () => {
    if (current.condition === 'storm' || current.condition === 'rain') {
      return "Se sugiere reprogramar salidas y mantenerse refugiado de forma segura. Lleva paraguas de forma indispensable.";
    }
    const hoursText = `Buen momento para salir entre ${bestHourCompact}.`;
    const jacketText = jacketCompact === 'Sí' 
      ? 'Lleva una chaqueta abrigada.' 
      : (jacketCompact === 'Ligera' ? 'Lleva una chaqueta ligera si sales temprano.' : 'No necesitas chaqueta.');
    const uvText = uvCompact === 'Alto'
      ? 'Sol intenso, usa bloqueador solar.'
      : 'UV moderado.';

    return `${hoursText} ${jacketText} ${uvText}`;
  };

  // Helper values for Person profile (Preguntas clave)
  const needJacket = current.temperatureC < 12 
    ? "Sí, lleva una chaqueta abrigada. El aire se siente fresco." 
    : (current.temperatureC < 18 ? "Lleva una chaqueta ligera si sales temprano." : "No es necesaria, la temperatura es muy agradable.");

  const needUmbrella = (current.precipitationMm > 0 || (daily[0]?.precipitationProbability > 40))
    ? "Sí, lleva paraguas o impermeable para estar protegido."
    : "No se esperan lluvias hoy. ¡Cielo seguro!";

  const sunIntensity = current.uvIndex >= 6
    ? "Fuerte. Aplica bloqueador solar FPS 50+ y usa lentes de sol."
    : (current.uvIndex >= 3 ? "Moderado. Se sugeridor protector si estarás expuesto por horas." : "Bajo. Radiación controlada.");

  const bestTimeToOut = (current.condition === 'storm' || current.condition === 'rain')
    ? "Se sugiere reprogramar salidas y mantenerse refugiado de forma segura."
    : (current.temperatureC >= 25 ? "Recomendado salir antes de las 11:00 o después de las 16:30." : "Excelente entre las 10:00 y las 16:00, con clima ideal.");

  // Operational risks for Technical profile
  const windRisk = current.windSpeedKmh >= 35 
    ? { text: "Crítico (detener trabajos)", color: "text-rose-400" } 
    : (current.windSpeedKmh >= 20 ? { text: "Moderado (asegurar herramientas)", color: "text-amber-400" } : { text: "Bajo (condición apta)", color: "text-emerald-400" });

  const humidityRisk = current.humidity >= 80 
    ? { text: "Alto (riesgo condensación)", color: "text-amber-400" } 
    : (current.humidity >= 65 ? { text: "Moderado (precaución tableros)", color: "text-yellow-400" } : { text: "Bajo (apto tableros)", color: "text-emerald-400" });

  const uvRisk = current.uvIndex >= 8 
    ? { text: "Extremo (EPP e hidratación)", color: "text-rose-400" } 
    : (current.uvIndex >= 5 ? { text: "Alto (bloqueador continuo)", color: "text-amber-400" } : { text: "Bajo (estándar)", color: "text-emerald-400" });

  const rainRisk = (current.precipitationMm > 2 || current.condition === 'storm') 
    ? { text: "Crítico (suspender maniobras)", color: "text-rose-400" } 
    : (current.precipitationMm > 0 ? { text: "Bajo (llovizna leve)", color: "text-amber-400" } : { text: "Ninguno (sin lluvias)", color: "text-emerald-400" });

  const getOpState = () => {
    if (current.precipitationMm > 2 || current.windSpeedKmh >= 35 || current.condition === 'storm') {
      return { label: "No Recomendado", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    }
    if (current.windSpeedKmh >= 20 || current.uvIndex >= 6 || current.humidity >= 70 || current.precipitationMm > 0) {
      return { label: "Precaución", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    }
    return { label: "Apto", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  };

  const opState = getOpState();
  const isRainActive = current.precipitationMm > 0 || current.condition === 'rain' || current.condition === 'storm';
  const isUvExtreme = current.uvIndex >= 6;
  const isWindStrong = current.windSpeedKmh >= 25;

  return (
    <div 
      className={`p-5 rounded-3xl border transition-all duration-300 ${
        isTech 
          ? 'bg-gradient-to-br from-amber-950/15 via-[#090f1e] to-slate-900/60 border-amber-500/15' 
          : 'bg-gradient-to-br from-cyan-950/15 via-[#090f1e] to-slate-900/60 border-cyan-500/15'
      }`}
      id="home-daily-recommendation-card"
    >
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-lg ${isTech ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
            <Lightbulb className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider">
            Recomendación de Hoy
          </h4>
        </div>
        {isTech && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold font-mono uppercase ${opState.color}`}>
            Op: {opState.label}
          </span>
        )}
      </div>

      {!isTech ? (
        /* PERFIL PERSONA - 100% Humano y cotidiano */
        <div className="space-y-4">
          <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-2xl">
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium italic" id="person-human-narrative">
              “{getPersonPremiumSummary()}”
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-[#0b1222]/60 border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Chaqueta</span>
              <span className={`text-xs font-sans font-bold mt-1 ${jacketCompact === 'Sí' ? 'text-amber-400' : (jacketCompact === 'Ligera' ? 'text-cyan-400' : 'text-slate-300')}`}>
                {jacketCompact}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight mt-0.5 block">{needJacket}</span>
            </div>

            <div className="bg-[#0b1222]/60 border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Paraguas</span>
              <span className={`text-xs font-sans font-bold mt-1 ${umbrellaCompact === 'No' ? 'text-slate-300' : 'text-cyan-400'}`}>
                {umbrellaCompact}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight mt-0.5 block">{needUmbrella}</span>
            </div>

            <div className="bg-[#0b1222]/60 border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Sol / UV</span>
              <span className={`text-xs font-sans font-bold mt-1 ${uvCompact === 'Alto' ? 'text-amber-400' : 'text-cyan-400'}`}>
                {uvCompact}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight mt-0.5 block">{sunIntensity}</span>
            </div>

            <div className="bg-[#0b1222]/60 border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Mejor hora</span>
              <span className="text-xs font-sans font-bold text-cyan-400 mt-1">
                {bestHourCompact}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight mt-0.5 block">{bestTimeToOut}</span>
            </div>
          </div>
        </div>
      ) : (
        /* PERFIL TÉCNICO TERRENO - Compacto y directo */
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Humedad */}
            <div className="bg-[#0b1222]/80 border border-white/5 rounded-xl p-2.5 text-left">
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase">
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>Riesgo Humedad</span>
              </div>
              <span className="text-xs font-bold text-slate-200 block mt-1">{current.humidity}% HR</span>
              <span className={`text-[9px] font-medium block mt-0.5 ${humidityRisk.color}`}>
                {humidityRisk.text}
              </span>
            </div>

            {/* Viento */}
            <div className="bg-[#0b1222]/80 border border-white/5 rounded-xl p-2.5 text-left">
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase">
                <Wind className="w-3 h-3 text-cyan-400" />
                <span>Riesgo Viento</span>
              </div>
              <span className="text-xs font-bold text-slate-200 block mt-1">{current.windSpeedKmh} km/h</span>
              <span className={`text-[9px] font-medium block mt-0.5 ${windRisk.color}`}>
                {windRisk.text}
              </span>
            </div>

            {/* Radiación */}
            <div className="bg-[#0b1222]/80 border border-white/5 rounded-xl p-2.5 text-left">
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Riesgo UV</span>
              </div>
              <span className="text-xs font-bold text-slate-200 block mt-1">Índice {current.uvIndex}</span>
              <span className={`text-[9px] font-medium block mt-0.5 ${uvRisk.color}`}>
                {uvRisk.text}
              </span>
            </div>

            {/* Lluvia */}
            <div className="bg-[#0b1222]/80 border border-white/5 rounded-xl p-2.5 text-left">
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase">
                <CloudRain className="w-3 h-3 text-cyan-400" />
                <span>Riesgo Lluvia</span>
              </div>
              <span className="text-xs font-bold text-slate-200 block mt-1">{current.precipitationMm} mm/h</span>
              <span className={`text-[9px] font-medium block mt-0.5 ${rainRisk.color}`}>
                {rainRisk.text}
              </span>
            </div>
          </div>

          {/* Ventana operativa */}
          <div className="bg-[#0b1222]/60 border border-white/5 rounded-2xl p-3 text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Ventana Operativa Recomendada</span>
            <p className="text-xs text-slate-200 mt-1 font-sans font-medium">
              {bestWindow || "Condición apta con precaución por viento. Parámetros estables durante el transcurso de la jornada."}
            </p>
          </div>

          {/* Directiva HSE Terreno Compacta */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3.5 flex gap-2.5 items-start">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-left">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">Recomendación HSE Compacta</span>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">
                {isRainActive 
                  ? "✓ SUSPENDER maniobras eléctricas o en altura de inmediato por precipitaciones activas." 
                  : `✓ EPP estándar obligatorio. ${isUvExtreme ? 'Uso de bloqueador FPS 50+ continuo y cubre-nuca. ' : ''}${isWindStrong ? 'Sujeción estricta de cables y herramientas.' : 'Condiciones aptas para despliegue.'}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
