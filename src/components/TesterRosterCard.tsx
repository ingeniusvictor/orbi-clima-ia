import React, { useState } from 'react';
import { Users, Plus, Trash2, CheckCircle, UserCheck, Smartphone, Mail } from 'lucide-react';
import { InternalTester, TesterRole, TesterStatus } from '../services/rcClosureStateService';

interface TesterRosterCardProps {
  testers: InternalTester[];
  onAddTester: (tester: any) => void;
  onUpdateTester: (id: string, partial: any) => void;
  onRemoveTester: (id: string) => void;
}

const AVAILABLE_FOCUSES = [
  'Instalación',
  'Open-Meteo',
  'GPS',
  'Perfil Persona',
  'Perfil Técnico Terreno',
  'Widgets',
  'Notificaciones',
  'Quiet Hours',
  'Modo offline',
  'Privacidad local',
  'Mobile UX'
];

export default function TesterRosterCard({
  testers,
  onAddTester,
  onUpdateTester,
  onRemoveTester
}: TesterRosterCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<TesterRole>('general_user');
  const [deviceModel, setDeviceModel] = useState('');
  const [androidVersion, setAndroidVersion] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFocuses, setSelectedFocuses] = useState<string[]>([]);

  const handleToggleFocus = (focus: string) => {
    if (selectedFocuses.includes(focus)) {
      setSelectedFocuses(selectedFocuses.filter(f => f !== focus));
    } else {
      setSelectedFocuses([...selectedFocuses, focus]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddTester({
      name,
      role,
      deviceModel: deviceModel || undefined,
      androidVersion: androidVersion || undefined,
      testFocus: selectedFocuses.length > 0 ? selectedFocuses : ['General'],
      status: 'pending',
      notes: notes || undefined,
      email: email || undefined
    });

    // Reset Form
    setName('');
    setRole('general_user');
    setDeviceModel('');
    setAndroidVersion('');
    setEmail('');
    setNotes('');
    setSelectedFocuses([]);
    setIsAdding(false);
  };

  return (
    <div className="p-4 rounded-2xl bg-[#090d19]/90 border border-slate-800 font-sans text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Registro de Testers Locales</h4>
            <p className="text-[10px] text-slate-400">Control de testing cerrado para Play Console</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-2.5 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 hover:text-pink-300 font-mono text-[10px] font-bold rounded-lg cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> {isAdding ? 'CANCELAR' : 'NUEVO'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-5 p-3.5 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3.5 text-xs text-slate-300">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-[#050914] border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-pink-500/40"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Rol de Tester</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TesterRole)}
                className="w-full bg-[#050914] border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-pink-500/40"
              >
                <option value="general_user">Usuario General</option>
                <option value="field_tech">Técnico de Terreno</option>
                <option value="qa_reviewer">Revisor QA</option>
                <option value="developer">Desarrollador</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Modelo Dispositivo</label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="Ej. Galaxy S24"
                className="w-full bg-[#050914] border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-pink-500/40"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Versión Android</label>
              <input
                type="text"
                value={androidVersion}
                onChange={(e) => setAndroidVersion(e.target.value)}
                placeholder="Ej. 14 o 15"
                className="w-full bg-[#050914] border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-pink-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Correo (Opcional - solo para Play Console)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full bg-[#050914] border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-pink-500/40"
            />
          </div>

          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">Foco de Prueba</span>
            <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1.5 bg-[#050914] rounded-lg border border-slate-800/80">
              {AVAILABLE_FOCUSES.map(focus => {
                const checked = selectedFocuses.includes(focus);
                return (
                  <button
                    type="button"
                    key={focus}
                    onClick={() => handleToggleFocus(focus)}
                    className={`px-2 py-1 rounded-md text-[9px] font-medium border transition-all ${
                      checked
                        ? 'bg-pink-500/15 border-pink-500/30 text-pink-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {focus}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Notas u Observaciones</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas sobre el estado o comentarios del tester..."
              rows={2}
              className="w-full bg-[#050914] border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-pink-500/40 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-pink-950/20"
          >
            GUARDAR TESTER LOCAL
          </button>
        </form>
      )}

      {/* Roster List */}
      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
        {testers.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-[11px] font-mono">
            No hay testers locales registrados. Registra tu equipo para pruebas privadas.
          </div>
        ) : (
          testers.map(tester => (
            <div
              key={tester.id}
              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-200">{tester.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border uppercase tracking-wide ${
                    tester.role === 'field_tech' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    tester.role === 'qa_reviewer' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                    tester.role === 'developer' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                    'bg-slate-500/10 border-slate-500/20 text-slate-400'
                  }`}>
                    {tester.role === 'field_tech' ? 'Técnico Terreno' :
                     tester.role === 'qa_reviewer' ? 'Revisor QA' :
                     tester.role === 'developer' ? 'Desarrollador' : 'Usuario General'}
                  </span>

                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border uppercase tracking-wide ${
                    tester.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    tester.status === 'testing' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                    tester.status === 'blocked' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                    tester.status === 'invited' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                    'bg-slate-500/10 border-slate-500/20 text-slate-400'
                  }`}>
                    {tester.status === 'completed' ? 'Completado' :
                     tester.status === 'testing' ? 'Prueba Activa' :
                     tester.status === 'blocked' ? 'Bloqueado' :
                     tester.status === 'invited' ? 'Invitado' : 'Pendiente'}
                  </span>
                </div>

                {tester.deviceModel && (
                  <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 font-mono">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{tester.deviceModel} (Android {tester.androidVersion || '?'})</span>
                    {(tester as any).email && (
                      <>
                        <span className="text-slate-600">|</span>
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{(tester as any).email}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="text-[9px] text-slate-400">
                  <span className="font-mono text-slate-500 block uppercase text-[8px] leading-none mb-1">Foco de Prueba:</span>
                  <div className="flex flex-wrap gap-1">
                    {tester.testFocus.map(f => (
                      <span key={f} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[8.5px]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {tester.notes && (
                  <p className="text-[9.5px] text-slate-400 bg-black/20 p-1.5 rounded-lg border border-slate-800/40 italic mt-1.5">
                    "{tester.notes}"
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800/40 pt-2 sm:pt-0">
                <select
                  value={tester.status}
                  onChange={(e) => onUpdateTester(tester.id, { status: e.target.value as TesterStatus })}
                  className="bg-[#050914] border border-slate-800 text-[9px] font-medium text-slate-300 rounded-lg py-1 px-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="pending">Pendiente</option>
                  <option value="invited">Invitado</option>
                  <option value="testing">Prueba Activa</option>
                  <option value="completed">Completado</option>
                  <option value="blocked">Bloqueado</option>
                </select>

                <button
                  onClick={() => onRemoveTester(tester.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Eliminar Tester"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
