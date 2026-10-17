// Figuras para el contenido de las lecciones.
import type { ReactNode } from 'react';
import { findCase, type CaseSet } from '@/data/algorithms';
import { AlgLink, CubeImage } from '@/components/ui';
import { caseImageUrl, puzzleImageUrl } from '@/lib/visualcube';

export const Figs = ({ children }: { children: ReactNode }) => <div className="ls-figs">{children}</div>;

/** Cubo resuelto tras unos movimientos (blanco arriba, verde delante) */
export function MoveFigure({ alg, caption = alg }: { alg: string; caption?: string }) {
  return <figure className="ls-move"><CubeImage src={puzzleImageUrl(3, alg, 110)} size={88} /><figcaption><code>{caption}</code></figcaption></figure>;
}

export function CaseFigure({ set, num }: { set: CaseSet; num: number | string }) {
  const c = findCase(set, num)!;
  return <figure className="ls-move"><CubeImage src={caseImageUrl(c, set, { size: 120 })} alt={c.id} size={88} /><figcaption>{c.id}{c.nick && <><br /><small>{c.nick}</small></>}</figcaption></figure>;
}

/** Algoritmo principal de un caso, con enlace a la animación */
export const CaseAlg = ({ set, num }: { set: CaseSet; num: number | string }) => <AlgLink alg={findCase(set, num)!.algs[0]} />;

/** Cara de arriba con las aristas amarillas que ya están orientadas: [detrás, izquierda, derecha, delante] */
export function EdgePattern({ title, edges: [b, l, r, f] }: { title: string; edges: [number, number, number, number] }) {
  const cell = (x: number, y: number, on?: number) => <rect key={`${x}${y}`} x={x * 20 + 1} y={y * 20 + 1} width="18" height="18" rx="3" fill={on ? '#ffd500' : '#5a5f57'} />;
  return (
    <figure className="ls-move">
      <svg viewBox="0 0 60 60" width="72" height="72" role="img" aria-label={title}>
        {cell(0, 0)}{cell(1, 0, b)}{cell(2, 0)}{cell(0, 1, l)}{cell(1, 1, 1)}{cell(2, 1, r)}{cell(0, 2)}{cell(1, 2, f)}{cell(2, 2)}
      </svg>
      <figcaption>{title}</figcaption>
    </figure>
  );
}
