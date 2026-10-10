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
  '--lwa-cloud-opacity': number;
  '--lwa-cloud-speed': string;
  '--lwa-rain-opacity': number;
  '--lwa-mist-opacity': number;
  '--lwa-wind': number;
  '--lwa-luminance': number;
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
    '--lwa-cloud-opacity': Number(model.cloudOpacity.toFixed(3)),
    '--lwa-cloud-speed': `${Math.round(model.cloudSpeed)}s`,
    '--lwa-rain-opacity': Number(model.precipitationStrength.toFixed(3)),
    '--lwa-mist-opacity': Number(model.mistStrength.toFixed(3)),
    '--lwa-wind': Number(model.windStrength.toFixed(3)),
    '--lwa-luminance': Number(model.luminance.toFixed(3)),
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
            <span key={drop} style={{ '--drop-index': drop } as CSSProperties} />
          ))}
        </div>
      )}

      {showColdParticles && (
        <div className="lwa-cold-particles" aria-hidden="true">
          {coldParticles.map((particle) => (
            <span key={particle} style={{ '--particle-index': particle } as CSSProperties} />
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
