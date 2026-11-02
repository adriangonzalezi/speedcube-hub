'use client';
// Reconocimiento contrarreloj: ves un caso y eliges cuál es entre cuatro.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ALGORITHMS, type AlgCase } from '@/data/algorithms';
import { CaseDiagram } from '@/components/cube/CubeDiagram';
import { AlgText, Segmented } from '@/components/ui';
import { pick, randomAuf, shuffle } from '@/lib/random';
import { useProgress } from '@/state/progress';
import { SET_OPTIONS, usePracticeStore } from './usePracticeStore';

const fmtS = (ms: number) => `${(ms / 1000).toFixed(2)} s`;

export function Recognition() {
  const { store, setStore, setOpt } = usePracticeStore();
  const { myAlg } = useProgress();
  const set = store.opt.recogSet;
  const [round, setRound] = useState<{ c: AlgCase; choices: AlgCase[]; auf: ReturnType<typeof randomAuf> } | null>(null);
  const [answer, setAnswer] = useState<{ id: string; ms: number } | null>(null);
  const [session, setSession] = useState({ seen: 0, ok: 0, streak: 0 });
  const t0 = useRef(0);

  const next = useCallback(() => {
    const list = ALGORITHMS[set];
    const c = pick(list.filter(x => x.id !== round?.c.id));
    const others = [...shuffle(list.filter(x => x.group === c.group && x.id !== c.id)), ...shuffle(list.filter(x => x.group !== c.group))];
    setRound({ c, choices: shuffle([c, ...others.slice(0, 3)]), auf: randomAuf() });
    setAnswer(null); t0.current = performance.now();
  }, [set, round]);
  useEffect(() => { next(); }, [set]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = useCallback((id: string) => {
    if (!round || answer) return;
    const ms = performance.now() - t0.current; const ok = id === round.c.id;
    setAnswer({ id, ms });
    setSession(s => ({ seen: s.seen + 1, ok: s.ok + (ok ? 1 : 0), streak: ok ? s.streak + 1 : 0 }));
    setStore(s => {
      const r = s.recog[round.c.id] ?? { n: 0, ok: 0, ms: 0 };
      return { ...s, recog: { ...s.recog, [round.c.id]: { n: r.n + 1, ok: r.ok + (ok ? 1 : 0), ms: ok ? (r.ms ? r.ms * 0.7 + ms * 0.3 : ms) : r.ms } } };
    });
  }, [round, answer, setStore]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!round) return;
      if (/^[1-4]$/.test(e.key) && !answer) choose(round.choices[+e.key - 1].id);
      else if ((e.code === 'Space' || e.key === 'Enter') && answer) { e.preventDefault(); next(); }
    };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [round, answer, choose, next]);

  const hard = ALGORITHMS[set].map(c => ({ c, r: store.recog[c.id] })).filter(x => x.r)
    .sort((a, b) => a.r.ok / a.r.n - b.r.ok / b.r.n || b.r.ms - a.r.ms).slice(0, 8);

  return (
    <>
      <div className="train-setup">
        <div className="field"><span className="label">Conjunto</span><Segmented value={set} options={SET_OPTIONS} onChange={v => setOpt({ recogSet: v })} /></div>
        <p className="train-stats">{session.seen ? `Esta sesión: ${session.ok}/${session.seen} aciertos · racha ${session.streak}` : ''}</p>
      </div>
      {round && (
        <div className="train-card">
          <div className="train-img"><CaseDiagram c={round.c} set={set} auf={round.auf} iso={set === 'pll'} size={260} /></div>
          <div className="train-body">
            <p className="train-q">¿Qué caso es? {answer && <span className="rc-clock">{fmtS(answer.ms)}</span>}</p>
            <div className="rc-choices">
              {round.choices.map((x, i) => (
                <button key={x.id} className={`btn rc-choice${answer ? (x.id === round.c.id ? ' right' : x.id === answer.id ? ' wrong' : '') : ''}`} disabled={!!answer} onClick={() => choose(x.id)}>
                  <kbd>{i + 1}</kbd> {x.id}{x.nick && <small> {x.nick}</small>}
                </button>
              ))}
            </div>
            <p className="rc-feedback">{answer && (answer.id === round.c.id ? `¡Bien! ${fmtS(answer.ms)}`
              : <>Era <b>{round.c.id}{round.c.nick ? ` · ${round.c.nick}` : ''}</b>. Algoritmo: <span className="alg"><AlgText alg={myAlg(round.c)} /></span></>)}</p>
            {answer && <div className="train-buttons"><button className="btn primary" onClick={next}>Siguiente <kbd>Espacio</kbd></button></div>}
            <p className="hint">Responde con el ratón o con las teclas 1–4. El tiempo empieza cuando aparece el caso: así mides tu velocidad de reconocimiento, que es lo que más se nota en OLL y PLL.</p>
          </div>
        </div>
      )}
      <div className="tm-panel pm-table">
        <h3 className="tm-h">Los que más te cuestan</h3>
        {hard.length ? (
          <table className="tm-stats"><tbody>
            <tr><th>Caso</th><th>Aciertos</th><th>Tiempo medio</th></tr>
            {hard.map(({ c, r }) => <tr key={c.id}><th>{c.id}</th><td>{r.ok}/{r.n}</td><td>{r.ms ? fmtS(r.ms) : '–'}</td></tr>)}
          </tbody></table>
        ) : <p className="muted">Aún no hay datos: responde unos cuantos casos.</p>}
      </div>
    </>
  );
}
