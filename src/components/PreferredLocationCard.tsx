import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import { WeatherLocation, PreferredLocationSnapshot } from '../types/weatherTypes';
import { loadUserPreferences, savePreferredLocation, clearPreferredLocation } from '../services/userPreferencesService';

interface PreferredLocationCardProps {
  currentLocation: WeatherLocation;
  weatherSourceMode: 'mock' | 'live' | 'cached' | 'fallback';
}

export default function PreferredLocationCard({ currentLocation, weatherSourceMode }: PreferredLocationCardProps) {
  const [prefs, setPrefs] = useState(() => loadUserPreferences());
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setPrefs(loadUserPreferences());
    };
    window.addEventListener('orbi-user-preferences-changed', handleUpdate);
    return () => {
      window.removeEventListener('orbi-user-preferences-changed', handleUpdate);
    };
  }, []);

  const preferredLoc = prefs.preferredLocation;
  const isCurrentSaved = preferredLoc && preferredLoc.id === currentLocation.id;

  // Check if current is from GPS
  const isGPS = currentLocation.id === 'gps_location' || weatherSourceMode === 'live' && currentLocation.region === 'GPS Detectado';

  const handleSave = () => {
    const snapshot: PreferredLocationSnapshot = {
      id: currentLocation.id,
      name: currentLocation.name,
      region: currentLocation.region,
      country: currentLocation.country,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      source: isGPS ? 'gps' : (weatherSourceMode === 'mock' ? 'demo' : 'manual'),
      savedAt: new Date().toISOString(),
    };
    savePreferredLocation(snapshot);
    
    // Record in memory (Módulo 7B)
    import('../services/weatherMemoryService').then(({ recordLocationUse }) => {
      recordLocationUse({
        id: currentLocation.id,
        name: currentLocation.name,
        region: currentLocation.region || '',
        country: currentLocation.country || 'Chile',
        source: isGPS ? 'gps_confirmed' : (weatherSourceMode === 'mock' ? 'demo' : 'manual')
      });
    });

    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };

  const handleClear = () => {
    clearPreferredLocation();
  };

  return (
    <div id="preferred-location-card" className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 font-sans">Ubicación Preferida</h3>
          <p className="text-xs text-slate-400 mt-0.5">Estación por defecto al iniciar</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
        ORBI puede recordar tu ubicación preferida para iniciar más rápido. Si usas GPS, la ubicación solo se guardará si lo confirmas.
      </p>

      {/* Current location status */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 mb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500">Ubicación en Pantalla</span>
          {isGPS && (
            <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/15">
              GPS ACTIVO
            </span>
          )}
        </div>
        <div className="flex justify-between items-center gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-200 block font-sans">
              {currentLocation.name}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Lat: {currentLocation.latitude?.toFixed(4) ?? '—'} · Lon: {currentLocation.longitude?.toFixed(4) ?? '—'}
            </span>
          </div>

          {isCurrentSaved ? (
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/15 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> PREFERIDA
            </span>
          ) : (
            <button
              onClick={handleSave}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                isGPS
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 active:scale-95'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95'
              }`}
            >
              {hasSaved ? 'Guardando...' : isGPS ? 'Confirmar y Guardar' : 'Guardar preferida'}
            </button>
          )}
        </div>
      </div>

      {/* Preferred location config */}
      {preferredLoc ? (
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Guardada actualmente</span>
            <span className="text-xs font-bold text-slate-300 block truncate font-sans">
              {preferredLoc.name} {preferredLoc.region ? `(${preferredLoc.region})` : ''}
            </span>
            <span className="text-[9px] text-slate-400 block font-sans">
              Origen: {preferredLoc.source === 'gps' ? 'GPS (Confirmado)' : preferredLoc.source === 'demo' ? 'Estación Demo' : 'Manual'}
            </span>
          </div>
          <button
            onClick={handleClear}
            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/10 transition-colors shrink-0"
            title="Eliminar ubicación preferida"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="pt-3 border-t border-slate-800/60 text-center py-2 bg-slate-950/40 rounded-xl border border-dashed border-slate-800/80">
          <span className="text-xs text-slate-500 italic font-sans">No hay una ubicación preferida guardada. Se usará la por defecto de la app.</span>
        </div>
      )}
    </div>
  );
}
