// Los dibujos de los casos se generan con el simulador: comprobamos que muestran lo que deben.
import { describe, expect, it } from 'vitest';
import { ALGORITHMS, SETS, findCase } from '@/data/algorithms';
import { CASE_COLORS, GRAY, caseDiagram, stateDiagram } from '@/lib/cube/diagram';
import { SOLVED } from '@/lib/cube/state';

const YELLOW = CASE_COLORS.U;
// vista plana: las 9 primeras pegatinas son la cara de arriba
const topYellow = (set: 'oll', n: number) => caseDiagram(findCase(set, n)!, set).polygons.slice(0, 9).filter(p => p.fill === YELLOW).length;

describe('dibujos de los casos', () => {
  it('OLL: cuántas pegatinas amarillas hay arriba', () => {
    expect(topYellow('oll', 27)).toBe(6); // Sune: centro, 4 aristas y 1 esquina
    expect(topYellow('oll', 21)).toBe(5); // H: centro y 4 aristas
    expect(topYellow('oll', 1)).toBe(1);  // punto: solo el centro
  });
  it('OLL: los laterales de la última capa solo son amarillos o grises', () => {
    for (const c of ALGORITHMS.oll) for (const p of caseDiagram(c, 'oll').polygons) expect([YELLOW, GRAY]).toContain(p.fill);
  });
  it('PLL: la cara de arriba es toda amarilla y hay flechas', () => {
    for (const c of ALGORITHMS.pll) {
      const d = caseDiagram(c, 'pll');
      expect(d.polygons.slice(0, 9).every(p => p.fill === YELLOW), c.id).toBe(true);
      expect(d.arrows.length, c.id).toBeGreaterThan(1);
    }
  });
  it('todos los casos se dibujan (27 pegatinas en 3D, 21 en la vista plana)', () => {
    for (const s of SETS) for (const c of ALGORITHMS[s]) expect(caseDiagram(c, s).polygons.length).toBe(s === 'f2l' ? 27 : 21);
  });
  it('cubo resuelto con colores WCA: blanco arriba, verde delante, rojo a la derecha', () => {
    const fills = new Set(stateDiagram(SOLVED).polygons.map(p => p.fill));
    expect([...fills].sort()).toEqual(['#009b48', '#b71234', '#ffffff'].sort());
  });
});
