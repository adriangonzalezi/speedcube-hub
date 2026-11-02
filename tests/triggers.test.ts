import { describe, expect, it } from 'vitest';
import { ALGORITHMS, SETS } from '@/data/algorithms';
import { simplify } from '@/lib/cube/notation';
import { groupAlg } from '@/lib/cube/triggers';

describe('algoritmos en bloques', () => {
  it('agrupa los triggers habituales', () => {
    expect(groupAlg("R U R' U' R' F R F'")).toBe("(R U R' U') (R' F R F')");
    expect(groupAlg("R U R' U R U2 R'")).toBe("(R U R' U) (R U2 R')"); // Sune
    expect(groupAlg("F R U R' U' F'")).toBe("F (R U R' U') F'");
    expect(groupAlg("U R U' R'")).toBe("U (R U' R')");
    expect(groupAlg("(R U R') U")).toBe("(R U R') U"); // si ya trae paréntesis, se respeta
  });
  it('agrupar nunca cambia los movimientos de ningún algoritmo', () => {
    for (const s of SETS) for (const c of ALGORITHMS[s]) for (const a of c.algs) expect(simplify(groupAlg(a)), `${c.id}: ${a}`).toBe(simplify(a));
  });
});
