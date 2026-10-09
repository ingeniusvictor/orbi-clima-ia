import { useEffect, useState } from 'react';
import { CurrentWeather, WeatherLocation } from '../types/weatherTypes';
import { AirQualitySnapshot, fetchOpenMeteoAirQuality } from '../services/openMeteoAirQualityService';
import { ForecastUncertaintyReport, fetchForecastUncertainty } from '../services/openMeteoEnsembleService';
import AirQualityCard from './AirQualityCard';
import ForecastUncertaintyCard from './ForecastUncertaintyCard';
import MicroclimateCard from './MicroclimateCard';

interface WeatherIntelligencePanelProps {
  location: WeatherLocation;
  current: CurrentWeather;
  enabled: boolean;
}

export default function WeatherIntelligencePanel({ location, current, enabled }: WeatherIntelligencePanelProps) {
  const [airQuality, setAirQuality] = useState<AirQualitySnapshot | null>(null);
  const [uncertainty, setUncertainty] = useState<ForecastUncertaintyReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setAirQuality(null);
      setUncertainty(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const load = async () => {
      setLoading(true);
      const params = {
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone || 'auto',
      };

      const [airResult, ensembleResult] = await Promise.allSettled([
        fetchOpenMeteoAirQuality(params),
        fetchForecastUncertainty(params),
      ]);

      if (!active) return;

      if (airResult.status === 'fulfilled') {
        setAirQuality(airResult.value);
      } else {
        console.warn('Air quality layer unavailable:', airResult.reason);
        setAirQuality(null);
      }

      if (ensembleResult.status === 'fulfilled') {
        setUncertainty(ensembleResult.value);
      } else {
        console.warn('Ensemble uncertainty layer unavailable:', ensembleResult.reason);
        setUncertainty(null);
      }

      setLoading(false);
    };

    load().catch(error => {
      if (!active) return;
      console.warn('Premium weather intelligence refresh failed:', error);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [enabled, location.latitude, location.longitude, location.timezone]);

  if (!enabled) return null;

  return (
    <div className="space-y-3" id="weather-intelligence-panel">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">ORBI Weather Intelligence</p>
          <p className="text-xs text-slate-400 mt-0.5">Aire · microclima · dispersión de modelos</p>
        </div>
        <span className="text-[9px] font-mono uppercase text-slate-500">OC-02</span>
      </div>

      <AirQualityCard data={airQuality} loading={loading} />
      <ForecastUncertaintyCard report={uncertainty} loading={loading} />
      <MicroclimateCard current={current} />
    </div>
  );
}
