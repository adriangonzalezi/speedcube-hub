// Geometría de los dibujos del cubo (sin React): qué pegatinas se ven y dónde van.
// Sustituye a las imágenes de VisualCube: se calcula todo a partir del estado del simulador.
import type { AlgCase, CaseSet } from '@/data/algorithms';
import { invert } from './notation';
import { FACELETS, SOLVED, apply, type CubeState, type Face } from './state';

export type Color = string;
export const GRAY = '#5a5f57';

/** Colores con el blanco arriba y el verde delante (mezclas, resolución guiada) */
export const WCA_COLORS: Record<Face, Color> = { U: '#ffffff', D: '#ffd500', F: '#009b48', B: '#0046ad', R: '#b71234', L: '#ff5800' };
/** Colores para los casos: amarillo arriba y verde delante, como se ejecutan los algoritmos */
export const CASE_COLORS: Record<Face, Color> = { U: '#ffd500', D: '#ffffff', F: '#009b48', B: '#0046ad', R: '#ff5800', L: '#b71234' };

export interface Polygon { points: [number, number][]; fill: Color }
export interface Arrow { from: [number, number]; to: [number, number] }
export interface Diagram { viewBox: string; polygons: Polygon[]; arrows: Arrow[]; outline?: [number, number][] }

// ---------- Vista de arriba (plana), como VisualCube view=plan ----------
// Cara U en el centro y, alrededor, la fila de arriba de cada cara lateral.
const CELL = 30, GAP = 2, SIDE = 9, PAD = 4;
const ORIGIN = PAD + SIDE + GAP; // esquina de la cara U
const cellRect = (x: number, y: number, w: number, h: number): [number, number][] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
/** Centro de la pegatina i (0–8) de la cara U en la vista plana */
const uCenter = (i: number): [number, number] => [ORIGIN + (i % 3) * CELL + CELL / 2, ORIGIN + Math.floor(i / 3) * CELL + CELL / 2];

export function planDiagram(colorOf: (i: number) => Color, arrows: [number, number][] = []): Diagram {
  const polygons: Polygon[] = [];
  const s = CELL - GAP;
  for (let i = 0; i < 9; i++) polygons.push({ points: cellRect(ORIGIN + (i % 3) * CELL + GAP / 2, ORIGIN + Math.floor(i / 3) * CELL + GAP / 2, s, s), fill: colorOf(i) });
  const far = ORIGIN + 3 * CELL;
  for (let k = 0; k < 3; k++) {
    const along = ORIGIN + k * CELL + GAP / 2;
    // Delante (F 0..2, de izquierda a derecha) · Detrás (B 0..2, de derecha a izquierda vista desde delante)
    polygons.push({ points: cellRect(along, far + GAP, s, SIDE), fill: colorOf(18 + k) });
    polygons.push({ points: cellRect(ORIGIN + (2 - k) * CELL + GAP / 2, PAD, s, SIDE), fill: colorOf(45 + k) });
    // Derecha (R 0..2, de delante hacia atrás) · Izquierda (L 0..2, de atrás hacia delante)
    polygons.push({ points: cellRect(far + GAP, ORIGIN + (2 - k) * CELL + GAP / 2, SIDE, s), fill: colorOf(9 + k) });
    polygons.push({ points: cellRect(PAD, along, SIDE, s), fill: colorOf(36 + k) });
  }
  const size = far + GAP + SIDE + PAD;
  return {
    viewBox: `0 0 ${size} ${size}`, polygons,
    arrows: arrows.map(([a, b]) => ({ from: uCenter(a), to: uCenter(b) })),
    outline: cellRect(ORIGIN - 1, ORIGIN - 1, 3 * CELL + 2, 3 * CELL + 2),
  };
}

// ---------- Vista en 3D (isométrica): caras U, F y R ----------
type V3 = [number, number, number];
const project = ([x, y, z]: V3): [number, number] => [(x - z) * 0.866, -y + (x + z) * 0.5];
const VISIBLE = new Set<Face>(['U', 'F', 'R']);

export function isoDiagram(colorOf: (i: number) => Color): Diagram {
  const polygons: Polygon[] = [];
  FACELETS.forEach((f, i) => {
    if (!VISIBLE.has(f.face)) return;
    const n = f.n; const axis = n.findIndex(v => v !== 0);
    const [a, b] = [0, 1, 2].filter(k => k !== axis);
    const c: V3 = [f.p[0] + n[0] * 0.5, f.p[1] + n[1] * 0.5, f.p[2] + n[2] * 0.5];
    const corner = (da: number, db: number): [number, number] => { const v = [...c] as V3; v[a] += da; v[b] += db; return project(v); };
    const h = 0.44;
    polygons.push({ points: [corner(-h, -h), corner(h, -h), corner(h, h), corner(-h, h)], fill: colorOf(i) });
  });
  // silueta del cubo (hexágono) para el fondo negro
  const e = 1.53;
  const outline = ([[-e, e, -e], [e, e, -e], [e, -e, -e], [e, -e, e], [-e, -e, e], [-e, e, e]] as V3[]).map(project);
  return { viewBox: '-2.8 -3.25 5.6 6.5', polygons, arrows: [], outline };
}

// ---------- Casos de algoritmos ----------
export type Auf = '' | 'U' | 'U2' | "U'";

/** Estado de un caso: el que resuelve su algoritmo principal (con un giro de U previo opcional) */
export const caseState = (c: AlgCase, auf: Auf = '') => apply(SOLVED, invert(`${c.algs[0]} ${auf}`));

const FD_FACE: Record<string, Face> = { u: 'U', r: 'R', f: 'F', d: 'D', l: 'L', b: 'B' };
const ROT_AUF: Record<Auf, number> = { '': 0, U: 1, U2: 2, "U'": 3 };

/** Dibujo de un caso como en VisualCube: OLL y PLL desde arriba, F2L (y PLL para reconocer) en 3D */
export function caseDiagram(c: AlgCase, set: CaseSet, o: { auf?: Auf; iso?: boolean } = {}): Diagram {
  const auf = o.auf ?? '';
  if (set === 'f2l') {
    // las parejas F2L traen su estado ya calculado (con las piezas que no importan en gris)
    const fd = c.fdAuf?.[ROT_AUF[auf]] ?? c.fd ?? '';
    return isoDiagram(i => (fd[i] === 'n' ? GRAY : CASE_COLORS[FD_FACE[fd[i]]]));
  }
  const s = caseState(c, auf);
  if (set === 'oll') return planDiagram(i => (s[i] === s[4] ? CASE_COLORS[s[4]] : GRAY));
  if (o.iso) return isoDiagram(i => (FACELETS[i].p[1] === 1 ? CASE_COLORS[s[i]] : GRAY));
  // PLL: flechas en las posiciones de la cara de arriba (sin giro previo, como en la ficha)
  const arrows = !auf && c.arw ? c.arw.split(',').map(a => a.match(/U(\d)U(\d)/)!.slice(1).map(Number) as [number, number]) : [];
  return planDiagram(i => CASE_COLORS[s[i]], arrows);
}

/** Estado completo con colores WCA. back = vista desde atrás (caras U, B y L) */
export const stateDiagram = (s: CubeState, back = false) => { const v = back ? apply(s, 'y2') : s; return isoDiagram(i => WCA_COLORS[v[i]]); };

