'use client';
import Link from 'next/link';
import { ALGORITHMS, SETS, SET_INFO, findCase } from '@/data/algorithms';
import { Breadcrumbs, CubeImage, PageHeader, ProgressBar } from '@/components/ui';
import { caseImageUrl } from '@/lib/visualcube';
import { useProgress } from '@/state/progress';

const SAMPLE = { f2l: findCase('f2l', 1)!, oll: findCase('oll', 27)!, pll: findCase('pll', 'T')! };

/** Segundo paso de Algoritmos: elegir el conjunto del 3x3 */
export function SetPicker() {
  const { counts } = useProgress();
  return (
    <>
      <Breadcrumbs items={[['Algoritmos', '/algoritmos'], ['3x3']]} />
      <PageHeader title="Algoritmos 3x3">
        El método CFOP tiene tres grupos de algoritmos. Si estás empezando, mira primero las <Link href="/lecciones">lecciones</Link>.
      </PageHeader>
      <div className="set-grid">
        {SETS.map(s => {
          const c = counts(s, ALGORITHMS[s]);
          return (
            <Link key={s} className="set-card" href={`/algoritmos/3x3/${s}`}>
              <CubeImage src={caseImageUrl(SAMPLE[s], s, { size: 160 })} size={110} />
              <span className="pick-body">
                <b>{SET_INFO[s].name} <small>· {SET_INFO[s].title}</small></b>
                <span className="set-desc">{SET_INFO[s].description}</span>
                <ProgressBar known={c.known} learning={c.learning} total={c.total} />
                <small>{c.known} de {c.total} dominados · {c.learning} en práctica</small>
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
