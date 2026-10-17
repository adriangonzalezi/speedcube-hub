'use client';
// Resolución guiada: introduces una mezcla y te propone cómo resolverla paso a paso con CFOP.
import { useEffect, useState } from 'react';
import { randomMoveScramble } from '@/lib/cube/scramble';
import { reconstructionUrl } from '@/lib/visualcube';
import { useScrambler, useToast } from '@/state/AppProviders';
import { CubeViews, OptionCard } from './OptionCard';
import { savedScramble, stepLabel, useGuidedSolve } from './useGuidedSolve';

const EXPLAIN = {
  cross: ['Cruz', 'Gira el cubo para tener el blanco abajo (x2) y haz la cruz. Estas son las cruces más cortas posibles.'],
  lastPair: ['Última pareja', 'Fíjate en qué OLL te deja cada opción: la recomendada es la que menos movimientos suma hasta terminar el cubo.'],
  pair: ['', 'Opciones para resolver una pareja más, de menos a más movimientos. «y» significa girar el cubo entero antes del algoritmo.'],
  oll: ['OLL', 'Cada algoritmo (y cada giro previo de U) te deja una PLL distinta. La recomendada es la que menos suma con su PLL.'],
  pll: ['PLL', 'Último paso: permuta la capa de arriba.'],
  done: ['¡Cubo resuelto!', 'Mira tu solución completa abajo, cópiala o ábrela animada para repasarla.'],
};

export function GuidedSolve({ initialScramble }: { initialScramble?: string }) {
  const g = useGuidedSolve();
  const toast = useToast();
  const scrambler = useScrambler();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // ?mezcla=… (desde el reto diario) o, si no hay nada, una mezcla aleatoria
    const saved = savedScramble();
    if (initialScramble && initialScramble !== saved) g.load(initialScramble);
    else if (!saved && !initialScramble) g.load(randomMoveScramble());
  }, [initialScramble]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setInput(g.scramble), [g.scramble]);

  const load = (text: string) => { const err = g.load(text); setError(err); setShowAll(false); };
  const [title, explain] = !g.stage ? ['', ''] : g.stage === 'f2l'
    ? (g.pairsDone === 3 ? EXPLAIN.lastPair : [`Pareja ${g.pairsDone + 1} de 4`, EXPLAIN.pair[1]]) : EXPLAIN[g.stage];
  const visible = showAll ? g.options : g.options.slice(0, 6);
  const solutionText = g.chosen.map((c, i) => `${c.alg} // ${stepLabel(g.chosen, i)}`).join('\n');

  return (
    <section>
      <form className="co-input" onSubmit={e => { e.preventDefault(); load(input); }}>
        <label className="label" htmlFor="co-scramble">Mezcla (blanco arriba, verde delante)</label>
        <div className="co-input-row">
          <input id="co-scramble" className="co-scramble" value={input} onChange={e => setInput(e.target.value)} autoComplete="off" spellCheck={false} placeholder="Pega una mezcla, p. ej. R U2 F' L D2 …" />
          <button className="btn primary" type="submit">Analizar</button>
        </div>
        <div className="co-input-row co-input-tools">
          <button className="btn ghost" type="button" onClick={() => load(randomMoveScramble())}>Mezcla aleatoria</button>
          <button className="btn ghost" type="button" onClick={() => load(scrambler.take().text)}>Mezcla oficial</button>
          {error && <p className="co-error">{error}</p>}
        </div>
      </form>

      <ol className="co-steps" aria-label="Pasos de la resolución">
        {g.chosen.map((c, i) => <li key={i}><button className="co-step done" title="Volver a este paso" onClick={() => g.backTo(i)}>{stepLabel(g.chosen, i)} <small>{c.moves}</small></button></li>)}
        {g.stage && <li><span className={`co-step ${g.stage === 'done' ? 'ok' : 'now'}`}>{g.stage === 'done' ? 'Resuelto' : g.stage === 'f2l' ? `Pareja ${g.pairsDone + 1}` : title}</span></li>}
      </ol>

      {g.current && (
        <div className="co-grid">
          <CubeViews state={g.current} />
          <div className="co-panel">
            <h2 className="co-title">{title}</h2>
            <p className="co-explain">{explain}</p>
            <div className="co-options">
              {visible.map((o, i) => <OptionCard key={o.alg + i} option={o} recommended={i === 0} onPick={() => { g.pick(o); setShowAll(false); }} />)}
            </div>
            {!showAll && g.options.length > 6 && <button className="btn ghost" id="co-more" onClick={() => setShowAll(true)}>Ver más opciones</button>}
          </div>
        </div>
      )}

      <div className="co-solution">
        <div className="co-sol-head">
          <h3 className="tm-h">Tu solución {g.chosen.length > 0 && <small>· {g.totalMoves} movimientos</small>}</h3>
          <div className="co-sol-tools">
            <button className="btn" disabled={g.stage === 'done'} onClick={g.autoComplete}>Completar con lo recomendado</button>
            <button className="btn ghost" onClick={async () => { try { await navigator.clipboard.writeText(`Mezcla: ${g.scramble}\n${solutionText}`); toast('Solución copiada'); } catch { /* ignorar */ } }}>Copiar</button>
            <a className="btn ghost" href={reconstructionUrl(g.scramble, solutionText)} target="_blank" rel="noopener noreferrer">Ver animación</a>
          </div>
        </div>
        <div className="co-sol-wrap">
          <table className="co-sol"><tbody>
            <tr><th>#</th><th>Paso</th><th>Movimientos</th><th className="num">Mov.</th></tr>
            {g.chosen.length ? g.chosen.map((c, i) => (
              <tr key={i}><td className="n">{i + 1}</td><td>{stepLabel(g.chosen, i)}</td><td className="mono">{c.alg || '–'}</td><td className="num">{c.moves}</td></tr>
            )) : <tr><td colSpan={4} className="muted">Elige una opción para empezar.</td></tr>}
          </tbody></table>
        </div>
      </div>
    </section>
  );
}
