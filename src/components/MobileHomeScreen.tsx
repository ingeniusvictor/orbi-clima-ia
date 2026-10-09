import React, { useState } from 'react';
import { WeatherProfile, WeatherLocation, CurrentWeather, HourlyForecast, DailyForecast, WeatherSourceState, SavedWeatherLocation } from '../types/weatherTypes';
import { ComparisonReport } from '../services/skyCoreMultiSourceService';
import WelcomeHeroSection from './WelcomeHeroSection';
import ProfileSelector from './ProfileSelector';
import SkyCoreSummaryCard from './SkyCoreSummaryCard';
import HomeDailyRecommendation from './HomeDailyRecommendation';
import SkyCoreTrustCard from './SkyCoreTrustCard';
import HourlyForecastStrip from './HourlyForecastStrip';
import DailyForecastList from './DailyForecastList';
import ClimateRiskPanel from './ClimateRiskPanel';
import LocationSearchPanel from './LocationSearchPanel';
import CompactSectionCard from './CompactSectionCard';
import SmartLocationsPanel from './SmartLocationsPanel';
import { MapPin, CloudSun, RefreshCw, Shield, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';

interface MobileHomeScreenProps {
  currentLocation: WeatherLocation;
  currentWeather: CurrentWeather;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  activeProfile: WeatherProfile;
  setActiveProfile: (profile: WeatherProfile) => void;
  skyCoreSummary: any;
  activeRisks: any[];
  selectedLocationId: string;
  handleDropdownChange: (id: string) => void;
  resetToDemo: () => void;
  weatherSourceState: WeatherSourceState;
  handleSelectCustomLocation: (loc: any) => void;
  handleUseMyLocation: () => void;
  isGpsLoading: boolean;
  gpsError: string | null;
  isLoading: boolean;
  onNavigateToWidgets: () => void;
  onNavigateToAlerts?: () => void;
  onRefresh?: () => void;
  comparisonReport?: ComparisonReport | null;
  locationOrigin: 'gps' | 'manual' | 'saved' | 'destination' | 'demo' | 'cache' | 'setup';
  
  // Smart Locations Props
  savedLocations: SavedWeatherLocation[];
  onSaveLocation: (label: string, type: 'home' | 'work' | 'solar_park' | 'custom') => void;
  onDeleteLocation: (id: string) => void;
  onUpdateLocation: (id: string, updates: Partial<SavedWeatherLocation>) => void;
  onSelectSavedLocation: (loc: SavedWeatherLocation) => void;
  onSetAsDestination: () => void;
  nearbyMatch: { location: SavedWeatherLocation; distanceKm: number } | null;
  onAcceptNearbyMatch: () => void;
  onRejectNearbyMatch: () => void;
  showSaveSuggestion: boolean;
  onAcceptSaveSuggestion: () => void;
  onRejectSaveSuggestion: () => void;
}

export default function MobileHomeScreen({
  currentLocation,
  currentWeather,
  hourlyForecast,
  dailyForecast,
  activeProfile,
  setActiveProfile,
  skyCoreSummary,
  activeRisks,
  selectedLocationId,
  handleDropdownChange,
  resetToDemo,
  weatherSourceState,
  handleSelectCustomLocation,
  handleUseMyLocation,
  isGpsLoading,
  gpsError,
  isLoading,
  onNavigateToWidgets,
  onNavigateToAlerts,
  onRefresh,
  comparisonReport,
  locationOrigin,
  savedLocations,
  onSaveLocation,
  onDeleteLocation,
  onUpdateLocation,
  onSelectSavedLocation,
  onSetAsDestination,
  nearbyMatch,
  onAcceptNearbyMatch,
  onRejectNearbyMatch,
  showSaveSuggestion,
  onAcceptSaveSuggestion,
  onRejectSaveSuggestion
}: MobileHomeScreenProps) {
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [showFullForecast, setShowFullForecast] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getConditionNameSpanish = (cond: string) => {
    switch (cond) {
      case 'sunny': return 'Soleado';
      case 'partly_cloudy': return 'Parcial';
      case 'cloudy': return 'Nublado';
      case 'rain': return 'Lluvia';
      case 'storm': return 'Tormenta';
      case 'wind': return 'Ventoso';
      case 'cold': return 'Fresco';
      case 'hot': return 'Caluroso';
      case 'night': return 'Despejado';
      default: return 'Estable';
    }
  };

  const handleRefreshClick = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const handleCityChangeClick = () => {
    setIsLocationExpanded(true);
    setTimeout(() => {
      const el = document.getElementById("location-stations-card");
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const compactHourlyForecast = hourlyForecast.slice(0, 5);

  return (
    <div 
      className="space-y-5 animate-fade-in text-left" 
      id="orbi-mobile-home-screen"
      style={{
        paddingBottom: 'calc(110px + env(safe-area-inset-bottom))',
        paddingTop: 'env(safe-area-inset-top)'
      }}
    >
      {/* 1. Welcome / Weather Hero (Esfera Protegida) */}
      <WelcomeHeroSection
        location={currentLocation}
        temperature={currentWeather.temperatureC}
        feelsLike={currentWeather.feelsLikeC}
        conditionText={getConditionNameSpanish(currentWeather.condition)}
        conditionCode={currentWeather.condition}
        skyCoreStatus={skyCoreSummary.generalSummary || ''}
        bestWindow={skyCoreSummary.bestWindow}
        sourceMode={weatherSourceState.provider === 'mock' ? 'mock' : (weatherSourceState.mode === 'cached' ? 'cache' : (weatherSourceState.mode === 'fallback' ? 'fallback' : 'api'))}
        activeProfile={activeProfile}
        isLoading={isLoading}
        currentWeather={currentWeather}
        locationOrigin={locationOrigin}
        onUseMyLocation={handleUseMyLocation}
        onCityChangeClick={handleCityChangeClick}
        isGpsLoading={isGpsLoading}
        gpsError={gpsError}
        onRefresh={onRefresh}
      />

      {/* 6. Forecast Compacto (Con opción de expandir) - Posicionado arriba de Recomendación de Hoy */}
      <div className="p-4 rounded-2xl bg-[#090f1e]/40 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Pronóstico</span>
          </div>
          <button
            onClick={() => setShowFullForecast(!showFullForecast)}
            className="flex items-center gap-1 text-[9px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer uppercase bg-cyan-500/5 px-2 py-1 rounded"
          >
            <span>{showFullForecast ? 'Ver menos' : 'Ver extendido'}</span>
            {showFullForecast ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Hourly timeline */}
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-slate-500 block uppercase">Próximas Horas</span>
          <HourlyForecastStrip hourly={compactHourlyForecast} />
        </div>

        {showFullForecast && (
          <div className="pt-3 border-t border-white/5 space-y-4 animate-fadeIn">
            {hourlyForecast.length > 5 && (
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Horas Restantes</span>
                <HourlyForecastStrip hourly={hourlyForecast.slice(5, 12)} />
              </div>
            )}
            
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <CloudSun className="w-3.5 h-3.5 text-indigo-400" />
                <span>Perspectiva Semanal</span>
              </div>
              <DailyForecastList daily={dailyForecast} />
            </div>
          </div>
        )}
      </div>

      {/* 2. Recomendación de Hoy 2.1 */}
      <HomeDailyRecommendation
        current={currentWeather}
        hourly={hourlyForecast}
        daily={dailyForecast}
        activeProfile={activeProfile}
        bestWindow={skyCoreSummary.bestWindow}
      />

      {/* 4. Alerta Principal (Riesgos Climáticos Detectados) */}
      <ClimateRiskPanel risks={activeRisks} />

      {/* 7. Perfil Persona / Técnico Terreno & SkyCore Decision Card (Análisis Generativo) */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 space-y-3">
          <span className="text-[10px] font-mono text-cyan-400 block uppercase tracking-wider">Configuración de Perfil Heurístico</span>
          <ProfileSelector
            activeProfile={activeProfile}
            onChange={setActiveProfile}
          />
        </div>

        <SkyCoreSummaryCard
          summary={skyCoreSummary}
          profile={activeProfile}
          comparisonReport={comparisonReport}
        />
      </div>

      {/* 2.5. Capa de Confianza de Datos SkyCore™ */}
      <SkyCoreTrustCard 
        sourceState={weatherSourceState}
        location={currentLocation}
      />

      {/* 5. Smart Action Layer (Acciones Rápidas) */}
      <div className="p-4 rounded-2xl bg-[#090f1e]/85 border border-white/5 space-y-3" id="smart-action-layer">
        <div className="flex items-center gap-1.5">
          <LayoutGrid className="w-4 h-4 text-cyan-400" />
          <h4 className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
            Smart Action Layer
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 hover:border-cyan-500/30 rounded-xl text-left transition-all cursor-pointer text-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-sans font-semibold truncate">Actualizar Clima</span>
          </button>

          <button
            onClick={handleCityChangeClick}
            className="flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 hover:border-cyan-500/30 rounded-xl text-left transition-all cursor-pointer text-slate-200"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-sans font-semibold truncate">Cambiar Ciudad</span>
          </button>

          <button
            onClick={onNavigateToAlerts}
            className="flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 hover:border-cyan-500/30 rounded-xl text-left transition-all cursor-pointer text-slate-200"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-sans font-semibold truncate">Ver Alertas</span>
          </button>

          <button
            onClick={onNavigateToWidgets}
            className="flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 hover:border-cyan-500/30 rounded-xl text-left transition-all cursor-pointer text-slate-200"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-sans font-semibold truncate">Widget Sincro</span>
          </button>
        </div>
      </div>

      {/* Collapsible Location Card & Stations */}
      <div id="location-stations-card">
        <CompactSectionCard
          title="Ubicación y Estaciones"
          subtitle={`${currentLocation.name} · Cambiar o buscar coordenadas`}
          status={weatherSourceState.provider === 'mock' ? 'DEMO' : 'EN VIVO'}
          icon={<MapPin className="w-4 h-4 text-cyan-400" />}
          expanded={isLocationExpanded}
          onToggle={setIsLocationExpanded}
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Estaciones Disponibles</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedLocationId}
                    onChange={(e) => handleDropdownChange(e.target.value)}
                    className="w-full bg-[#050914] border border-white/10 hover:border-cyan-500/30 text-xs text-white rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer transition-all font-sans font-medium appearance-none"
                  >
                    <option value="rancagua">Rancagua · Live</option>
                    <option value="santiago">Santiago · Live</option>
                    <option value="parque_fotovoltaico_orbi">Parque Fotovoltaico Demo (Radiación UV)</option>
                    {selectedLocationId === 'gps_location' && (
                      <option value="gps_location">📍 Mi Ubicación (GPS)</option>
                    )}
                    {selectedLocationId === 'custom_search' && (
                      <option value="custom_search">🔍 {currentLocation.name}</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40 text-[10px]">
                    ▼
                  </div>
                </div>

                {weatherSourceState.provider !== 'mock' && (
                  <button
                    onClick={resetToDemo}
                    className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 border border-amber-500/20 text-amber-400 text-[10px] font-mono rounded-xl transition-all cursor-pointer font-bold uppercase"
                  >
                    Cargar Demo
                  </button>
                )}
              </div>
            </div>

            <LocationSearchPanel
              onSelectLocation={handleSelectCustomLocation}
              onUseMyLocation={handleUseMyLocation}
              isGpsLoading={isGpsLoading}
              gpsError={gpsError}
              currentLocationName={currentLocation.name}
            />

            <div className="border-t border-white/5 pt-4">
              <SmartLocationsPanel
                currentLocation={currentLocation}
                locationOrigin={locationOrigin}
                savedLocations={savedLocations}
                onSaveLocation={onSaveLocation}
                onDeleteLocation={onDeleteLocation}
                onUpdateLocation={onUpdateLocation}
                onSelectSavedLocation={onSelectSavedLocation}
                onSetAsDestination={onSetAsDestination}
                onUseMyLocation={handleUseMyLocation}
                isGpsLoading={isGpsLoading}
                gpsError={gpsError}
                nearbyMatch={nearbyMatch}
                onAcceptNearbyMatch={onAcceptNearbyMatch}
                onRejectNearbyMatch={onRejectNearbyMatch}
                showSaveSuggestion={showSaveSuggestion}
                onAcceptSaveSuggestion={onAcceptSaveSuggestion}
                onRejectSaveSuggestion={onRejectSaveSuggestion}
              />
            </div>
          </div>
        </CompactSectionCard>
      </div>

      {/* Widget preview compacto enlazado */}
      <div className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono text-cyan-400 block uppercase tracking-wider">Widget Sincronizado</span>
          <span className="text-xs font-sans font-bold text-slate-200 block">SkyPanel Heurístico</span>
          <p className="text-[10px] text-slate-400 font-sans">Sincronizado con la pantalla de inicio Android.</p>
        </div>
        <button
          onClick={onNavigateToWidgets}
          className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 font-bold text-[10px] rounded-lg transition-all cursor-pointer font-sans active:scale-95"
        >
          Ver Widget
        </button>
      </div>
    </div>
  );
}
