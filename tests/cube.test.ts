import { describe, expect, it } from 'vitest';
import Cube from 'cubejs';
import { ALGORITHMS, SETS } from '@/data/algorithms';
import { invert, moveCount, simplify } from '@/lib/cube/notation';
import { apply, SOLVED, isSolved, f2lOk, ollOk } from '@/lib/cube/state';
import { randomMoveScramble } from '@/lib/cube/scramble';
import { rand } from './helpers';

describe('notación', () => {
  it('invierte y simplifica', () => {
    expect(invert("R U R' U'")).toBe("U R U' R'");
    expect(simplify("U U2 R R'")).toBe("U'");
    expect(moveCount("y R U R' x")).toBe(3);
  });
});

describe('simulador', () => {
  it('coincide con cubejs en 200 mezclas aleatorias', () => {
    for (let i = 0; i < 200; i++) {
      const scr = randomMoveScramble(25, rand);
      expect(apply(SOLVED, scr).join('')).toBe(new Cube().move(scr).asString());
    }
  });
  it('R U R\' U\' seis veces vuelve al estado resuelto', () => {
    let s = SOLVED; for (let i = 0; i < 6; i++) s = apply(s, "R U R' U'");
    expect(isSolved(s)).toBe(true);
  });
});

describe('algoritmos', () => {
  it('hay 41 F2L, 57 OLL y 21 PLL', () => {
    expect(SETS.map(s => ALGORITHMS[s].length)).toEqual([41, 57, 21]);
  });
  it('cada OLL deja la última capa orientada sin romper el F2L', () => {
    for (const c of ALGORITHMS.oll) for (const alg of c.algs) {
      const s = apply(apply(SOLVED, 'x2'), invert(alg));
      expect(f2lOk(s), `${c.id}: ${alg}`).toBe(true);
      expect(ollOk(apply(s, alg))).toBe(true);
    }
  });
  it('cada PLL mantiene la orientación', () => {
    for (const c of ALGORITHMS.pll) for (const alg of c.algs) expect(ollOk(apply(apply(SOLVED, 'x2'), invert(alg))), `${c.id}`).toBe(true);
  });
});
