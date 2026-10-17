'use client';
// Última pareja: elige cómo meterla pensando en qué OLL te deja; luego se ve cuál era la mejor.
import { useEffect, useState } from 'react';
import { ALGORITHMS, type AlgCase } from '@/data/algorithms';
import { CubeViews, OptionCard } from '@/components/guide/OptionCard';
import { apply, crossOk, invert, isFaceOnly, SOLVED, solvedSlots, solver, totalMoves, type CubeState, type SolveOption } from '@/lib/cube';
import { pick, randomAuf, shuffle } from '@/lib/random';
import { useToast } from '@/state/AppProviders';
import { usePracticeStore } from './usePracticeStore';

const faceAlg = (c: AlgCase) => c.algs.find(isFaceOnly);

/** Cubo con la cruz y 3 parejas hechas, la última pareja fuera y una última capa aleatoria */
function generate(): { state: CubeState; options: SolveOption[] } {
  for (let tries = 0; tries < 50; tries++) {
    const o = faceAlg(pick(ALGORITHMS.oll.filter(faceAlg)))!, p = faceAlg(pick(ALGORITHMS.pll.filter(faceAlg)))!, f = faceAlg(pick(ALGORITHMS.f2l.filter(faceAlg)))!;
    const s = apply(SOLVED, `x2 ${invert(p)} ${randomAuf()} ${invert(o)} ${randomAuf()} ${invert(f)} ${randomAuf()} ${pick(['', 'y', 'y2', "y'"])}`);
    if (!crossOk(s) || solvedSlots(s).filter(Boolean).length !== 3) continue;
    const options = solver.options(s).filter(x => x.kind === 'f2l');
    if (options.length >= 2) return { state: s, options: shuffle(options.slice(0, 4)) };
  }
  throw new Error('No se pudo generar una situación');
}

export function LastSlotTrainer() {
  const { store, setStore } = usePracticeStore();
  const toast = useToast();
  const [round, setRound] = useState<ReturnType<typeof generate> | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  useEffect(() => setRound(generate()), []);
  if (!round) return null;

  const best = Math.min(...round.options.map(totalMoves));
  const choose = (i: number) => {
    if (chosen !== null) return;
    const ok = totalMoves(round.options[i]) === best;
    setChosen(i); setStore(s => ({ ...s, ls: { n: s.ls.n + 1, ok: s.ls.ok + (ok ? 1 : 0) } }));
    toast(ok ? '¡Elegiste la mejor opción!' : 'Había una opción más corta');
  };

  return (
    <div className="co-grid">
      <CubeViews state={round.state} />
      <div className="co-panel">
        <h2 className="co-title">¿Cómo meterías la última pareja?</h2>
        <p className="co-explain">Todas las opciones resuelven el F2L, pero cada una deja una OLL distinta. Elige la que creas que da la resolución más corta en total y luego mira qué deja cada una.</p>
        <div className="co-options">
          {round.options.map((o, i) => (
            <OptionCard key={o.alg} option={o} title={`Opción ${i + 1}`} hidden={chosen === null} chosen={chosen === i}
              recommended={chosen !== null && totalMoves(o) === best} badge="La mejor"
              actionLabel="Elegir" onPick={chosen === null ? () => choose(i) : undefined} />
          ))}
        </div>
        {chosen !== null && <div className="train-buttons"><button className="btn primary" onClick={() => { setRound(generate()); setChosen(null); }}>Otra situación</button></div>}
        <p className="muted pm-foot">{store.ls.n ? `Has acertado la mejor opción ${store.ls.ok} de ${store.ls.n} veces.` : ''}</p>
      </div>
    </div>
  );
}
