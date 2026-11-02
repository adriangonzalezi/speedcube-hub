'use client';
// Página del cronómetro. Une la mezcla, el tiempo, las estadísticas, la lista y la gráfica.
// También ejecuta el "modo especial" (reto diario, casos cronometrados) que activan otras páginas.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CubeNet } from '@/components/ui';
import { scrambleKindLabel, type Scramble } from '@/lib/cube/scramble';
import type { Penalty, Solve } from '@/lib/timer/stats';
import { useScrambler, useTimerSpecial } from '@/state/AppProviders';
import { useTimerData } from '@/state/timer';
import { EvolutionChart } from './EvolutionChart';
import { SessionBar } from './SessionBar';
import { SolveList } from './SolveList';
import { StatsPanel } from './StatsPanel';
import { ManualEntry } from './ManualEntry';
import { TimerStage } from './TimerStage';

export function TimerPage() {
  const timer = useTimerData();
  const scrambler = useScrambler();
  const { special, start, stop, clear } = useTimerSpecial();
  const [scramble, setScramble] = useState<Scramble | null>(null);
  const [lastSpecial, setLastSpecial] = useState<Solve | null>(null);

  // Primera mezcla, y cambiarla por una oficial en cuanto el generador esté listo
  useEffect(() => { setScramble(s => s ?? scrambler.take()); }, [scrambler]);
  useEffect(() => { if (scrambler.ready) setScramble(s => (s && s.kind === 'moves' ? scrambler.take() : s)); }, [scrambler.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = useMemo(() => (special ? { text: special.scramble, label: special.label, net: special.net ?? special.scramble }
    : scramble ? { text: scramble.text, label: scrambleKindLabel(scramble.kind), net: scramble.text } : null), [special, scramble]);

  const onFinish = useCallback((ms: number, p: Penalty, sp: number[]) => {
    if (!current) return;
    const solve: Solve = { t: ms, p, s: current.text, d: Date.now(), ...(sp.length ? { sp } : {}) };
    if (special) {
      setLastSpecial(solve);
      const next = special.onDone(solve);
      if (next) start(next); else clear();
      return;
    }
    setLastSpecial(null);
    timer.addSolve(solve);
    setScramble(scrambler.take());
  }, [current, special, start, clear, timer, scrambler]);

  const last = lastSpecial ?? timer.solves[timer.solves.length - 1] ?? null;
  const onLastAction = (a: Penalty | 'delete') => {
    const i = timer.solves.length - 1; if (i < 0) return;
    if (a === 'delete') timer.deleteSolve(i); else timer.setPenalty(i, a);
  };
  const copy = async () => { if (current) try { await navigator.clipboard.writeText(current.text); } catch { /* ignorar */ } };

  return (
    <section>
      <SessionBar timer={timer} />
      {special && (
        <div className="tm-banner"><span>{special.banner}</span><button className="btn ghost" onClick={() => { setLastSpecial(null); stop(); }}>Salir</button></div>
      )}
      <div className="tm-scramble">
        <p className="tm-scr-text">{current?.text ?? 'Generando mezcla…'}</p>
        <div className="tm-scr-tools">
          <span className="tm-scr-kind">{current?.label}</span>
          <button className="tool" onClick={copy}>Copiar</button>
          {!special && <button className="tool" onClick={e => { setScramble(scrambler.take()); e.currentTarget.blur(); }}>Siguiente ›</button>}
        </div>
      </div>
      <div className="tm-main">
        {timer.data.input === 'manual'
          ? <ManualEntry last={last} prev={lastSpecial ? null : timer.solves[timer.solves.length - 2] ?? null} onFinish={onFinish} onLastAction={lastSpecial ? undefined : onLastAction} />
          : <TimerStage enabled inspection={special?.insp ?? timer.data.insp} voice={timer.data.voice} phases={special ? special.phases ?? 1 : timer.data.phases}
            last={last} prev={lastSpecial ? null : timer.solves[timer.solves.length - 2] ?? null} onFinish={onFinish} onLastAction={lastSpecial ? undefined : onLastAction} />}
        <div className="tm-net-wrap">
          {current && <CubeNet alg={current.net} />}
          <p className="muted tm-net-cap">{special?.net ? 'Amarillo arriba, verde delante' : 'Blanco arriba, verde delante'}</p>
        </div>
      </div>
      <div className="tm-cols">
        <StatsPanel solves={timer.solves} roll={timer.roll} phases={timer.data.phases} />
        <SolveList solves={timer.solves} roll={timer.roll} onPenalty={timer.setPenalty} onDelete={timer.deleteSolve} />
      </div>
      <EvolutionChart solves={timer.solves} roll={timer.roll} />
    </section>
  );
}
