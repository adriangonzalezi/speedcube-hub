// Algoritmos del 3x3 (F2L, OLL, PLL), verificados con el simulador de cubo.
// algorithms.json se generó con los scripts de validación del proyecto original (rubik-algoritmos/scripts).
// tests/cube.test.ts vuelve a comprobar que cada algoritmo hace lo que dice.
import raw from './algorithms.json';

export type CaseSet = 'f2l' | 'oll' | 'pll';
export const SETS: CaseSet[] = ['f2l', 'oll', 'pll'];

export interface AlgCase {
  id: string;
  num: number | string;
  group: string;
  nick: string;
  prob: string;
  algs: string[];
  /** PLL: flechas para VisualCube */
  arw?: string;
  /** F2L: estado del cubo para VisualCube (pegatinas), y con cada giro de U previo */
  fd?: string;
  fdAuf?: string[];
}

export type AlgData = Record<CaseSet, AlgCase[]>;
export const ALGORITHMS = raw as AlgData;

export interface CaseWithSet extends AlgCase { set: CaseSet }
export const allCases = (): CaseWithSet[] => SETS.flatMap(set => ALGORITHMS[set].map(c => ({ ...c, set })));

export function groupsOf(set: CaseSet): string[] {
  const out: string[] = [];
  for (const c of ALGORITHMS[set]) if (!out.includes(c.group)) out.push(c.group);
  return out;
}

export const findCase = (set: CaseSet, num: number | string) => ALGORITHMS[set].find(c => String(c.num) === String(num));

export const SET_INFO: Record<CaseSet, { name: string; title: string; description: string }> = {
  f2l: { name: 'F2L', title: 'Primeras dos capas', description: 'Los 41 casos para meter cada pareja esquina-arista en su hueco.' },
  oll: { name: 'OLL', title: 'Orientar la última capa', description: 'Los 57 casos para dejar la cara de arriba de un solo color.' },
  pll: { name: 'PLL', title: 'Permutar la última capa', description: 'Los 21 casos para colocar las piezas de arriba y terminar el cubo.' },
};

export const isCaseSet = (s: string): s is CaseSet => (SETS as string[]).includes(s);
