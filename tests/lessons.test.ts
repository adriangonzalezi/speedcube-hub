// Comprueba que las reglas que se enseñan en las lecciones funcionan de verdad,
// aplicándolas tal cual sobre muchas últimas capas aleatorias.
import { describe, expect, it } from 'vitest';
import { findCase } from '@/data/algorithms';
import { AUF } from '@/lib/cube/notation';
import { apply, isSolved, ollOk, type CubeState } from '@/lib/cube/state';
import { ALGORITHMS } from '@/data/algorithms';
import { randomLastLayer } from './helpers';

const R = (i: number) => 9 + i, F = (i: number) => 18 + i, L = (i: number) => 36 + i, B = (i: number) => 45 + i;
const Y = (s: CubeState) => s[4];
const edgesUp = (s: CubeState) => [1, 3, 5, 7].map(i => s[i] === Y(s)); // atrás, izquierda, derecha, delante
const cornersUp = (s: CubeState) => [0, 2, 6, 8].filter(i => s[i] === Y(s)).length;
const rotations = (s: CubeState) => AUF.map(a => apply(s, a));
const cornersPlaced = (t: CubeState) => [[B(0), B(2)], [R(0), R(2)], [F(0), F(2)], [L(0), L(2)]].every(([x, y]) => t[x] === t[y]);

describe('Unidad 2 · método principiante', () => {
  it('resuelve 1.500 últimas capas siguiendo las reglas al pie de la letra', () => {
    for (let n = 0; n < 1500; n++) {
      let s = randomLastLayer(); let guard = 0;
      while (edgesUp(s).filter(Boolean).length < 4 && guard++ < 20) { // cruz amarilla
        const t = rotations(s).find(t => { const [b, l, r, f] = edgesUp(t); return (b && l && !r && !f) || (l && r && !b && !f) || (!b && !l && !r && !f); });
        if (t) s = t;
        s = apply(s, "F R U R' U' F'");
      }
      while (cornersUp(s) < 4 && guard++ < 40) { // cara amarilla con Sune
        const t = rotations(s).find(t => (cornersUp(t) === 1 ? t[6] === Y(t) : t[L(2)] === Y(t)));
        expect(t).toBeDefined(); s = apply(t!, "R U R' U R U2 R'");
      }
      while (guard++ < 60) { // esquinas: faros detrás y A-perm
        const done = rotations(s).find(cornersPlaced); if (done) { s = done; break; }
        s = apply(rotations(s).find(t => t[B(0)] === t[B(2)]) ?? s, "R' F R' B2 R F' R' B2 R2");
      }
      while (!isSolved(s) && guard++ < 80) { // aristas: cara completa detrás y U-perm
        const done = rotations(s).find(isSolved); if (done) { s = done; break; }
        s = apply(rotations(s).find(t => t[B(0)] === t[B(1)] && t[B(1)] === t[B(2)]) ?? s, "R U' R U R U R U' R' U' R2");
      }
      expect(rotations(s).some(isSolved)).toBe(true);
    }
  });
});

describe('Unidad 5 · última capa en 2 pasos', () => {
  const OCLL = ALGORITHMS.oll.filter(c => +c.num >= 21 && +c.num <= 27);
  const T = findCase('pll', 'T')!.algs[0], Yp = findCase('pll', 'Y')!.algs[0];
  const EP = ['Ua', 'Ub', 'H', 'Z'].map(k => findCase('pll', k)!.algs[0]);
  it('orienta y permuta 1.500 últimas capas', () => {
    for (let n = 0; n < 1500; n++) {
      let s = randomLastLayer();
      for (let k = 0; k < 2 && edgesUp(s).filter(Boolean).length < 4; k++) {
        for (const t of rotations(s)) {
          const [b, l, r, f] = edgesUp(t);
          if (l && r && !b && !f) { s = apply(t, "F R U R' U' F'"); break; } // línea horizontal
          if (b && l && !r && !f) { s = apply(t, "F U R U' R' F'"); break; } // L detrás a la izquierda
          if (!b && !l && !r && !f) { s = apply(t, "F R U R' U' F'"); break; } // punto
        }
      }
      expect(edgesUp(s).every(Boolean)).toBe(true);
      if (!ollOk(s)) { const t = OCLL.flatMap(c => AUF.map(a => apply(s, `${a} ${c.algs[0]}`))).find(ollOk); expect(t).toBeDefined(); s = t!; }
      if (!rotations(s).some(cornersPlaced)) {
        const t = rotations(s).find(t => t[L(0)] === t[L(2)]); // faros a la izquierda → T-perm
        s = t ? apply(t, T) : apply(s, Yp); // sin faros → Y-perm
        expect(rotations(s).some(cornersPlaced)).toBe(true);
      }
      const solved = (t: CubeState) => rotations(t).some(isSolved);
      expect(solved(s) || EP.some(alg => AUF.some(a => solved(apply(s, `${a} ${alg}`))))).toBe(true);
    }
  });
});
