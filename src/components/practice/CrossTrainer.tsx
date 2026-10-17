'use client';
// Entrenador de cruz: planifica en 15 s de inspección y compara tu cruz con la óptima.
import { useEffect, useRef, useState } from 'react';
import { CubeImage, CubeNet } from '@/components/ui';
import { apply, crossOk, fromScramble, moveCount, solver, type SolveOption } from '@/lib/cube';
import { randomMoveScramble } from '@/lib/cube/scramble';
import { stateImageUrl } from '@/lib/visualcube';
import { usePracticeStore } from './usePracticeStore';

type Mine = { ok: boolean; moves?: number; error?: string } | null;

export function CrossTrainer() {
  const { store, setStore } = usePracticeStore();
  const [scramble, setScramble] = useState('');
  const [input, setInput] = useState('');
  const [left, setLeft] = useState<number | null>(null);
  const [solutions, setSolutions] = useState<SolveOption[] | null>(null);
  const [mine, setMine] = useState<Mine>(null);
  const raf = useRef(0);

  const next = () => { cancelAnimationFrame(raf.current); setScramble(randomMoveScramble(20)); setInput(''); setLeft(null); setSolutions(null); setMine(null); };
  useEffect(() => { next(); return () => cancelAnimationFrame(raf.current); }, []);

  const inspect = () => {
    cancelAnimationFrame(raf.current); const t0 = performance.now();
    const tick = () => { const l = 15 - (performance.now() - t0) / 1000; setLeft(l); if (l > 0) raf.current = requestAnimationFrame(tick); };
    tick();
  };

  const solve = () => {
    cancelAnimationFrame(raf.current);
    const start = fromScramble(scramble);
    const opts = solver.crossOptions(start).sort((a, b) => a.moves - b.moves);
    const best = opts[0].moves; let matched = false; let result: Mine = null;
    if (input.trim()) {
      try {
        const s2 = apply(start, input);
        const ok = ['', 'x2', 'x', "x'", 'z', "z'"].some(t => { const s3 = apply(s2, t); return s3[31] === 'U' && crossOk(s3); });
        const n = moveCount(input);
        result = { ok, moves: n }; matched = ok && n <= best;
      } catch (e) { result = { ok: false, error: (e as Error).message }; }
    }
    setMine(result); setSolutions(opts);
    setStore(s => ({ ...s, cross: { n: s.cross.n + 1, sumOpt: s.cross.sumOpt + best, matched: s.cross.matched + (matched ? 1 : 0) } }));
  };

  const avg = store.cross.n ? (store.cross.sumOpt / store.cross.n).toFixed(1) : '–';
  const best = solutions?.[0]?.moves;
  return (
    <div className="pm-cross">
      <div className="tm-scramble">
        <p className="tm-scr-text">{scramble}</p>
        <div className="tm-scr-tools"><span className="tm-scr-kind">Blanco arriba, verde delante. La cruz se hace con el blanco abajo.</span><button className="tool" onClick={next}>Otra mezcla ›</button></div>
      </div>
      <div className="pm-cross-grid">
        <div className="tm-net-wrap">{scramble && <CubeNet alg={scramble} />}</div>
        <div className="tm-panel">
          <div className="cx-insp">
            <span className={`cx-clock${left !== null && left <= 3 ? ' late' : ''}`}>{left === null ? 15 : left > 0 ? Math.ceil(left) : '¡Ya!'}</span>
            <button className="btn" onClick={inspect}>Empezar inspección</button>
          </div>
          <label className="label" htmlFor="cx-input">Tu cruz (opcional, con el giro incluido, p. ej. x2 R F&apos; D …)</label>
          <div className="co-input-row">
            <input id="cx-input" className="co-scramble" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') solve(); }} autoComplete="off" spellCheck={false} />
            <button className="btn primary" onClick={solve}>Ver la cruz óptima</button>
          </div>
          <div id="cx-result">
            {mine && (mine.error ? <p className="cx-mine bad">{mine.error}</p>
              : mine.ok ? <p className="cx-mine ok">Tu cruz funciona: <b>{mine.moves} mov.</b> {best !== undefined && mine.moves! <= best ? '¡Igual que la óptima!' : `(la óptima tiene ${best})`}</p>
                : <p className="cx-mine bad">Con esos movimientos no queda la cruz blanca hecha. Revisa la notación o el giro inicial.</p>)}
            {solutions && <>
              <h4 className="tm-ph-title">Cruces óptimas ({best} mov.)</h4>
              {solutions.map(o => <div key={o.alg} className="cx-opt"><CubeImage src={stateImageUrl(o.after, false, 100)} size={72} /><p className="alg">{o.alg}</p></div>)}
            </>}
          </div>
          <p className="muted pm-foot">Cruces practicadas: {store.cross.n} · longitud óptima media: {avg} mov. · veces que igualaste la óptima: {store.cross.matched}</p>
        </div>
      </div>
    </div>
  );
}
