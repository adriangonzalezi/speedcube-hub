// Mezclas: por movimientos aleatorios (respaldo) y generador con semilla (reto diario).

/** Generador pseudoaleatorio con semilla (mulberry32): misma semilla → misma secuencia */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AXIS: Record<string, number> = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };

/** Mezcla de n movimientos sin repetir cara ni hacer tres giros del mismo eje */
export function randomMoveScramble(length = 21, rand: () => number = Math.random): string {
  const faces = 'URFDLB'; const out: string[] = [];
  let last = '', prev = '';
  while (out.length < length) {
    const f = faces[Math.floor(rand() * 6)];
    if (f === last || (AXIS[f] === AXIS[last] && f === prev)) continue;
    out.push(f + ['', "'", '2'][Math.floor(rand() * 3)]);
    prev = last; last = f;
  }
  return out.join(' ');
}

export type ScrambleKind = 'wca' | 'moves';
export interface Scramble { text: string; kind: ScrambleKind }

export const scrambleKindLabel = (k: ScrambleKind) => (k === 'wca' ? 'Mezcla oficial (estado aleatorio)' : 'Mezcla por movimientos aleatorios');

/** Semilla del reto diario a partir de la fecha AAAA-MM-DD */
export const seedFromDate = (dateKey: string) => +dateKey.replace(/-/g, '');
