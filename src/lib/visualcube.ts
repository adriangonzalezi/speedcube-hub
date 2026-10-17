// URLs de imágenes de VisualCube y de animaciones en alg.cubing.net.
import type { AlgCase, CaseSet } from '@/data/algorithms';
import { invert } from './cube/notation';
import { type CubeState, toFd } from './cube/state';

const VC = 'https://visualcube.api.cubing.net/visualcube.php';
const url = (params: Record<string, string | number>) =>
  `${VC}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString().replace(/\+/g, '%20')}`;

export interface CaseImageOptions {
  size?: number;
  /** Giro de U previo, para mostrar el caso desde otro ángulo */
  auf?: '' | 'U' | 'U2' | "U'";
  /** PLL en 3D sin flechas (para entrenar el reconocimiento) */
  iso?: boolean;
  format?: 'svg' | 'png';
}

export function caseImageUrl(c: AlgCase, set: CaseSet, o: CaseImageOptions = {}) {
  const base = { fmt: o.format ?? 'svg', size: o.size ?? 200, pzl: 3, bg: 't' };
  if (set === 'f2l') return url({ ...base, fd: c.fdAuf?.[['', 'U', 'U2', "U'"].indexOf(o.auf ?? '')] ?? c.fd ?? '' });
  const caseAlg = c.algs[0] + (o.auf ? ` ${o.auf}` : '');
  if (set === 'oll') return url({ ...base, view: 'plan', stage: 'oll', case: caseAlg });
  if (o.iso) return url({ ...base, stage: 'll', case: caseAlg });
  return url({ ...base, view: 'plan', ...(c.arw ? { arw: c.arw, ac: 'black' } : {}), case: caseAlg });
}

/** Estado completo con colores WCA (blanco arriba, verde delante). back = vista trasera. */
export const stateImageUrl = (s: CubeState, back = false, size = 200) =>
  url({ fmt: 'svg', size, pzl: 3, bg: 't', sch: 'wrgyob', fd: toFd(s), ...(back ? { r: 'y225x-34' } : {}) });

/** Cubo resuelto (o tras unos movimientos) de cualquier tamaño */
export const puzzleImageUrl = (pzl: number, alg = '', size = 160) =>
  url({ fmt: 'svg', size, pzl, bg: 't', sch: 'wrgyob', ...(alg ? { alg } : {}) });

export const animationUrl = (alg: string, setup?: string) =>
  `https://alg.cubing.net/?${new URLSearchParams({ alg, setup: setup ?? invert(alg), type: 'alg' })}`;
export const reconstructionUrl = (setup: string, alg: string) =>
  `https://alg.cubing.net/?${new URLSearchParams({ setup, alg, title: 'Cubo Algs' })}`;
