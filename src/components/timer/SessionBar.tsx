'use client';
import type { useTimerData } from '@/state/timer';

type Timer = ReturnType<typeof useTimerData>;

/** Sesión, número de fases y opciones de inspección */
export function SessionBar({ timer }: { timer: Timer }) {
  const { data, session } = timer;
  const onSession = (v: string) => {
    if (v === 'rename') { const name = prompt('Nombre de la sesión', session.name); if (name?.trim()) timer.renameSession(name.trim()); }
    else if (v === 'clear') { if (confirm(`¿Vaciar todos los tiempos de «${session.name}»?`)) timer.clearSession(); }
    else if (v === 'delete') { if (confirm(`¿Borrar «${session.name}» y todos sus tiempos?`)) timer.deleteSession(); }
    else timer.selectSession(+v);
  };
  return (
    <div className="tm-bar">
      <label className="tm-session"><span className="label">Sesión</span>
        <select value={String(data.cur)} onChange={e => onSession(e.target.value)} aria-label="Sesión">
          {data.sessions.map(s => <option key={s.id} value={s.id}>{s.name} ({s.solves.length})</option>)}
          <option disabled>──────</option>
          <option value="rename">Renombrar sesión…</option>
          <option value="clear">Vaciar sesión…</option>
          {data.sessions.length > 1 && <option value="delete">Borrar sesión…</option>}
        </select>
      </label>
      <button className="btn ghost" onClick={timer.newSession}>Nueva sesión</button>
      <label className="tm-session"><span className="label">Fases</span>
        <select value={String(data.phases)} onChange={e => { timer.setSettings({ phases: +e.target.value }); e.target.blur(); }} aria-label="Fases a cronometrar">
          <option value="1">1 · normal</option>
          <option value="2">2 · F2L / última capa</option>
          <option value="3">3 · Cruz / F2L / última capa</option>
          <option value="4">4 · Cruz / F2L / OLL / PLL</option>
        </select>
      </label>
      <label className="tm-opt"><input type="checkbox" checked={data.insp} onChange={e => timer.setSettings({ insp: e.target.checked })} /> Inspección WCA (15 s)</label>
      <label className="tm-opt"><input type="checkbox" checked={data.voice} onChange={e => timer.setSettings({ voice: e.target.checked })} /> Avisos de voz (8 s / 12 s)</label>
    </div>
  );
}
