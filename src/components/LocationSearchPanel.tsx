import { useState, useEffect } from 'react';
import { Search, MapPin, Compass, AlertTriangle, Check, Loader2, Sparkles, X } from 'lucide-react';
import { searchOpenMeteoLocations } from '../services/openMeteoClient';
import { LocationSearchResult } from '../types/weatherTypes';

interface LocationSearchPanelProps {
  onSelectLocation: (location: LocationSearchResult) => void;
  onUseMyLocation: () => void;
  isGpsLoading: boolean;
  gpsError: string | null;
  currentLocationName: string;
}

export default function LocationSearchPanel({
  onSelectLocation,
  onUseMyLocation,
  isGpsLoading,
  gpsError,
  currentLocationName
}: LocationSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const data = await searchOpenMeteoLocations(searchQuery);
        setResults(data);
        if (data.length === 0) {
          setError('No se encontraron ciudades con ese nombre.');
        }
      } catch (err) {
        setError('No se pudo conectar con el servicio de búsqueda. Revisa tu conexión.');
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-4" id="location-search-panel">
      {/* Title */}
      <div className="flex items-center justify-between">
        <label htmlFor="city-search-input" className="text-xs font-mono uppercase tracking-wider text-white/50 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          Búsqueda de Ciudad Inteligente
        </label>
        {currentLocationName && (
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {currentLocationName}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input field */}
        <div className="relative flex-1">
          <input
            id="city-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ej: Rancagua, Santiago, Alhué..."
            className="w-full bg-[#0d1527] border border-white/10 focus:border-cyan-500 text-xs text-white placeholder-white/30 rounded-xl py-2.5 pl-9 pr-8 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
          />
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-3" />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-2.5 p-0.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* GPS Button */}
        <button
          onClick={onUseMyLocation}
          disabled={isGpsLoading}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 active:bg-cyan-500/30 border border-cyan-500/25 hover:border-cyan-500/40 text-cyan-400 text-xs rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 transition-all font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          id="btn-use-gps"
        >
          {isGpsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          )}
          Detectar Ubicación
        </button>
      </div>

      {/* GPS Error indicator */}
      {gpsError && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-[11px] text-red-300 flex flex-col gap-3 animate-fadeIn" id="gps-error-premium">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-semibold block text-red-200 text-xs">Ubicación no disponible</span>
              <p className="text-red-300/90 mt-0.5">No pudimos acceder a tu ubicación. Puedes buscar tu ciudad manualmente.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 border-t border-red-500/10">
            <button
              onClick={() => {
                const el = document.getElementById('city-search-input');
                if (el) el.focus();
              }}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-sans font-medium rounded-lg transition-all cursor-pointer border border-white/5 active:scale-95"
            >
              🔎 Buscar ciudad
            </button>
            <button
              onClick={() => {
                onSelectLocation({
                  id: 1234567,
                  name: 'Rancagua',
                  region: "O'Higgins",
                  country: 'Chile',
                  latitude: -34.1708,
                  longitude: -70.7444,
                  timezone: 'America/Santiago',
                  source: 'open_meteo_geocoding'
                });
              }}
              className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-sans font-medium rounded-lg transition-all cursor-pointer border border-cyan-500/10 active:scale-95"
            >
              🇨🇱 Usar Rancagua en vivo
            </button>
            <button
              onClick={() => {
                onSelectLocation({
                  id: 7654321,
                  name: 'Santiago',
                  region: 'Metropolitana',
                  country: 'Chile',
                  latitude: -33.4489,
                  longitude: -70.6693,
                  timezone: 'America/Santiago',
                  source: 'open_meteo_geocoding'
                });
              }}
              className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-sans font-medium rounded-lg transition-all cursor-pointer border border-cyan-500/10 active:scale-95"
            >
              🇨🇱 Usar Santiago en vivo
            </button>
          </div>
        </div>
      )}

      {/* Internal status feedback */}
      {isSearching && (
        <div className="flex items-center gap-2 text-xs text-white/40 py-2 pl-1 font-mono">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          Buscando en catálogo Open-Meteo...
        </div>
      )}

      {error && !isSearching && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[11px] text-amber-300 flex items-start gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results List */}
      {results.length > 0 && !isSearching && (
        <div className="bg-[#0b1222] border border-white/5 rounded-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-white/5 shadow-xl shadow-black/30 animate-fadeIn">
          <div className="px-3.5 py-2 text-[9px] font-mono text-white/30 uppercase tracking-wider bg-white/2">
            Resultados de Búsqueda
          </div>
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectLocation(item);
                handleClear();
              }}
              className="w-full text-left px-4 py-3 hover:bg-cyan-500/5 hover:text-white flex items-center justify-between group transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-500/50 group-hover:text-cyan-400 transition-colors" />
                <div>
                  <div className="text-xs font-semibold text-white/90 group-hover:text-cyan-200">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-white/40 group-hover:text-white/60">
                    {item.region ? `${item.region}, ` : ''}{item.country}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-white/20 group-hover:text-white/40 transition-colors">
                  {item.latitude.toFixed(2)}°S · {item.longitude.toFixed(2)}°W
                </span>
                <span className="opacity-0 group-hover:opacity-100 text-cyan-400 text-[10px] font-mono transition-opacity">
                  Añadir ➔
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Privacy disclaimer */}
      <div className="text-[9.5px] font-mono text-white/20 mt-1 uppercase tracking-widest leading-relaxed border-t border-white/5 pt-2.5">
        🔐 PRIVACIDAD: ORBI Clima IA usa tu ubicación únicamente para consultar el pronóstico local en tiempo real. Coordenadas GPS no son guardadas permanentemente.
      </div>
    </div>
  );
}
