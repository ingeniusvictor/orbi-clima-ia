import React, { useState } from 'react';
import { 
  Star, 
  Trash2, 
  Edit3, 
  Save, 
  MapPin, 
  Compass, 
  Briefcase, 
  Home, 
  Sun, 
  HelpCircle, 
  Plus, 
  X, 
  Check, 
  Info,
  Clock,
  Sparkles,
  MapPinOff
} from 'lucide-react';
import { WeatherLocation, SavedWeatherLocation } from '../types/weatherTypes';
import { calculateDistanceKm } from '../services/savedLocationsService';

interface SmartLocationsPanelProps {
  currentLocation: WeatherLocation;
  locationOrigin: 'gps' | 'manual' | 'saved' | 'destination' | 'demo' | 'cache' | 'setup';
  savedLocations: SavedWeatherLocation[];
  onSaveLocation: (label: string, type: 'home' | 'work' | 'solar_park' | 'custom') => void;
  onDeleteLocation: (id: string) => void;
  onUpdateLocation: (id: string, updates: Partial<SavedWeatherLocation>) => void;
  onSelectSavedLocation: (loc: SavedWeatherLocation) => void;
  onSetAsDestination: () => void;
  onUseMyLocation: () => void;
  isGpsLoading: boolean;
  gpsError: string | null;
  nearbyMatch: { location: SavedWeatherLocation; distanceKm: number } | null;
  onAcceptNearbyMatch: () => void;
  onRejectNearbyMatch: () => void;
  showSaveSuggestion: boolean;
  onAcceptSaveSuggestion: () => void;
  onRejectSaveSuggestion: () => void;
}

export default function SmartLocationsPanel({
  currentLocation,
  locationOrigin,
  savedLocations,
  onSaveLocation,
  onDeleteLocation,
  onUpdateLocation,
  onSelectSavedLocation,
  onSetAsDestination,
  onUseMyLocation,
  isGpsLoading,
  gpsError,
  nearbyMatch,
  onAcceptNearbyMatch,
  onRejectNearbyMatch,
  showSaveSuggestion,
  onAcceptSaveSuggestion,
  onRejectSaveSuggestion
}: SmartLocationsPanelProps) {
  const [isSavingFormOpen, setIsSavingFormOpen] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [saveType, setSaveType] = useState<'home' | 'work' | 'solar_park' | 'custom'>('custom');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editType, setEditType] = useState<'home' | 'work' | 'solar_park' | 'custom'>('custom');

  // Check if current active location is already saved (by matching coordinates closely or matching saved status)
  const isCurrentLocationSaved = savedLocations.some(
    loc => 
      loc.name.toLowerCase() === currentLocation.name.toLowerCase() ||
      (Math.abs(loc.latitude - currentLocation.latitude) < 0.01 &&
       Math.abs(loc.longitude - currentLocation.longitude) < 0.01)
  );

  const getIconForType = (type: 'home' | 'work' | 'solar_park' | 'custom') => {
    switch (type) {
      case 'home':
        return <Home className="w-3.5 h-3.5 text-rose-400" />;
      case 'work':
        return <Briefcase className="w-3.5 h-3.5 text-cyan-400" />;
      case 'solar_park':
        return <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
      case 'custom':
      default:
        return <MapPin className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const getLabelForType = (type: 'home' | 'work' | 'solar_park' | 'custom') => {
    switch (type) {
      case 'home': return 'Casa';
      case 'work': return 'Trabajo';
      case 'solar_park': return 'Planta Solar';
      case 'custom':
      default: return 'Otro';
    }
  };

  const handleOpenSaveForm = () => {
    setSaveLabel(currentLocation.name);
    setSaveType(currentLocation.id === 'parque_fotovoltaico_orbi' ? 'solar_park' : 'custom');
    setIsSavingFormOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveLabel.trim()) return;
    onSaveLocation(saveLabel.trim(), saveType);
    setIsSavingFormOpen(false);
  };

  const handleStartEdit = (loc: SavedWeatherLocation) => {
    setEditingId(loc.id);
    setEditLabel(loc.label);
    setEditType(loc.type);
  };

  const handleSaveEdit = (id: string) => {
    if (!editLabel.trim()) return;
    onUpdateLocation(id, { label: editLabel.trim(), type: editType });
    setEditingId(null);
  };

  return (
    <div className="space-y-4 font-sans" id="smart-locations-panel">
      
      {/* 1. SECCIÓN DE ALERTA: DETECCIÓN DE CERCANÍA GPS */}
      {nearbyMatch && (
        <div className="p-3.5 rounded-xl bg-cyan-950/45 border border-cyan-500/30 flex flex-col gap-2.5 animate-bounce shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1 bg-cyan-500/20 text-[8px] font-mono font-bold text-cyan-300 rounded-bl uppercase">
            Cercanía Detectada
          </div>
          <div className="flex gap-2 items-start">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">¿Estás en {nearbyMatch.location.label}?</h5>
              <p className="text-[10.5px] text-slate-300 leading-normal mt-0.5">
                Tu GPS actual indica que estás a sólo <span className="font-bold text-cyan-400 font-mono">{nearbyMatch.distanceKm.toFixed(1)} km</span> de tu ubicación guardada. ¿Quieres usarla?
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onAcceptNearbyMatch}
              className="flex-1 py-1.5 px-3 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-lg hover:bg-cyan-400 active:scale-95 transition-all cursor-pointer select-none"
            >
              Sí, usar "{nearbyMatch.location.label}"
            </button>
            <button
              onClick={onRejectNearbyMatch}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-300 text-[10px] font-semibold rounded-lg active:scale-95 transition-all cursor-pointer select-none"
            >
              Solo usar GPS
            </button>
          </div>
        </div>
      )}

      {/* 2. SECCIÓN DE ALERTA: SUGERENCIA DE GUARDAR NUEVA UBICACIÓN */}
      {showSaveSuggestion && !isCurrentLocationSaved && locationOrigin === 'gps' && (
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col gap-2.5 animate-fade-in shadow-[0_0_12px_rgba(99,102,241,0.15)]">
          <div className="flex gap-2 items-start">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
              <Plus className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">¿Guardar esta ubicación frecuente?</h5>
              <p className="text-[10.5px] text-slate-300 leading-normal mt-0.5">
                Has detectado tu ubicación GPS real en <span className="font-bold text-indigo-300">{currentLocation.name}</span>. ¿Quieres guardarla para verla rápidamente después?
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onAcceptSaveSuggestion}
              className="flex-1 py-1.5 px-3 bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-bold rounded-lg active:scale-95 transition-all cursor-pointer select-none"
            >
              Guardar Ubicación
            </button>
            <button
              onClick={onRejectSaveSuggestion}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-300 text-[10px] font-semibold rounded-lg active:scale-95 transition-all cursor-pointer select-none"
            >
              Ahora no
            </button>
          </div>
        </div>
      )}

      {/* 3. UBICACIÓN ACTIVA DETALLES Y ACCIONES */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">
            Ubicación Activa
          </span>
          {isCurrentLocationSaved ? (
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" /> GUARDADA EN DISPOSITIVO
            </span>
          ) : (
            locationOrigin !== 'demo' && locationOrigin !== 'setup' && (
              <button
                onClick={handleOpenSaveForm}
                className="text-[9.5px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/5 hover:bg-cyan-500/15 border border-cyan-500/10 px-2 py-1 rounded-lg transition-all cursor-pointer select-none"
              >
                <Plus className="w-3 h-3" /> GUARDAR COMO FRECUENTE
              </button>
            )
          )}
        </div>

        <div className="flex items-center justify-between gap-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <MapPin className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {currentLocation.name}
                <span className="text-[10px] font-normal text-slate-400">
                  ({currentLocation.region})
                </span>
              </div>
              <div className="text-[9.5px] font-mono text-slate-400 mt-0.5">
                Lat: {currentLocation.latitude.toFixed(4)}° · Lon: {currentLocation.longitude.toFixed(4)}°
              </div>
            </div>
          </div>

          <div className="text-right">
            {locationOrigin === 'manual' && (
              <button
                onClick={onSetAsDestination}
                className="py-1 px-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer select-none"
              >
                Marcar Destino
              </button>
            )}
          </div>
        </div>

        {/* Formulario para guardar ubicación activa */}
        {isSavingFormOpen && (
          <form onSubmit={handleSaveSubmit} className="p-3 rounded-lg bg-slate-900/60 border border-white/10 space-y-3 animate-fadeIn">
            <div className="text-[10px] font-bold text-white font-mono uppercase tracking-wider flex justify-between items-center">
              <span>Guardar Ubicación Frecuente</span>
              <button type="button" onClick={() => setIsSavingFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-slate-400 uppercase">Nombre Personalizado</label>
              <input
                type="text"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                placeholder="Ej: Casa Rancagua, PMGD Parral..."
                className="w-full bg-black/40 border border-white/10 focus:border-cyan-500 text-xs text-white rounded-lg py-2 px-3 focus:outline-none transition-all font-sans"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-slate-400 uppercase">Tipo de Ubicación</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['home', 'work', 'solar_park', 'custom'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSaveType(type)}
                    className={`py-1.5 px-1 rounded-lg text-[9px] font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                      saveType === type
                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                        : 'bg-black/20 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {getIconForType(type)}
                    <span className="capitalize">{getLabelForType(type)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1.5">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 select-none"
              >
                <Save className="w-3.5 h-3.5" /> Confirmar Guardado
              </button>
              <button
                type="button"
                onClick={() => setIsSavingFormOpen(false)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer select-none"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. LISTADO DE UBICACIONES FRECUENTES GUARDADAS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Mis Ubicaciones Guardadas ({savedLocations.length})
          </span>
          {savedLocations.length > 0 && (
            <span className="text-[9px] font-mono text-slate-500">
              Favoritas arriba ★
            </span>
          )}
        </div>

        {savedLocations.length === 0 ? (
          <div className="p-5 rounded-xl border border-dashed border-white/5 bg-white/[0.01] text-center space-y-2">
            <MapPinOff className="w-5 h-5 text-slate-600 mx-auto" />
            <div className="text-[11px] font-bold text-slate-300">Aún no tienes ubicaciones guardadas</div>
            <p className="text-[10px] text-slate-500 leading-normal max-w-xs mx-auto">
              Busca una ciudad o activa tu GPS real, y presiona <span className="text-cyan-400">"Guardar como frecuente"</span> para agregarlas a tu panel rápido de terreno.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {savedLocations
              .slice()
              // Sort favorites first, then by lastUsedAt desc
              .sort((a, b) => {
                if (a.isFavorite && !b.isFavorite) return -1;
                if (!a.isFavorite && b.isFavorite) return 1;
                return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
              })
              .map((loc) => {
                const isEditing = editingId === loc.id;
                const isSelected = 
                  currentLocation.name.toLowerCase() === loc.name.toLowerCase() ||
                  (Math.abs(currentLocation.latitude - loc.latitude) < 0.01 &&
                   Math.abs(currentLocation.longitude - loc.longitude) < 0.01);

                return (
                  <div
                    key={loc.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-2 relative group ${
                      isSelected
                        ? 'bg-indigo-950/25 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                        : 'bg-black/30 hover:bg-black/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Visual Line Accent for active */}
                    {isSelected && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-400 rounded-r" />
                    )}

                    {isEditing ? (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="flex-1 bg-black/50 border border-white/15 text-xs text-white rounded-lg py-1 px-2.5 focus:outline-none"
                            placeholder="Etiqueta..."
                            required
                          />
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as any)}
                            className="bg-black/50 border border-white/15 text-[10px] text-white rounded-lg py-1 px-1.5 focus:outline-none"
                          >
                            <option value="home">Casa</option>
                            <option value="work">Trabajo</option>
                            <option value="solar_park">Planta Solar</option>
                            <option value="custom">Otro</option>
                          </select>
                        </div>
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleSaveEdit(loc.id)}
                            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-bold rounded flex items-center gap-1 cursor-pointer select-none"
                          >
                            <Check className="w-3 h-3" /> Listo
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-bold rounded cursor-pointer select-none"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1.5">
                        <button
                          onClick={() => onSelectSavedLocation(loc)}
                          className="flex-1 text-left flex items-start gap-2 group/btn cursor-pointer"
                        >
                          <div className="mt-0.5 p-1.5 rounded-lg bg-white/5 group-hover/btn:bg-indigo-500/20 text-slate-400 group-hover/btn:text-indigo-400 transition-all">
                            {getIconForType(loc.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-bold text-white group-hover/btn:text-cyan-300 transition-colors flex items-center gap-1.5 truncate">
                              {loc.label}
                              {loc.isFavorite && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono truncate">
                              {loc.name} · {loc.region}
                            </div>
                            <div className="text-[8px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                              <Clock className="w-2 h-2" />
                              Usada: {new Date(loc.lastUsedAt).toLocaleDateString('es-CL')}
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onUpdateLocation(loc.id, { isFavorite: !loc.isFavorite })}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              loc.isFavorite 
                                ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' 
                                : 'bg-black/20 border-white/5 hover:border-white/10 text-slate-500 hover:text-slate-300'
                            }`}
                            title={loc.isFavorite ? 'Quitar favorita' : 'Marcar favorita'}
                          >
                            <Star className={`w-3.5 h-3.5 ${loc.isFavorite ? 'fill-amber-400' : ''}`} />
                          </button>
                          
                          <button
                            onClick={() => handleStartEdit(loc)}
                            className="p-1.5 bg-black/20 hover:bg-white/5 active:bg-white/10 border border-white/5 text-slate-500 hover:text-slate-300 rounded-lg transition-all cursor-pointer"
                            title="Editar nombre"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteLocation(loc.id)}
                            className="p-1.5 bg-rose-500/5 hover:bg-rose-500/15 active:bg-rose-500/20 border border-rose-500/10 text-rose-400 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* 5. PRIVACIDAD Y MICROCOPY TERRENO */}
      <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 space-y-1.5 text-left text-[9px] font-sans leading-relaxed text-slate-400">
        <div className="flex gap-1.5 items-start text-cyan-400 font-bold uppercase tracking-wider font-mono">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Información de terreno y Privacidad</span>
        </div>
        <p>
          Puedes guardar parques, plantas solares o ciudades frecuentes para revisar rápidamente sus condiciones climáticas de destino. ORBI puede comparar tu ubicación actual con tus lugares guardados cuando activas el GPS para detectar cercanía.
        </p>
        <p className="border-t border-white/5 pt-1.5 text-[8.5px] font-mono text-slate-500 uppercase tracking-tight">
          🔐 Tus ubicaciones frecuentes se guardan sólo en este dispositivo. No usamos ubicación en segundo plano en esta versión. La ubicación se consulta únicamente cuando abres la app o pulsas el botón de GPS.
        </p>
      </div>

    </div>
  );
}
