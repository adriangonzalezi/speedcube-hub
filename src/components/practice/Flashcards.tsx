'use client';
// Tarjetas con repaso espaciado: ves un caso, piensas el algoritmo, lo destapas y te puntúas.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ALGORITHMS, allCases, type CaseSet, type CaseWithSet } from '@/data/algorithms';
import { CaseDiagram } from '@/components/cube/CubeDiagram';
import { AlgText, ProgressBar, Segmented } from '@/components/ui';
import { pick, randomAuf } from '@/lib/random';
import { useToast } from '@/state/AppProviders';
import { SRS_BOXES, useProgress, type TrainPool } from '@/state/progress';

export function Flashcards() {
  const p = useProgress();
  const toast = useToast();
  const { trainSet, trainPool } = p.prefs;
  const [current, setCurrent] = useState<CaseWithSet | null>(null);
  const [auf, setAuf] = useState<ReturnType<typeof randomAuf>>('');
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ seen: 0, good: 0, again: 0 });

  const inSet = useCallback((c: CaseWithSet) => trainSet === 'all' || c.set === trainSet, [trainSet]);
  const due = useMemo(() => allCases().filter(c => inSet(c) && p.isDue(c)), [inSet, p]);
  const pool = useMemo(() => trainPool === 'due' ? due : allCases().filter(c => inSet(c) &&
    (trainPool === 'all' || (trainPool === 'learning' ? p.statusOf(c) === 'learning' : p.statusOf(c) !== 'known'))), [trainPool, due, inSet, p]);

  const next = useCallback(() => {
    if (!pool.length) { setCurrent(null); return; }
    const candidates = pool.length > 1 && current ? pool.filter(c => c.id !== current.id) : pool;
    setCurrent(pick(candidates)); setAuf(randomAuf()); setRevealed(false);
  }, [pool, current]);
  // nuevo caso al cambiar de conjunto o de grupo
  useEffect(() => { next(); }, [trainSet, trainPool]); // eslint-disable-line react-hooks/exhaustive-deps

  const grade = useCallback((good: boolean) => {
    if (!current) return;
    setSession(s => ({ seen: s.seen + 1, good: s.good + (good ? 1 : 0), again: s.again + (good ? 0 : 1) }));
    if (p.srsGrade(current, good)) toast(`${current.id}: ¡Dominado!`);
    next();
  }, [current, p, toast, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement)?.tagName)) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (revealed) grade(true); else setRevealed(true); }
      if (revealed && e.key === '1') grade(false);
      if (revealed && e.key === '2') grade(true);
    };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [revealed, grade]);

  const set: CaseSet = trainSet === 'all' ? 'oll' : trainSet;
  const counts = p.counts(set, ALGORITHMS[set]);
  const alt = current ? p.algsOf(current).find(a => a !== p.myAlg(current)) : undefined;
  const box = current ? p.srsBox(current.id) : 0;

  return (
    <>
      <div className="progress-row">
        <ProgressBar known={counts.known} learning={counts.learning} total={counts.total} />
        <p className="progress-text"><b>{counts.known}</b> de {counts.total} {set.toUpperCase()} dominados</p>
      </div>
      <div className="train-setup">
        <div className="field"><span className="label">Conjunto</span>
          <Segmented value={trainSet} onChange={v => p.setPrefs({ trainSet: v })} options={[['f2l', 'F2L'], ['oll', 'OLL'], ['pll', 'PLL'], ['all', 'Todos']]} /></div>
        <div className="field"><span className="label">Casos</span>
          <Segmented<TrainPool> value={trainPool} onChange={v => p.setPrefs({ trainPool: v })}
            options={[['due', <>Toca repasar <small>({due.length})</small></>], ['learning', 'En práctica'], ['notknown', 'No dominados'], ['all', 'Todos']]} /></div>
        <p className="train-stats">{session.seen ? `Esta sesión: ${session.seen} casos · ${session.good} sabidos · ${session.again} a repasar` : ''}</p>
      </div>

      {current ? (
        <div className="train-card">
          <div className="train-img"><CaseDiagram c={current} set={current.set} auf={auf} iso={current.set === 'pll'} size={260} /></div>
          <div className="train-body">
            <p className="train-q">¿Qué {current.set.toUpperCase()} es?</p>
            {revealed && (
              <div id="train-answer">
                <h2>{current.id}{current.nick ? ` · ${current.nick}` : ''}</h2>
                <p className="alg big"><AlgText alg={p.myAlg(current)} /></p>
                {alt && <p className="muted" id="train-alt">Alternativa: <AlgText alg={alt} /></p>}
                <p className="srs-note">{box ? `Caja ${box} de ${SRS_BOXES.length - 1} del repaso espaciado.` : 'Caso nuevo en el repaso.'}</p>
              </div>
            )}
            <div className="train-buttons">
              {!revealed ? <button className="btn primary" onClick={() => setRevealed(true)}>Mostrar solución <kbd>Espacio</kbd></button> : <>
                <button className="btn" onClick={() => grade(false)}>Repasar <kbd>1</kbd></button>
                <button className="btn ok" onClick={() => grade(true)}>Me lo sé <kbd>2</kbd></button>
              </>}
            </div>
            <p className="hint">Repaso espaciado: cada caso que te sabes vuelve más tarde (1, 3, 7, 14… días) y los que fallas vuelven hoy. «Toca repasar» te enseña solo los que tocan. El caso sale con un giro de U aleatorio, como en una resolución real.</p>
          </div>
        </div>
      ) : <p className="empty">No hay casos en este grupo. Marca algunos como <b>En práctica</b> desde Algoritmos o elige «Todos».</p>}
    </>
  );
}
