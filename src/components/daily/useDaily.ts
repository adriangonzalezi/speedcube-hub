'use client';
// Reto diario: resultados por día, mezcla del día (con semilla) y racha.
import { useEffect, useState } from 'react';
import { seedFromDate, type Scramble } from '@/lib/cube/scramble';
import { shiftDay, todayKey } from '@/lib/dates';
import { KEYS, usePersistentState, writeStore } from '@/lib/storage';
import { effective, formatTime, type Penalty } from '@/lib/timer/stats';
import { useScrambler } from '@/state/AppProviders';

export interface DailyResult { t: number; p: Penalty; d: number }
interface DailyStore { results: Record<string, DailyResult>; scr: Record<string, Scramble> }
const INITIAL: DailyStore = { results: {}, scr: {} };

export const formatResult = (r: DailyResult) => (r.p === 'DNF' ? 'DNF' : formatTime(effective(r)) + (r.p === '+2' ? '+' : ''));
export const saveDailyResult = (day: string, r: DailyResult) => writeStore<DailyStore>(KEYS.daily, INITIAL, s => ({ ...s, results: { ...s.results, [day]: r } }));

export function streakOf(results: Record<string, unknown>) {
  let k = results[todayKey()] ? todayKey() : shiftDay(todayKey(), -1); let n = 0;
  while (results[k]) { n++; k = shiftDay(k, -1); }
  return n;
}
export function bestStreakOf(results: Record<string, unknown>) {
  let best = 0, run = 0, prev: string | null = null;
  for (const k of Object.keys(results).sort()) { run = prev && shiftDay(prev, 1) === k ? run + 1 : 1; best = Math.max(best, run); prev = k; }
  return best;
}

export function useDaily() {
  const [store, setStore] = usePersistentState<DailyStore>(KEYS.daily, INITIAL);
  const today = todayKey();
  return { store, today, result: store.results[today] as DailyResult | undefined, streak: streakOf(store.results), bestStreak: bestStreakOf(store.results), setStore };
}

/** Mezcla oficial del día: la misma para todo el mundo porque sale de una semilla con la fecha */
export function useDailyScramble(day: string) {
  const { store, setStore } = useDaily();
  const scrambler = useScrambler();
  const cached = store.scr[day];
  const [scramble, setScramble] = useState<Scramble | null>(null);
  useEffect(() => {
    // si ya hay resultado, no cambiar nunca la mezcla de ese día
    if (cached && (cached.kind === 'wca' || store.results[day])) { setScramble(cached); return; }
    let alive = true;
    scrambler.seeded(seedFromDate(day)).then(s => { if (!alive) return; setScramble(s); setStore(st => ({ ...st, scr: { ...st.scr, [day]: s } })); });
    return () => { alive = false; };
  }, [day, cached?.text]); // eslint-disable-line react-hooks/exhaustive-deps
  return scramble;
}
