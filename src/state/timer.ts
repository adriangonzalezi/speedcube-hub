'use client';
// Datos del cronómetro: sesiones de tiempos y ajustes.
import { useCallback, useMemo } from 'react';
import { KEYS, usePersistentState } from '@/lib/storage';
import { rolling, type Penalty, type Solve } from '@/lib/timer/stats';

export interface Session { id: number; name: string; solves: Solve[] }
/** timer: el cronómetro de la web · manual: escribes el tiempo de tu cronómetro físico */
export type InputMode = 'timer' | 'manual';
export interface TimerData { sessions: Session[]; cur: number; insp: boolean; voice: boolean; phases: number; input: InputMode }
const INITIAL: TimerData = { sessions: [{ id: 1, name: 'Sesión 1', solves: [] }], cur: 1, insp: false, voice: false, phases: 1, input: 'timer' };

export function useTimerData() {
  const [data, setData] = usePersistentState<TimerData>(KEYS.timer, INITIAL);
  const session = data.sessions.find(s => s.id === data.cur) ?? data.sessions[0];
  const solves = session.solves;
  const roll = useMemo(() => rolling(solves), [solves]);

  const updateSession = useCallback((fn: (s: Session) => Session) =>
    setData(d => ({ ...d, sessions: d.sessions.map(s => (s.id === d.cur ? fn(s) : s)) })), [setData]);

  return {
    data, session, solves, roll,
    setSettings: (u: Partial<Pick<TimerData, 'insp' | 'voice' | 'phases' | 'input'>>) => setData(d => ({ ...d, ...u })),
    addSolve: (solve: Solve) => updateSession(s => ({ ...s, solves: [...s.solves, solve] })),
    setPenalty: (i: number, p: Penalty) => updateSession(s => ({ ...s, solves: s.solves.map((x, j) => (j === i ? { ...x, p } : x)) })),
    deleteSolve: (i: number) => updateSession(s => ({ ...s, solves: s.solves.filter((_, j) => j !== i) })),
    selectSession: (id: number) => setData(d => ({ ...d, cur: id })),
    newSession: () => setData(d => { const id = Math.max(...d.sessions.map(s => s.id)) + 1; return { ...d, cur: id, sessions: [...d.sessions, { id, name: `Sesión ${id}`, solves: [] }] }; }),
    renameSession: (name: string) => updateSession(s => ({ ...s, name })),
    clearSession: () => updateSession(s => ({ ...s, solves: [] })),
    deleteSession: () => setData(d => { const sessions = d.sessions.filter(s => s.id !== d.cur); return sessions.length ? { ...d, sessions, cur: sessions[0].id } : d; }),
  };
}
