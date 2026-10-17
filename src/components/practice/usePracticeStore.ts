'use client';
// Datos de los entrenadores de Práctica (las tarjetas usan el repaso espaciado de useProgress).
import type { CaseSet } from '@/data/algorithms';
import { KEYS, usePersistentState } from '@/lib/storage';

export interface PracticeStore {
  /** Reconocimiento por caso: intentos, aciertos y tiempo medio (ms) */
  recog: Record<string, { n: number; ok: number; ms: number }>;
  /** Casos cronometrados: últimos 5 tiempos de ejecución (ms) */
  cases: Record<string, number[]>;
  cross: { n: number; sumOpt: number; matched: number };
  ls: { n: number; ok: number };
  opt: { recogSet: CaseSet; casesSet: CaseSet; casesPool: 'learning' | 'notknown' | 'all' };
}
const INITIAL: PracticeStore = {
  recog: {}, cases: {}, cross: { n: 0, sumOpt: 0, matched: 0 }, ls: { n: 0, ok: 0 },
  opt: { recogSet: 'oll', casesSet: 'oll', casesPool: 'notknown' },
};
export const PRACTICE_INITIAL = INITIAL;

export function usePracticeStore() {
  const [store, setStore] = usePersistentState<PracticeStore>(KEYS.practice, INITIAL);
  const opt = { ...INITIAL.opt, ...store.opt };
  return { store: { ...store, opt }, setStore, setOpt: (u: Partial<PracticeStore['opt']>) => setStore(s => ({ ...s, opt: { ...INITIAL.opt, ...s.opt, ...u } })) };
}

export const SET_OPTIONS: [CaseSet, string][] = [['f2l', 'F2L'], ['oll', 'OLL'], ['pll', 'PLL']];
