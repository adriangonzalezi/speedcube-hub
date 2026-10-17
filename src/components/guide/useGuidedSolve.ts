'use client';
// Estado de la resolución guiada: la mezcla y los pasos elegidos (guardados), y a partir de ahí
// el estado actual del cubo y las opciones del paso siguiente (calculados).
import { useMemo } from 'react';
import { apply, fromScramble, solvedSlots, solver, type CubeState, type SolveOption } from '@/lib/cube';
import { KEYS, readStore, usePersistentState } from '@/lib/storage';

interface ChosenStep { kind: SolveOption['kind']; label: string; alg: string; moves: number; slotName?: string }
interface GuideStore { scramble: string; chosen: ChosenStep[] }
const INITIAL: GuideStore = { scramble: '', chosen: [] };
/** Mezcla guardada (se lee directamente para no depender del primer render) */
export const savedScramble = () => readStore(KEYS.coach, INITIAL).scramble;

export function stepLabel(steps: ChosenStep[], i: number) {
  const c = steps[i];
  if (c.kind === 'cross') return 'Cruz';
  if (c.kind === 'extract') return 'Sacar pieza';
  if (c.kind === 'f2l') return `Pareja ${steps.slice(0, i + 1).filter(x => x.kind === 'f2l').length}`;
  return c.kind.toUpperCase();
}

export function useGuidedSolve() {
  const [store, setStore] = usePersistentState<GuideStore>(KEYS.coach, INITIAL);
  const start: CubeState | null = useMemo(() => { try { return store.scramble ? fromScramble(store.scramble) : null; } catch { return null; } }, [store.scramble]);
  const current = useMemo(() => (start ? store.chosen.reduce((s, c) => apply(s, c.alg), start) : null), [start, store.chosen]);
  const stage = current ? solver.stageOf(current) : null;
  const options = useMemo(() => (current && stage !== 'done' ? solver.options(current) : []), [current, stage]);
  const pairsDone = current ? solvedSlots(current).filter(Boolean).length : 0;

  return {
    scramble: store.scramble, chosen: store.chosen, current, stage, options, pairsDone,
    totalMoves: store.chosen.reduce((a, c) => a + c.moves, 0),
    /** Devuelve un mensaje de error si la mezcla no es válida */
    load(text: string): string | null {
      const clean = text.trim().replace(/\s+/g, ' ');
      if (!clean) return 'Escribe o genera una mezcla.';
      try { fromScramble(clean); } catch (e) { return `${(e as Error).message}. Usa la notación R U F L D B con ' y 2.`; }
      setStore({ scramble: clean, chosen: [] }); return null;
    },
    pick(o: SolveOption) { setStore(s => ({ ...s, chosen: [...s.chosen, { kind: o.kind, label: o.label, alg: o.alg, moves: o.moves, slotName: o.slotName }] })); },
    backTo(i: number) { setStore(s => ({ ...s, chosen: s.chosen.slice(0, i) })); },
    autoComplete() {
      if (!current) return;
      const rest = solver.solveAll(current);
      setStore(s => ({ ...s, chosen: [...s.chosen, ...rest.map(o => ({ kind: o.kind, label: o.label, alg: o.alg, moves: o.moves, slotName: o.slotName }))] }));
    },
  };
}
