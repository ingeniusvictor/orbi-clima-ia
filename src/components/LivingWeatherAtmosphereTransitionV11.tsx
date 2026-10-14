import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { CurrentWeather, DailyForecast } from '../types/weatherTypes';
import {
  AtmospherePhase,
  AtmosphereQuality,
  AtmosphereScene,
  type AtmosphereModel,
  buildWeatherAtmosphereModel,
  resolveAtmosphereQuality,
} from '../services/weatherAtmosphereEngine';
import type { AtmosphereTransitionReason } from '../services/atmosphereTransitionProfiles';
import { useAtmosphereTransition } from '../hooks/useAtmosphereTransition';
import CinematicSkyTransitionCanvasV11 from './CinematicSkyTransitionCanvasV11';
import NaturalCloudCanvas from './NaturalCloudCanvas';
import '../styles/living-weather-atmosphere.css';
import '../styles/living-weather-effects.css';

interface LivingWeatherAtmosphereTransitionV11Props {
  currentWeather: CurrentWeather;
  dailyForecast?: DailyForecast;
  timezone?: string;
  active?: boolean;
  phaseOverride?: AtmospherePhase;
  transitionReason?: AtmosphereTransitionReason;
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
  '--lwa-wind-opacity': number;
};

const rainDrops = Array.from({ length: 18 }, (_, index) => index);
const coldParticles = Array.from({ length: 12 }, (_, index) => index);
const windStreams = Array.from({ length: 7 }, (_, index) => index);
const heatWaves = Array.from({ length: 5 }, (_, index) => index);

function sceneEntries(sceneWeights: Partial<Record<AtmosphereScene, number>>) {
  return (Object.entries(sceneWeights) as Array<[AtmosphereScene, number]>)
    .filter(([, weight]) => weight > 0.008)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

export default function LivingWeatherAtmosphereTransitionV11({
  currentWeather,
  dailyForecast,
  timezone,
  active = true,
  phaseOverride,
  transitionReason = 'weather-truth',
}: LivingWeatherAtmosphereTransitionV11Props) {
  const [quality, setQuality] = useState<AtmosphereQuality>(() => resolveAtmosphereQuality());
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden');
  const [clockRevision, setClockRevision] = useState(0);
  const sceneModelsRef = useRef<Map<AtmosphereScene, AtmosphereModel>>(new Map());

  useEffect(() => {
    const refreshQuality = () => setQuality(resolveAtmosphereQuality());
    const handleVisibility = () => setPageVisible(document.visibilityState !== 'hidden');
    const minuteClock = window.setInterval(() => setClockRevision((value) => value + 1), 60_000);

    window.addEventListener('resize', refreshQuality, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('resize', refreshQuality);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.clearInterval(minuteClock);
    };
  }, []);

  const targetModel = useMemo(() => buildWeatherAtmosphereModel({
    current: currentWeather,
    daily: dailyForecast,
    timezone,
    quality,
    now: new Date(),
    phaseOverride,
  }), [currentWeather, dailyForecast, timezone, quality, phaseOverride, clockRevision]);

  // A scene-family model changes only when a real/QA target changes. The
  // transition sampler updates wrapper weights instead of forcing procedural
  // cloud textures to regenerate on every 100 ms publication tick.
  sceneModelsRef.current.set(targetModel.scene, targetModel);

  const paused = !active || !pageVisible;
  const transition = useAtmosphereTransition(targetModel, !paused, transitionReason, true);
  const model = transition.model;
  const activeCloudFamilies = sceneEntries(transition.sceneWeights);

  useEffect(() => {
    if (transition.phase !== 'stable') return;
    const stableModel = targetModel;
    sceneModelsRef.current = new Map([[stableModel.scene, stableModel]]);
  }, [targetModel, transition.phase]);

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
    '--lwa-wind-opacity': Number(Math.max((transition.sceneWeights.wind ?? 0) * 0.36, model.windStrength * 0.34).toFixed(3)),
  };

  const snowWeight = transition.sceneWeights.snow ?? 0;
  const coldWeight = transition.sceneWeights.cold ?? 0;
  const hotWeight = transition.sceneWeights.hot ?? 0;
  const windWeight = transition.sceneWeights.wind ?? 0;
  const showRain = model.precipitationKind !== 'snow'
    && model.precipitationStrength > 0.08
    && quality !== 'static';
  const showColdParticles = coldWeight > 0.04 && quality !== 'static';
  const showWind = (windWeight > 0.04 || model.windStrength > 0.52) && quality !== 'static';
  const showHeat = hotWeight > 0.04 && quality !== 'static' && quality !== 'low';
  const showLightning = transition.stormEnergy > 0.62 && quality !== 'static';

  return (
    <div
      id="orbi-living-weather-atmosphere"
      className={`living-weather-atmosphere ${active ? 'is-active' : 'is-muted'} ${paused ? 'is-paused' : ''}`}
      data-scene={model.scene}
      data-phase={model.phase}
      data-quality={model.quality}
      data-accent={model.accentTemperature}
      data-sky-engine="v11-transition"
      data-transition-phase={transition.phase}
      data-transition-from={transition.fromScene}
      data-transition-to={transition.toScene}
      data-transition-reason={transition.reason}
      data-transition-progress={transition.progress.toFixed(3)}
      data-storm-energy={transition.stormEnergy.toFixed(3)}
      data-snow-weight={snowWeight.toFixed(3)}
      style={style}
      aria-hidden="true"
    >
      <CinematicSkyTransitionCanvasV11
        scene={model.scene}
        sceneWeights={transition.sceneWeights}
        phase={model.phase}
        quality={model.quality}
        solar={model.solar}
        cloudOpacity={model.cloudOpacity}
        luminance={model.luminance}
        active={!paused}
      />

      {/* Legacy rollback-safe nodes remain present for CSS parity, exactly as
          in the approved renderer path. The cinematic Canvas owns the sky. */}
      <div className="lwa-sky" />
      <div className="lwa-horizon-glow" />
      <div className="lwa-sun-rays" />

      <div className="lwa-stars">
        <span /><span /><span /><span /><span /><span /><span /><span />
      </div>

      <div className="lwa-celestial">
        <div className="lwa-celestial-glow" />
        <div className="lwa-celestial-disc" />
      </div>

      {activeCloudFamilies.map(([scene, weight]) => {
        const familyModel = sceneModelsRef.current.get(scene) ?? { ...model, scene };
        return (
          <div
            key={scene}
            className="lwa-transition-cloud-family"
            data-cloud-family={scene}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: Number(weight.toFixed(4)),
              pointerEvents: 'none',
            }}
          >
            <NaturalCloudCanvas
              scene={scene}
              quality={quality}
              cloudOpacity={familyModel.cloudOpacity}
              cloudSpeedSeconds={familyModel.cloudSpeed}
              windStrength={familyModel.windStrength}
              active={!paused}
            />
          </div>
        );
      })}

      <div className="lwa-mist lwa-mist-a" />
      <div className="lwa-mist lwa-mist-b" />

      {showWind && (
        <div
          className="lwa-wind-streams"
          aria-hidden="true"
          style={{ opacity: Number(Math.max(windWeight, model.windStrength * 0.7).toFixed(3)) }}
        >
          {windStreams.map((stream) => (
            <span
              key={stream}
              style={{
                top: `${18 + ((stream * 11) % 58)}%`,
                width: `${26 + (stream % 4) * 9}%`,
                animationDuration: `${3.8 + (stream % 3) * 0.9}s`,
                animationDelay: `${stream * -0.72}s`,
              }}
            />
          ))}
        </div>
      )}

      {showHeat && (
        <div
          className="lwa-heat-waves"
          aria-hidden="true"
          style={{ opacity: Number(hotWeight.toFixed(3)) }}
        >
          {heatWaves.map((wave) => (
            <span
              key={wave}
              style={{
                left: `${9 + wave * 18}%`,
                animationDelay: `${wave * -0.85}s`,
              }}
            />
          ))}
        </div>
      )}

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
        <div
          className="lwa-cold-particles"
          aria-hidden="true"
          style={{ opacity: Number(coldWeight.toFixed(3)) }}
        >
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

      {showLightning && <div className="lwa-lightning" />}
      <div className="lwa-depth-haze" />
      <div className="lwa-vignette" />
      <div className="lwa-readable-veil" />
    </div>
  );
}
