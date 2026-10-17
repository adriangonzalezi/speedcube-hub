'use client';
// Proveedores globales: avisos (toast), generador de mezclas (Web Worker) y modo especial del
// cronómetro (reto diario y casos cronometrados, que empiezan en otra página y acaban en el cronómetro).
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { randomMoveScramble, mulberry32, type Scramble } from '@/lib/cube/scramble';
import type { WorkerMessage } from '@/lib/cube/scramble.worker';
import type { Solve } from '@/lib/timer/stats';
import { useProgress } from './progress';

// ---------- Avisos ----------
const ToastContext = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

// ---------- Mezclas ----------
interface Scrambler { ready: boolean; take: () => Scramble; seeded: (seed: number) => Promise<Scramble> }
const ScramblerContext = createContext<Scrambler | null>(null);
export const useScrambler = () => useContext(ScramblerContext)!;

// ---------- Modo especial del cronómetro ----------
export interface SpecialMode {
  scramble: string;
  /** Mezcla con la que se dibuja la red (p. ej. con el amarillo arriba) */
  net?: string;
  label: string;
  banner: ReactNode;
  phases?: number;
  insp?: boolean;
  /** Devuelve otra configuración para seguir (casos cronometrados) o nada para terminar */
  onDone: (solve: Solve) => SpecialMode | void;
  onExit?: () => void;
}
/** start: activa · stop: el usuario sale (llama a onExit) · clear: termina sin más */
interface SpecialApi { special: SpecialMode | null; start: (m: SpecialMode) => void; stop: () => void; clear: () => void }
const SpecialContext = createContext<SpecialApi>({ special: null, start: () => {}, stop: () => {}, clear: () => {} });
export const useTimerSpecial = () => useContext(SpecialContext);

function useScramblerWorker(): Scrambler {
  const worker = useRef<Worker | null>(null);
  const queue = useRef<Scramble[]>([]);
  const pending = useRef(0);
  const waiting = useRef(new Map<number, (s: string | null) => void>());
  const early = useRef<{ id: number; seed: number }[]>([]);
  const nextId = useRef(1);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  const refill = useCallback(() => {
    const w = worker.current; if (!w || !readyRef.current) return;
    while (queue.current.length + pending.current < 2) { pending.current++; w.postMessage({ id: 0 }); }
  }, []);

  useEffect(() => {
    let w: Worker;
    try { w = new Worker(new URL('../lib/cube/scramble.worker.ts', import.meta.url)); } catch { return; }
    worker.current = w;
    w.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const m = e.data;
      if ('ready' in m) { readyRef.current = true; setReady(true); early.current.splice(0).forEach(r => w.postMessage(r)); refill(); return; }
      if (m.id) { const cb = waiting.current.get(m.id); waiting.current.delete(m.id); cb?.(m.scramble); return; }
      pending.current--; queue.current.push({ text: m.scramble, kind: 'wca' }); refill();
    };
    w.onerror = () => { worker.current = null; waiting.current.forEach(cb => cb(null)); waiting.current.clear(); };
    return () => w.terminate();
  }, [refill]);

  const take = useCallback((): Scramble => {
    const s = queue.current.shift() ?? { text: randomMoveScramble(), kind: 'moves' as const };
    refill(); return s;
  }, [refill]);

  const seeded = useCallback((seed: number) => new Promise<Scramble>(resolve => {
    const fallback = () => resolve({ text: randomMoveScramble(21, mulberry32(seed)), kind: 'moves' });
    const w = worker.current; if (!w) { fallback(); return; }
    const id = nextId.current++;
    const timer = setTimeout(() => { if (waiting.current.delete(id)) fallback(); }, 15_000);
    waiting.current.set(id, s => { clearTimeout(timer); if (s) resolve({ text: s, kind: 'wca' }); else fallback(); });
    if (readyRef.current) w.postMessage({ id, seed }); else early.current.push({ id, seed });
  }), []);

  return { ready, take, seeded };
}

function ThemeController() {
  const { prefs } = useProgress();
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme) root.dataset.theme = prefs.theme; else delete root.dataset.theme;
  }, [prefs.theme]);
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg); clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800);
  }, []);
  const scrambler = useScramblerWorker();
  const [special, setSpecial] = useState<SpecialMode | null>(null);
  const specialApi: SpecialApi = {
    special,
    start: setSpecial,
    stop: () => { const s = special; setSpecial(null); s?.onExit?.(); },
    clear: () => setSpecial(null),
  };

  return (
    <ToastContext.Provider value={toast}>
      <ScramblerContext.Provider value={scrambler}>
        <SpecialContext.Provider value={specialApi}>
          <ThemeController />
          {children}
          {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
        </SpecialContext.Provider>
      </ScramblerContext.Provider>
    </ToastContext.Provider>
  );
}
