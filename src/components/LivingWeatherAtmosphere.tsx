import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { CurrentWeather, DailyForecast } from '../types/weatherTypes';
import {
  AtmosphereQuality,
  buildWeatherAtmosphereModel,
  resolveAtmosphereQuality,
} from '../services/weatherAtmosphereEngine';
import '../styles/living-weather-atmosphere.css';

interface LivingWeatherAtmosphereProps {
  currentWeather: CurrentWeather;
  dailyForecast?: DailyForecast;
  timezone?: string;
  active?: boolean;
}

type AtmosphereStyle = CSSProperties & {
  '--lwa-cloud-far-opacity': number;
  '--lwa-cloud-mid-opacity': number;
  '--lwa-cloud-near-opacity': number;
  '--lwa-cloud-speed-far': string;
  '--lwa-cloud-speed-mid': string;
  '--lwa-cloud-speed-near': string;
  '--lwa-rain-opacity': number;
  '--lwa-mist-a-opacity': number;
  '--lwa-mist-b-opacity': number;
  '--lwa-wind-shift': string;
};

const rainDrops = Array.from({ length: 18 }, (_, index) => index);
const coldParticles = Array.from({ length: 12 }, (_, index) => index);

export default function LivingWeatherAtmosphere({
  currentWeather,
  dailyForecast,
  timezone,
  active = true,
}: LivingWeatherAtmosphereProps) {
  const [quality, setQuality] = useState<AtmosphereQuality>(() => resolveAtmosphereQuality());
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden');

  useEffect(() => {
    const refreshQuality = () => setQuality(resolveAtmosphereQuality());
    const handleVisibility = () => setPageVisible(document.visibilityState !== 'hidden');

    window.addEventListener('resize', refreshQuality, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('resize', refreshQuality);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const model = useMemo(() => buildWeatherAtmosphereModel({
    current: currentWeather,
    daily: dailyForecast,
    timezone,
    quality,
  }), [currentWeather, dailyForecast, timezone, quality]);

  const style: AtmosphereStyle = {
    '--lwa-cloud-far-opacity': Number((model.cloudOpacity * 0.56).toFixed(3)),
    '--lwa-cloud-mid-opacity': Number((model.cloudOpacity * 0.76).toFixed(3)),
    '--lwa-cloud-near-opacity': Number((model.cloudOpacity * 0.88).toFixed(3)),
    '--lwa-cloud-speed-far': `${Math.round(model.cloudSpeed * 1.65)}s`,
    '--lwa-cloud-speed-mid': `${Math.round(model.cloudSpeed * 1.18)}s`,
    '--lwa-cloud-speed-near': `${Math.round(model.cloudSpeed)}s`,
    '--lwa-rain-opacity': Number(model.precipitationStrength.toFixed(3)),
    '--lwa-mist-a-opacity': Number((model.mistStrength * 0.72).toFixed(3)),
    '--lwa-mist-b-opacity': Number((model.mistStrength * 0.42).toFixed(3)),
    '--lwa-wind-shift': `${Math.round(model.windStrength * 24)}px`,
  };

  const paused = !active || !pageVisible;
  const showRain = model.precipitationStrength > 0.08 && quality !== 'static';
  const showColdParticles = model.scene === 'cold' && quality !== 'static';

  return (
    <div
      id="orbi-living-weather-atmosphere"
      className={`living-weather-atmosphere ${active ? 'is-active' : 'is-muted'} ${paused ? 'is-paused' : ''}`}
      data-scene={model.scene}
      data-phase={model.phase}
      data-quality={model.quality}
      data-accent={model.accentTemperature}
      style={style}
      aria-hidden="true"
    >
      <div className="lwa-sky" />
      <div className="lwa-horizon-glow" />

      <div className="lwa-stars">
        <span /><span /><span /><span /><span /><span /><span /><span />
      </div>

      <div className="lwa-celestial">
        <div className="lwa-celestial-glow" />
        <div className="lwa-celestial-disc" />
      </div>

      <div className="lwa-cloud-field lwa-cloud-field-far">
        <span className="lwa-cloud lwa-cloud-a" />
        <span className="lwa-cloud lwa-cloud-b" />
      </div>
      <div className="lwa-cloud-field lwa-cloud-field-mid">
        <span className="lwa-cloud lwa-cloud-c" />
        <span className="lwa-cloud lwa-cloud-d" />
      </div>
      <div className="lwa-cloud-field lwa-cloud-field-near">
        <span className="lwa-cloud lwa-cloud-e" />
      </div>

      <div className="lwa-mist lwa-mist-a" />
      <div className="lwa-mist lwa-mist-b" />

      {showRain && (
        <div className="lwa-rain" aria-hidden="true">
          {rainDrops.map((drop) => (
            <span
              key={drop}
              style={{
                left: `${(drop * 5.7) % 100}%`,
                top: `${-12 - ((drop * 7) % 24)}%`,
                height: `${48 + (drop % 5) * 10}px`,
                animationDuration: `${0.72 + (drop % 4) * 0.11}s`,
                animationDelay: `${drop * -0.13}s`,
              }}
            />
          ))}
        </div>
      )}

      {showColdParticles && (
        <div className="lwa-cold-particles" aria-hidden="true">
          {coldParticles.map((particle) => (
            <span
              key={particle}
              style={{
                left: `${(particle * 8.4) % 100}%`,
                top: `${(particle % 5) * 16}%`,
                animationDuration: `${6 + (particle % 4) * 1.5}s`,
                animationDelay: `${particle * -0.35}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="lwa-lightning" />
      <div className="lwa-depth-haze" />
      <div className="lwa-vignette" />
      <div className="lwa-readable-veil" />
    </div>
  );
}
