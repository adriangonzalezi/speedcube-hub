'use client';
// Progreso de las lecciones: cuáles has completado (y qué día), respuestas y unidades abiertas.
import { KEYS, usePersistentState } from '@/lib/storage';
import { todayKey } from '@/lib/dates';
import { LESSONS, unitOf } from './content';

interface LessonsStore { done: Record<string, string>; quiz: Record<string, number>; open: Record<string, boolean> }
const INITIAL: LessonsStore = { done: {}, quiz: {}, open: {} };
export const DAILY_GOAL = 2;

export function useLessons() {
  const [store, setStore] = usePersistentState<LessonsStore>(KEYS.lessons, INITIAL);
  const firstPending = LESSONS.find(l => !store.done[l.id]);
  const doneToday = Object.values(store.done).filter(d => d === todayKey()).length;
  return {
    store, firstPending, doneToday, goal: DAILY_GOAL,
    doneCount: LESSONS.filter(l => store.done[l.id]).length, total: LESSONS.length,
    complete: (id: string) => setStore(s => ({ ...s, done: { ...s.done, [id]: todayKey() } })),
    answer: (id: string, option: number) => setStore(s => ({ ...s, quiz: { ...s.quiz, [id]: option } })),
    setOpen: (unit: string, open: boolean) => setStore(s => ({ ...s, open: { ...s.open, [unit]: open } })),
    /** Resumen para la página de inicio */
    summary: () => ({ next: firstPending ? { id: firstPending.id, title: firstPending.title, minutes: firstPending.minutes, unit: unitOf(firstPending).title } : null }),
  };
}
