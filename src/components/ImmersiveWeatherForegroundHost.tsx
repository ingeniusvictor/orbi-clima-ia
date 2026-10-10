import { useEffect, useMemo, useState } from 'react';
import ImmersivePrecipitationCanvas from './ImmersivePrecipitationCanvas';
import { CurrentWeather, DailyForecast, WeatherLocation } from '../types/weatherTypes';
import { loadLastWeatherBundle } from '../services/weatherCacheService';
import {
  ATMOSPHERE_DEBUG_EVENT,
  applyAtmosphereDebugPreset,
  getAtmosphereDebugPreset,
} from '../services/weatherAtmosphereDebugService';
import {
  buildWeatherAtmosphereModel,
  resolveAtmosphereQuality,
} from '../services/weatherAtmosphereEngine';
import '../styles/immersive-weather-foreground.css';

interface WeatherForegroundSnapshot {
  location: WeatherLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
}

function readSnapshot(): WeatherForegroundSnapshot | null {
  const bundle = loadLastWeatherBundle();
  if (!bundle?.location || !bundle?.current) return null;
  return {
    location: bundle.location,
    current: bundle.current,
    daily: Array.isArray(bundle.daily) ? bundle.daily : [],
  };
}

function isHomeMounted(): boolean {
  return typeof document !== 'undefined' && Boolean(document.getElementById('orbi-mobile-home-screen'));
}

export default function ImmersiveWeatherForegroundHost() {
  const [snapshot, setSnapshot] = useState<WeatherForegroundSnapshot | null>(() => readSnapshot());
  const [homeVisible, setHomeVisible] = useState(() => isHomeMounted());
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden');
  const [debugPreset, setDebugPreset] = useState(() => getAtmosphereDebugPreset());
  const [onboardingDone, setOnboardingDone] = useState(() => {
    try {
      return localStorage.getItem('orbi_clima_first_launch_completed_v1') === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const refresh = () => setSnapshot(readSnapshot());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'orbi_clima_last_weather_bundle_v1') refresh();
    };
    const handleWeatherUpdate = () => refresh();
    const handleDebugChange = () => setDebugPreset(getAtmosphereDebugPreset());
    const handleVisibility = () => setPageVisible(document.visibilityState !== 'hidden');

    window.addEventListener('storage', handleStorage);
    window.addEventListener('orbi-weather-bundle-updated', handleWeatherUpdate);
    window.addEventListener(ATMOSPHERE_DEBUG_EVENT, handleDebugChange);
    document.addEventListener('visibilitychange', handleVisibility);

    const navigationObserver = new MutationObserver(() => setHomeVisible(isHomeMounted()));
    navigationObserver.observe(document.body, { childList: true, subtree: true });
    queueMicrotask(() => setHomeVisible(isHomeMounted()));

    const onboardingWatch = window.setInterval(() => {
      try {
        const done = localStorage.getItem('orbi_clima_first_launch_completed_v1') === 'true';
        if (done) {
          setOnboardingDone(true);
          window.clearInterval(onboardingWatch);
          refresh();
        }
      } catch {
        window.clearInterval(onboardingWatch);
      }
    }, 750);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('orbi-weather-bundle-updated', handleWeatherUpdate);
      window.removeEventListener(ATMOSPHERE_DEBUG_EVENT, handleDebugChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      navigationObserver.disconnect();
      window.clearInterval(onboardingWatch);
    };
  }, []);

  const renderedCurrent = useMemo(() => {
    if (!snapshot) return null;
    return applyAtmosphereDebugPreset(snapshot.current, debugPreset);
  }, [snapshot, debugPreset]);

  const model = useMemo(() => {
    if (!snapshot || !renderedCurrent) return null;
    return buildWeatherAtmosphereModel({
      current: renderedCurrent,
      daily: snapshot.daily[0],
      timezone: snapshot.location.timezone,
      quality: resolveAtmosphereQuality(),
    });
  }, [snapshot, renderedCurrent]);

  if (!onboardingDone || !snapshot || !renderedCurrent || !model) return null;

  const wetScene = model.scene === 'rain' || model.scene === 'storm' || model.precipitationStrength > 0.12;
  if (!wetScene) return null;

  const active = homeVisible && pageVisible;

  return (
    <div
      className={`orbi-immersive-weather-foreground ${active ? 'is-active' : 'is-paused'}`}
      data-scene={model.scene}
      data-quality={model.quality}
      data-debug-scene={debugPreset}
      aria-hidden="true"
    >
      <ImmersivePrecipitationCanvas
        scene={model.scene}
        quality={model.quality}
        precipitationStrength={model.precipitationStrength}
        windStrength={model.windStrength}
        active={active}
      />
      <div className="orbi-rain-glass-sheen" />
    </div>
  );
}
