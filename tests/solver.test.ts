import { describe, expect, it } from 'vitest';
import { ALGORITHMS } from '@/data/algorithms';
import { CfopSolver } from '@/lib/cube/solver';
import { apply, SOLVED } from '@/lib/cube/state';
import { randomMoveScramble } from '@/lib/cube/scramble';
import { rand } from './helpers';

const solver = new CfopSolver(ALGORITHMS);

describe('resolución guiada', () => {
  it('resuelve 30 mezclas aleatorias con las opciones recomendadas', () => {
    let total = 0;
    for (let i = 0; i < 30; i++) {
      const scr = randomMoveScramble(25, rand);
      const steps = solver.solveAll(apply(SOLVED, scr));
      // aplicar la solución desde la mezcla, de verdad, y comprobar que queda resuelto
      const end = steps.reduce((s, o) => apply(s, o.alg), apply(SOLVED, scr));
      expect(solver.stageOf(end), scr).toBe('done');
      total += steps.reduce((a, o) => a + o.moves, 0);
    }
    expect(total / 30).toBeLessThan(65);
  });
  it('la cruz es óptima (8 movimientos como mucho)', () => {
    for (let i = 0; i < 20; i++) {
      const opts = solver.crossOptions(apply(SOLVED, randomMoveScramble(25, rand)));
      expect(opts.length).toBeGreaterThan(0);
      expect(opts[0].moves).toBeLessThanOrEqual(8); // el giro x2 no cuenta como movimiento
    }
  });
});
