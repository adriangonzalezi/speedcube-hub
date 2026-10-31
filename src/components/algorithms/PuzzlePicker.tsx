'use client';
import Link from 'next/link';
import { ALGORITHMS, SETS } from '@/data/algorithms';
import { PuzzleDiagram } from '@/components/cube/CubeDiagram';
import { PageHeader } from '@/components/ui';
import { useProgress } from '@/state/progress';

const COMING_SOON: [string, number?][] = [['2x2', 2], ['4x4', 4], ['5x5', 5], ['Pyraminx'], ['Skewb'], ['Megaminx']];

/** Primer paso de Algoritmos: elegir el cubo */
export function PuzzlePicker() {
  const { counts } = useProgress();
  const all = SETS.map(s => counts(s, ALGORITHMS[s]));
  const total = all.reduce((n, c) => n + c.total, 0), known = all.reduce((n, c) => n + c.known, 0);
  return (
    <>
      <PageHeader title="Algoritmos">Elige tu cubo.</PageHeader>
      <div className="pick-grid">
        <Link className="pick-card" href="/algoritmos/3x3">
          <PuzzleDiagram n={3} />
          <span className="pick-body"><b>3x3</b><small>{total} algoritmos · F2L, OLL y PLL</small>
            <span className="progress" aria-hidden="true"><span className="p-known" style={{ width: `${(known / total) * 100}%` }} /></span>
            <small>{known} dominados</small></span>
        </Link>
        {COMING_SOON.map(([name, pzl]) => (
          <div key={name} className="pick-card soon" aria-disabled="true">
            {pzl ? <PuzzleDiagram n={pzl} /> : <span className="pick-ph" aria-hidden="true" />}
            <span className="pick-body"><b>{name}</b><small>Próximamente</small></span>
          </div>
        ))}
      </div>
    </>
  );
}
