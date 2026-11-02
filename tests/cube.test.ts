import { describe, expect, it } from 'vitest';
import Cube from 'cubejs';
import { ALGORITHMS, SETS } from '@/data/algorithms';
import { invert, moveCount, simplify } from '@/lib/cube/notation';
import { apply, SOLVED, isSolved, f2lOk, ollOk } from '@/lib/cube/state';
import { randomMoveScramble } from '@/lib/cube/scramble';
import { delta, formatDelta } from '@/lib/timer/stats';
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

describe('diferencia con el tiempo anterior', () => {
  const s = (t: number, p: null | '+2' | 'DNF' = null) => ({ t, p, s: '', d: 0 });
  it('calcula +5 y −2 y no compara con DNF', () => {
    expect(formatDelta(delta(s(25000), s(20000))!)).toBe('+5.00');
    expect(formatDelta(delta(s(23000), s(25000))!)).toBe('−2.00');
    expect(formatDelta(delta(s(21000, '+2'), s(22000))!)).toBe('+1.00'); // el +2 cuenta
    expect(delta(s(20000), s(19000, 'DNF'))).toBeNull();
  });
});
