'use client';
// Máquina de estados del cronómetro, como un stackmat / csTimer:
// idle → (pre → inspect) → hold → ready → run → idle
// · Mantener pulsado 0,3 s pone el tiempo en verde; al soltar arranca.
// · Con inspección WCA: pulsar y soltar empieza 15 s; pasar de 15 s es +2 y de 17 s DNF.
// · Multifase: mientras corre, cada pulsación marca el final de una fase hasta la última.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Penalty } from '@/lib/timer/stats';

export type TimerPhase = 'idle' | 'pre' | 'inspect' | 'hold' | 'ready' | 'run';
const HOLD_MS = 300;

interface Options {
  enabled: boolean;
  inspection: boolean;
  voice: boolean;
  phases: number;
  onFinish: (ms: number, penalty: Penalty, splits: number[]) => void;
}

function speak(text: string) {
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'es-ES'; speechSynthesis.speak(u); } catch { /* sin voz */ }
}

export function useStackmat(opts: Options) {
  const [phase, setPhaseState] = useState<TimerPhase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [inspLeft, setInspLeft] = useState(15_000);
  const [splits, setSplits] = useState<number[]>([]);
  const [inspecting, setInspecting] = useState(false);
  const phaseRef = useRef<TimerPhase>('idle');
  const cfg = useRef(opts); cfg.current = opts;
  const t = useRef({ runStart: 0, inspStart: 0, penalty: null as Penalty, splits: [] as number[], ignoreUp: false, raf: 0, readyTimer: 0 as ReturnType<typeof setTimeout> | 0, spoken: new Set<number>() });

  const setPhase = (p: TimerPhase) => { phaseRef.current = p; setPhaseState(p); };
  const stopLoops = () => { cancelAnimationFrame(t.current.raf); if (t.current.readyTimer) clearTimeout(t.current.readyTimer); };

  const finish = useCallback((ms: number, penalty: Penalty) => {
    stopLoops();
    const sp = t.current.splits.length && ms ? [...t.current.splits.map(Math.round), Math.round(ms)] : [];
    t.current.splits = []; setSplits([]); t.current.inspStart = 0; t.current.penalty = null;
    setInspecting(false); setPhase('idle');
    cfg.current.onFinish(Math.round(ms), penalty, sp);
  }, []);

  const tickInspect = useCallback(() => {
    const left = 15_000 - (performance.now() - t.current.inspStart);
    if (cfg.current.voice) for (const [at, msg] of [[7000, 'Ocho segundos'], [3000, 'Doce segundos']] as const)
      if (left <= at && !t.current.spoken.has(at)) { t.current.spoken.add(at); speak(msg); }
    if (left <= -2000) { finish(0, 'DNF'); return; }
    setInspLeft(left);
    if (['inspect', 'hold', 'ready'].includes(phaseRef.current)) t.current.raf = requestAnimationFrame(tickInspect);
  }, [finish]);

  const tickRun = useCallback(() => {
    if (phaseRef.current !== 'run') return;
    setElapsed(performance.now() - t.current.runStart);
    t.current.raf = requestAnimationFrame(tickRun);
  }, []);

  const beginHold = useCallback(() => {
    setPhase('hold');
    t.current.readyTimer = setTimeout(() => { if (phaseRef.current === 'hold') setPhase('ready'); }, HOLD_MS);
  }, []);
  const stopOrSplit = useCallback(() => {
    const now = performance.now() - t.current.runStart;
    if (t.current.splits.length < cfg.current.phases - 1) { t.current.splits.push(now); setSplits([...t.current.splits]); t.current.ignoreUp = true; return; }
    finish(now, t.current.penalty); t.current.ignoreUp = true;
  }, [finish]);

  const press = useCallback(() => {
    const p = phaseRef.current;
    if (p === 'run') { stopOrSplit(); return; }
    t.current.ignoreUp = false;
    if (p === 'idle') { if (cfg.current.inspection) setPhase('pre'); else beginHold(); }
    else if (p === 'inspect') beginHold();
  }, [stopOrSplit, beginHold]);

  const release = useCallback(() => {
    if (t.current.ignoreUp) { t.current.ignoreUp = false; return; }
    const p = phaseRef.current;
    if (p === 'pre') {
      t.current.inspStart = performance.now(); t.current.spoken.clear(); setInspLeft(15_000); setInspecting(true);
      setPhase('inspect'); cancelAnimationFrame(t.current.raf); tickInspect(); return;
    }
    if (p === 'hold') { if (t.current.readyTimer) clearTimeout(t.current.readyTimer); setPhase(t.current.inspStart ? 'inspect' : 'idle'); return; }
    if (p === 'ready') {
      if (t.current.inspStart) t.current.penalty = 15_000 - (performance.now() - t.current.inspStart) < 0 ? '+2' : null;
      t.current.runStart = performance.now(); t.current.splits = []; setSplits([]); setElapsed(0); setInspecting(false);
      setPhase('run'); cancelAnimationFrame(t.current.raf); tickRun();
    }
  }, [tickInspect, tickRun]);

  const cancel = useCallback(() => { stopLoops(); t.current.inspStart = 0; t.current.splits = []; setSplits([]); setInspecting(false); setPhase('idle'); }, []);

  // Teclado: espacio para empezar; cualquier tecla para parar; Escape cancela
  useEffect(() => {
    if (!opts.enabled) return;
    const typing = () => /INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement)?.tagName) || !!document.querySelector('dialog[open]');
    const down = (e: KeyboardEvent) => {
      if (typing()) return;
      if (phaseRef.current === 'run') { e.preventDefault(); if (!e.repeat) stopOrSplit(); return; }
      if (e.key === 'Escape') { cancel(); return; }
      if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) press(); }
    };
    const up = (e: KeyboardEvent) => { if (!typing() && e.code === 'Space') { e.preventDefault(); release(); } };
    // con el cronómetro en marcha, tocar en cualquier sitio lo para
    const pointer = (e: PointerEvent) => { if (phaseRef.current === 'run') { e.preventDefault(); e.stopPropagation(); stopOrSplit(); } };
    document.addEventListener('keydown', down); document.addEventListener('keyup', up); document.addEventListener('pointerdown', pointer, true);
    return () => { document.removeEventListener('keydown', down); document.removeEventListener('keyup', up); document.removeEventListener('pointerdown', pointer, true); };
  }, [opts.enabled, press, release, cancel, stopOrSplit]);

  useEffect(() => () => stopLoops(), []);

  return { phase, elapsed, inspLeft, splits, press, release, cancel, inspecting };
}
