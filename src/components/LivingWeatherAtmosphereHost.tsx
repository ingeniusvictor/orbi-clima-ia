import { useEffect, useMemo, useState } from 'react';
import LivingWeatherAtmosphere from './LivingWeatherAtmosphere';
import LivingWeatherAtmosphereTransitionV11 from './LivingWeatherAtmosphereTransitionV11';
import { CurrentWeather, DailyForecast, WeatherLocation } from '../types/weatherTypes';
import { loadLastWeatherBundle } from '../services/weatherCacheService';
import { OC22_ATMOSPHERIC_TRANSITIONS_ENABLED } from '../config/oc22Features';
import {
  ATMOSPHERE_DEBUG_EVENT,
  applyAtmosphereDebugPreset,
  getAtmosphereDebugPhase,
  getAtmosphereDebugPreset,
} from '../services/weatherAtmosphereDebugService';
import '../styles/living-weather-host.css';

interface WeatherAtmosphereSnapshot {
  location: WeatherLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
}

function readSnapshot(): WeatherAtmosphereSnapshot | null {
  const bundle = loadLastWeatherBundle();
  if (!bundle?.location || !bundle?.current) return null;
  return {
    location: bundle.location,
    current: bundle.current,
    daily: Array.isArray(bundle.daily) ? bundle.daily : [],
  };
}

function isHomeScreenMounted(): boolean {
  return typeof document !== 'undefined' && Boolean(document.getElementById('orbi-mobile-home-screen'));
}

export default function LivingWeatherAtmosphereHost() {
  const [snapshot, setSnapshot] = useState<WeatherAtmosphereSnapshot | null>(() => readSnapshot());
  const [homeVisible, setHomeVisible] = useState(() => isHomeScreenMounted());
  const [debugPreset, setDebugPreset] = useState(() => getAtmosphereDebugPreset());
  const [debugPhase, setDebugPhase] = useState(() => getAtmosphereDebugPhase());
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
    const handleDebugChange = () => {
      setDebugPreset(getAtmosphereDebugPreset());
      setDebugPhase(getAtmosphereDebugPhase());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('orbi-weather-bundle-updated', handleWeatherUpdate);
    window.addEventListener(ATMOSPHERE_DEBUG_EVENT, handleDebugChange);

    const navigationObserver = new MutationObserver(() => {
      setHomeVisible(isHomeScreenMounted());
    });
    navigationObserver.observe(document.body, { childList: true, subtree: true });
    queueMicrotask(() => setHomeVisible(isHomeScreenMounted()));

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
      navigationObserver.disconnect();
      window.clearInterval(onboardingWatch);
    };
  }, []);

  const renderedCurrent = useMemo(() => {
    if (!snapshot) return null;
    return applyAtmosphereDebugPreset(snapshot.current, debugPreset);
  }, [snapshot, debugPreset]);

  if (!onboardingDone || !snapshot || !renderedCurrent) return null;

  const transitionReason = debugPreset !== 'live' || debugPhase !== 'auto'
    ? 'atm-lab' as const
    : 'weather-truth' as const;

  return (
    <div
      className="orbi-living-weather-host"
      data-debug-scene={debugPreset}
      data-debug-phase={debugPhase}
      data-oc22-transitions={OC22_ATMOSPHERIC_TRANSITIONS_ENABLED ? 'enabled' : 'baseline'}
      aria-hidden="true"
    >
      {OC22_ATMOSPHERIC_TRANSITIONS_ENABLED ? (
        <LivingWeatherAtmosphereTransitionV11
          currentWeather={renderedCurrent}
          dailyForecast={snapshot.daily[0]}
          timezone={snapshot.location.timezone}
          active={homeVisible}
          phaseOverride={debugPhase === 'auto' ? undefined : debugPhase}
          transitionReason={transitionReason}
        />
      ) : (
        <LivingWeatherAtmosphere
          currentWeather={renderedCurrent}
          dailyForecast={snapshot.daily[0]}
          timezone={snapshot.location.timezone}
          active={homeVisible}
          phaseOverride={debugPhase === 'auto' ? undefined : debugPhase}
        />
      )}
    </div>
  );
}
