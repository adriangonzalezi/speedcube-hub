'use client';
// Casos cronometrados: el cronómetro te va dando la mezcla de un caso y mides cuánto tardas en ejecutarlo.
import { useRouter } from 'next/navigation';
import { ALGORITHMS, type AlgCase, type CaseSet } from '@/data/algorithms';
import { AlgText, Segmented } from '@/components/ui';
import { invert, isFaceOnly, simplify } from '@/lib/cube';
import { pick, randomAuf } from '@/lib/random';
import { writeStore } from '@/lib/storage';
import { KEYS } from '@/lib/storage';
import { useTimerSpecial, type SpecialMode } from '@/state/AppProviders';
import { useProgress } from '@/state/progress';
import { PRACTICE_INITIAL, SET_OPTIONS, usePracticeStore, type PracticeStore } from './usePracticeStore';

const fmtS = (ms: number) => `${(ms / 1000).toFixed(2)} s`;

export function TimedCases() {
  const { store, setOpt } = usePracticeStore();
  const progress = useProgress();
  const { start } = useTimerSpecial();
  const router = useRouter();
  const set = store.opt.casesSet;

  const pool = (): AlgCase[] => {
    const p = store.opt.casesPool;
    const list = ALGORITHMS[set].filter(c => p === 'all' || (p === 'learning' ? progress.statusOf(c) === 'learning' : progress.statusOf(c) !== 'known'));
    return list.length ? list : ALGORITHMS[set];
  };
  const config = (): SpecialMode => {
    const c = pick(pool()); const alg = c.algs.find(isFaceOnly) ?? c.algs[0];
    const setup = simplify(`${randomAuf()} ${invert(alg)} ${randomAuf()}`);
    return {
      scramble: setup, net: `z2 ${setup}`, phases: 1, insp: false,
      label: `Prepara ${c.id} con el amarillo arriba`,
      banner: <><b>Casos cronometrados · {c.id}{c.nick ? ` · ${c.nick}` : ''}</b> <span className="muted">Tu algoritmo: <span className="alg"><AlgText alg={progress.myAlg(c)} /></span></span></>,
      onDone: solve => {
        if (solve.p !== 'DNF') writeStore<PracticeStore>(KEYS.practice, PRACTICE_INITIAL, s => ({ ...s, cases: { ...s.cases, [c.id]: [...(s.cases[c.id] ?? []), solve.t].slice(-5) } }));
        return config();
      },
      onExit: () => router.push('/practica/casos'),
    };
  };

  const rows = ALGORITHMS[set].map(c => ({ c, t: store.cases[c.id] ?? [] })).filter(x => x.t.length)
    .map(x => ({ ...x, avg: x.t.reduce((a, b) => a + b, 0) / x.t.length })).sort((a, b) => b.avg - a.avg);

  return (
    <>
      <div className="train-setup">
        <div className="field"><span className="label">Conjunto</span><Segmented<CaseSet> value={set} options={SET_OPTIONS} onChange={v => setOpt({ casesSet: v })} /></div>
        <div className="field"><span className="label">Casos</span>
          <Segmented value={store.opt.casesPool} options={[['learning', 'En práctica'], ['notknown', 'No dominados'], ['all', 'Todos']]} onChange={v => setOpt({ casesPool: v })} /></div>
        <button className="btn primary" onClick={() => { start(config()); router.push('/cronometro'); }}>Empezar en el cronómetro</button>
      </div>
      <p className="co-explain">El cronómetro te dará la mezcla que prepara cada caso (con el <b>amarillo arriba</b> y el verde delante). Hazla, resuelve el caso con tu algoritmo y para el tiempo: así sabes qué algoritmos ejecutas más lento. Cuando acabes uno, sale el siguiente.</p>
      <div className="tm-panel pm-table">
        <h3 className="tm-h">Tus tiempos por caso <small>(media de los últimos 5, de más lento a más rápido)</small></h3>
        {rows.length ? (
          <table className="tm-stats"><tbody>
            <tr><th>Caso</th><th>Media</th><th>Mejor</th><th>Veces</th></tr>
            {rows.map(r => <tr key={r.c.id}><th>{r.c.id}{r.c.nick && <small className="muted"> {r.c.nick}</small>}</th><td>{fmtS(r.avg)}</td><td>{fmtS(Math.min(...r.t))}</td><td>{r.t.length}</td></tr>)}
          </tbody></table>
        ) : <p className="muted">Aún no has cronometrado ningún caso de este conjunto.</p>}
      </div>
    </>
  );
}
