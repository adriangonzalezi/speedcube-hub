'use client';
// Progreso con los algoritmos: estado de cada caso, algoritmo elegido, algoritmo propio
// y repaso espaciado. También guarda preferencias de la interfaz (filtros, tema, menú).
import { useCallback, useMemo } from 'react';
import { allCases, type AlgCase, type CaseSet, type CaseWithSet } from '@/data/algorithms';
import { KEYS, usePersistentState } from '@/lib/storage';

export type Status = 'new' | 'learning' | 'known';
export const STATUS_LABEL: Record<Status, string> = { new: 'Pendiente', learning: 'En práctica', known: 'Dominado' };
const STATUS_CYCLE: Status[] = ['new', 'learning', 'known'];

export type SortKey = 'num' | 'group' | 'len' | 'status';
export type TrainPool = 'due' | 'learning' | 'notknown' | 'all';
export interface UiPrefs {
  status: 'all' | Status;
  groups: Record<CaseSet, string[]>;
  sort: SortKey;
  trainSet: CaseSet | 'all';
  trainPool: TrainPool;
  theme: '' | 'light' | 'dark';
  sideCollapsed: boolean;
  /** Mostrar los algoritmos separados en bloques: (R U R' U') (R' F R F') */
  groupAlgs: boolean;
}
interface SrsEntry { box: number; due: number }
interface ProgressStore {
  status: Record<string, Status>;
  pick: Record<string, number>;
  custom: Record<string, string>;
  srs: Record<string, SrsEntry>;
  ui: Partial<UiPrefs>;
}

const DEFAULT_UI: UiPrefs = { status: 'all', groups: { f2l: [], oll: [], pll: [] }, sort: 'num', trainSet: 'oll', trainPool: 'notknown', theme: '', sideCollapsed: false, groupAlgs: true };
const INITIAL: ProgressStore = { status: {}, pick: {}, custom: {}, srs: {}, ui: {} };

// Repaso espaciado (cajas de Leitner): días hasta el siguiente repaso según la caja
const DAY = 86_400_000;
export const SRS_BOXES = [0, 1, 3, 7, 14, 30, 60];

export function useProgress() {
  const [store, setStore] = usePersistentState<ProgressStore>(KEYS.progress, INITIAL);
  const prefs: UiPrefs = useMemo(() => ({ ...DEFAULT_UI, ...store.ui, groups: { ...DEFAULT_UI.groups, ...store.ui?.groups } }), [store.ui]);

  const statusOf = useCallback((c: Pick<AlgCase, 'id'>): Status => store.status[c.id] ?? 'new', [store.status]);
  const algsOf = useCallback((c: AlgCase) => (store.custom[c.id] ? [...c.algs, store.custom[c.id]] : c.algs), [store.custom]);
  const myIndex = useCallback((c: AlgCase) => { const i = store.pick[c.id] ?? 0; return i < algsOf(c).length ? i : 0; }, [store.pick, algsOf]);
  const myAlg = useCallback((c: AlgCase) => algsOf(c)[myIndex(c)], [algsOf, myIndex]);

  const setStatus = useCallback((id: string, st: Status) => setStore(p => {
    const status = { ...p.status };
    if (st === 'new') delete status[id]; else status[id] = st;
    return { ...p, status };
  }), [setStore]);
  const cycleStatus = useCallback((id: string): Status => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(store.status[id] ?? 'new') + 1) % 3];
    setStatus(id, next); return next;
  }, [store.status, setStatus]);
  const pickAlg = useCallback((id: string, i: number) => setStore(p => ({ ...p, pick: { ...p.pick, [id]: i } })), [setStore]);
  const setCustom = useCallback((c: AlgCase, alg: string) => setStore(p => {
    const custom = { ...p.custom }; const pick = { ...p.pick };
    if (alg) { custom[c.id] = alg; pick[c.id] = c.algs.length; } else { delete custom[c.id]; delete pick[c.id]; }
    return { ...p, custom, pick };
  }), [setStore]);
  const setPrefs = useCallback((u: Partial<UiPrefs>) => setStore(p => ({ ...p, ui: { ...p.ui, ...u } })), [setStore]);

  const isDue = useCallback((c: CaseWithSet) => { const r = store.srs[c.id]; return r ? r.due <= Date.now() : statusOf(c) === 'learning'; }, [store.srs, statusOf]);
  const srsBox = useCallback((id: string) => store.srs[id]?.box ?? 0, [store.srs]);
  /** Devuelve true si el caso acaba de pasar a Dominado */
  const srsGrade = useCallback((c: AlgCase, good: boolean) => {
    let promoted = false;
    setStore(p => {
      const r = p.srs[c.id] ?? { box: 0, due: 0 };
      const box = good ? Math.min(r.box + 1, SRS_BOXES.length - 1) : 0;
      const status = { ...p.status };
      if (!good && status[c.id] !== 'learning') status[c.id] = 'learning';
      if (good && box >= 4 && status[c.id] !== 'known') { status[c.id] = 'known'; promoted = true; }
      return { ...p, status, srs: { ...p.srs, [c.id]: { box, due: Date.now() + (good ? SRS_BOXES[box] * DAY : 0) } } };
    });
    return promoted;
  }, [setStore]);

  const counts = useCallback((set: CaseSet, list: AlgCase[]) => ({
    total: list.length,
    known: list.filter(c => statusOf(c) === 'known').length,
    learning: list.filter(c => statusOf(c) === 'learning').length,
    set,
  }), [statusOf]);
  const dueCount = useMemo(() => allCases().filter(isDue).length, [isDue]);

  return { prefs, setPrefs, statusOf, algsOf, myIndex, myAlg, setStatus, cycleStatus, pickAlg, setCustom, isDue, srsBox, srsGrade, counts, dueCount, custom: store.custom };
}
export type Progress = ReturnType<typeof useProgress>;
