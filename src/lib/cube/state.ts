// Estado del cubo como 54 pegatinas en orden U R F D L B (9 por cara), el mismo orden que el
// parámetro fd de VisualCube. Cada pegatina guarda la letra de la cara de la que viene (su color).
// Las tablas de movimientos se generan una vez con un modelo 3D de pegatinas.
import { formatMove, tokens } from './notation';

export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
export type CubeState = Face[];
type Vec = [number, number, number];

export const FACE_ORDER: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];
const NORMAL: Record<Face, Vec> = { U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1], D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1] };
// Posición 3D de cada pegatina de una cara leída por filas (como la red desplegada)
const ORDER: Record<Face, (r: number, c: number) => Vec> = {
  U: (r, c) => [c - 1, 1, r - 1], R: (r, c) => [1, 1 - r, 1 - c], F: (r, c) => [c - 1, 1 - r, 1],
  D: (r, c) => [c - 1, -1, 1 - r], L: (r, c) => [-1, 1 - r, c - 1], B: (r, c) => [1 - c, 1 - r, -1],
};
// [eje, sentido del giro horario, qué piezas mueve]
const MOVES: Record<string, [number, number, (p: Vec) => boolean]> = {
  R: [0, -1, p => p[0] === 1], L: [0, 1, p => p[0] === -1], M: [0, 1, p => p[0] === 0],
  U: [1, -1, p => p[1] === 1], D: [1, 1, p => p[1] === -1], E: [1, 1, p => p[1] === 0],
  F: [2, -1, p => p[2] === 1], B: [2, 1, p => p[2] === -1], S: [2, -1, p => p[2] === 0],
  r: [0, -1, p => p[0] >= 0], l: [0, 1, p => p[0] <= 0], u: [1, -1, p => p[1] >= 0],
  d: [1, 1, p => p[1] <= 0], f: [2, -1, p => p[2] >= 0], b: [2, 1, p => p[2] <= 0],
  x: [0, -1, () => true], y: [1, -1, () => true], z: [2, -1, () => true],
};

function rot(v: Vec, axis: number, q: number): Vec {
  let [x, y, z] = v;
  for (let i = 0; i < ((q % 4) + 4) % 4; i++) {
    if (axis === 0) [y, z] = [-z, y];
    else if (axis === 1) [z, x] = [-x, z];
    else [x, y] = [-y, x];
  }
  return [x, y, z];
}

interface Facelet { p: Vec; n: Vec; face: Face }
export const FACELETS: Facelet[] = [];
for (const f of FACE_ORDER) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) FACELETS.push({ p: ORDER[f](r, c), n: NORMAL[f], face: f });
const keyOf = (p: Vec, n: Vec) => `${p.join()}|${n.join()}`;
const INDEX: Record<string, number> = {};
FACELETS.forEach((s, i) => (INDEX[keyOf(s.p, s.n)] = i));

/** PERM["R2"][j] = índice de la pegatina que acaba en j */
export const PERM: Record<string, Int8Array> = {};
for (const [b, [ax, s, pred]] of Object.entries(MOVES)) for (const q of [1, 2, 3]) {
  const P = new Int8Array(54);
  FACELETS.forEach((st, i) => {
    if (pred(st.p)) P[INDEX[keyOf(rot(st.p, ax, s * q), rot(st.n, ax, s * q))]] = i;
    else P[i] = i;
  });
  PERM[formatMove([b, q])] = P;
}

export const SOLVED: CubeState = FACELETS.map(s => s.face);
export const CENTERS = [4, 13, 22, 31, 40, 49];

export function apply(state: CubeState, alg: string): CubeState {
  let s = state;
  for (const t of tokens(alg)) {
    const P = PERM[formatMove(t)];
    const ns = new Array<Face>(54);
    for (let j = 0; j < 54; j++) ns[j] = s[P[j]];
    s = ns;
  }
  return s;
}
export const fromScramble = (alg: string) => apply(SOLVED, alg);
/** Cadena fd para VisualCube */
export const toFd = (s: CubeState) => s.join('').toLowerCase();
/** Pegatinas agrupadas por cara, para dibujar la red */
export function byFace(s: CubeState): Record<Face, Face[]> {
  const out = {} as Record<Face, Face[]>;
  FACE_ORDER.forEach((f, i) => (out[f] = s.slice(i * 9, i * 9 + 9)));
  return out;
}

// ---------- Piezas y comprobaciones (siempre relativas a los centros) ----------
export const PIECES: Record<string, number[]> = {};
FACELETS.forEach((s, i) => { (PIECES[s.p.join()] ||= []).push(i); });
export const pieceAt = (x: number, y: number, z: number) => PIECES[[x, y, z].join()];
export const centerOf = (s: CubeState, i: number) => s[CENTERS[FACE_ORDER.indexOf(FACELETS[i].face)]];
const pieceOk = (s: CubeState, idx: number[]) => idx.every(i => s[i] === centerOf(s, i));

export const CROSS = [[0, -1, 1], [1, -1, 0], [0, -1, -1], [-1, -1, 0]].map(([x, y, z]) => pieceAt(x, y, z));
export const SLOTS = [
  { x: 1, z: 1, name: 'delantero derecho' }, { x: -1, z: 1, name: 'delantero izquierdo' },
  { x: -1, z: -1, name: 'trasero izquierdo' }, { x: 1, z: -1, name: 'trasero derecho' },
].map(s => ({ ...s, idx: [...pieceAt(s.x, -1, s.z), ...pieceAt(s.x, 0, s.z)] }));

export const crossOk = (s: CubeState) => CROSS.every(p => pieceOk(s, p));
export const slotOk = (s: CubeState, k: number) => pieceOk(s, SLOTS[k].idx);
export const solvedSlots = (s: CubeState) => SLOTS.map((_, k) => slotOk(s, k));
export const f2lOk = (s: CubeState) => crossOk(s) && SLOTS.every((_, k) => slotOk(s, k));
export const ollOk = (s: CubeState) => f2lOk(s) && [0, 1, 2, 3, 5, 6, 7, 8].every(i => s[i] === s[4]);
export const isSolved = (s: CubeState) => s.every((c, i) => c === centerOf(s, i));
export const solvedUpToAuf = (s: CubeState) => ['', 'U', 'U2', "U'"].find(a => isSolved(apply(s, a)));
