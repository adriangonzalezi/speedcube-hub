import { ALGORITHMS } from '@/data/algorithms';
import { AUF, invert } from '@/lib/cube/notation';
import { apply, SOLVED, f2lOk, type CubeState } from '@/lib/cube/state';
import { mulberry32 } from '@/lib/cube/scramble';

export const rand = mulberry32(12345);
export const pick = <T,>(a: readonly T[]) => a[Math.floor(rand() * a.length)];

/** Última capa aleatoria con el F2L hecho y el amarillo arriba */
export function randomLastLayer(): CubeState {
  for (;;) {
    const s = apply(SOLVED, `x2 ${invert(pick(pick(ALGORITHMS.pll).algs))} ${pick(AUF)} ${invert(pick(pick(ALGORITHMS.oll).algs))} ${pick(AUF)}`);
    if (f2lOk(s)) return s;
  }
}
