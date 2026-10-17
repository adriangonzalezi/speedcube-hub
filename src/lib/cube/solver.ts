// Resolvedor CFOP paso a paso: cruz blanca óptima, F2L, OLL y PLL con los algoritmos de la app.
// Para cada opción calcula cómo queda el cubo y qué deja para el paso siguiente.
import type { AlgData } from '@/data/algorithms';
import { AUF, moveCount, simplify } from './notation';
import {
  CROSS, CubeState, FACELETS, PERM, PIECES, SLOTS, apply, centerOf, crossOk, f2lOk, isSolved, ollOk, slotOk,
  solvedSlots, solvedUpToAuf,
} from './state';

export type Stage = 'cross' | 'f2l' | 'oll' | 'pll' | 'done';
export type OptionKind = 'cross' | 'f2l' | 'extract' | 'oll' | 'pll';

export interface SolveOption {
  kind: OptionKind;
  label: string;
  caseId: string | null;
  alg: string;
  moves: number;
  after: CubeState;
  rotation?: boolean;
  alt?: boolean;
  slotName?: string;
  /** La mejor opción del paso siguiente (cuando se puede calcular) */
  next?: SolveOption;
}

// ---------- Cruz: búsqueda óptima con tabla de poda ----------
const FACE_MOVES = ['U', "U'", 'U2', 'D', "D'", 'D2', 'R', "R'", 'R2', 'L', "L'", 'L2', 'F', "F'", 'F2', 'B', "B'", 'B2'];
const EDGE_IDX = Object.values(PIECES).filter(p => p.length === 2).flat();
const EPOS: Record<number, number> = {};
EDGE_IDX.forEach((f, k) => (EPOS[f] = k));
// Para cada movimiento: a qué posición va la pegatina de arista que está en cada posición
const EMOVE = FACE_MOVES.map(m => {
  const P = PERM[m]; const to = new Int8Array(24);
  for (let j = 0; j < 54; j++) if (EPOS[P[j]] !== undefined) to[EPOS[P[j]]] = EPOS[j];
  return to;
});
const D_EDGES = CROSS.map(p => p.find(i => FACELETS[i].face === 'D')!);
const enc = (a: number[]) => ((a[0] * 24 + a[1]) * 24 + a[2]) * 24 + a[3];
let PRUNE: Int8Array | null = null;

function buildPrune(): Int8Array {
  if (PRUNE) return PRUNE;
  PRUNE = new Int8Array(331776).fill(-1);
  const goal = D_EDGES.map(i => EPOS[i]);
  let frontier = [goal]; PRUNE[enc(goal)] = 0; let d = 0;
  while (frontier.length) {
    const next: number[][] = []; d++;
    for (const st of frontier) for (const T of EMOVE) {
      const ns = [T[st[0]], T[st[1]], T[st[2]], T[st[3]]]; const e = enc(ns);
      if (PRUNE[e] === -1) { PRUNE[e] = d; next.push(ns); }
    }
    frontier = next;
  }
  return PRUNE;
}

/** Dónde está la pegatina blanca (de abajo) de cada arista de la cruz */
function crossState(s: CubeState): number[] {
  const D = s[31];
  return CROSS.map(p => {
    const side = p.find(i => FACELETS[i].face !== 'D')!;
    const sideColor = centerOf(s, side);
    for (const piece of Object.values(PIECES)) if (piece.length === 2) {
      const cols = piece.map(i => s[i]);
      if (cols.includes(D) && cols.includes(sideColor)) return EPOS[piece[cols.indexOf(D)]];
    }
    return 0;
  });
}

const OPP: Record<string, string> = { U: 'D', D: 'U', R: 'L', L: 'R', F: 'B', B: 'F' };
export function solveCross(s: CubeState, maxSolutions = 3): string[] {
  const P = buildPrune(); const start = crossState(s); const h0 = P[enc(start)];
  if (h0 === 0) return [''];
  const sols: string[] = []; const path: string[] = [];
  const dfs = (st: number[], depth: number, last: string | null) => {
    if (P[enc(st)] === 0) { sols.push(path.join(' ')); return; }
    if (P[enc(st)] > depth || sols.length >= maxSolutions) return;
    for (let m = 0; m < 18; m++) {
      const f = FACE_MOVES[m][0];
      if (last && (f === last || (OPP[f] === last && f < last))) continue;
      const T = EMOVE[m]; path.push(FACE_MOVES[m]);
      dfs([T[st[0]], T[st[1]], T[st[2]], T[st[3]]], depth - 1, f);
      path.pop();
      if (sols.length >= maxSolutions) return;
    }
  };
  for (let d = h0; d <= h0 + 1 && sols.length < maxSolutions; d++) dfs(start, d, null);
  return [...new Set(sols)];
}

// ---------- Opciones de cada paso ----------
const ROTS = ['', 'y', "y'", 'y2'];
const total = (o: SolveOption): number => o.moves + (o.rotation ? 0.5 : 0) + (o.next ? total(o.next) : 0);
export const totalMoves = total;
const rank = (opts: SolveOption[]) => opts.slice().sort((a, b) => total(a) - total(b));
const bestOf = (opts: SolveOption[]) => rank(opts)[0];

function dedupe(opts: SolveOption[]): SolveOption[] {
  const m = new Map<string, SolveOption>();
  for (const o of opts) {
    const k = o.after.join(''); const prev = m.get(k);
    if (!prev || o.moves < prev.moves || (o.moves === prev.moves && !o.rotation && prev.rotation)) m.set(k, o);
  }
  return [...m.values()];
}

/** Parejas resueltas identificadas por sus colores (no depende de cómo esté girado el cubo) */
function pairColors(s: CubeState): Set<string> {
  const res: string[] = [];
  SLOTS.forEach((sl, k) => { if (slotOk(s, k)) res.push(sl.idx.map(i => s[i]).filter(c => c !== s[31]).sort().join('')); });
  return new Set(res);
}
function keepsPairs(s: CubeState, r: CubeState) { const b = pairColors(r); for (const p of pairColors(s)) if (!b.has(p)) return false; return true; }
function slotLabel(s: CubeState, r: CubeState): string {
  const before = pairColors(s);
  const k = SLOTS.findIndex((sl, j) => slotOk(r, j) && !before.has(sl.idx.map(i => r[i]).filter(c => c !== r[31]).sort().join('')));
  if (k < 0) return '';
  const cols = SLOTS[k].idx.map(i => r[i]).filter(c => c !== r[31]);
  const k0 = SLOTS.findIndex(sl => { const sides = [PIECES[[sl.x, 0, 0].join()], PIECES[[0, 0, sl.z].join()]].map(p => s[p[0]]); return cols.every(c => sides.includes(c)); });
  return k0 >= 0 ? SLOTS[k0].name : '';
}

export class CfopSolver {
  constructor(private data: AlgData) {}

  stageOf(s: CubeState): Stage {
    if (!crossOk(s)) return 'cross';
    if (!f2lOk(s)) return 'f2l';
    if (!ollOk(s)) return 'oll';
    if (!isSolved(s)) return 'pll';
    return 'done';
  }

  pllOptions(s: CubeState): SolveOption[] {
    const skip = solvedUpToAuf(s);
    if (skip !== undefined) return [{ kind: 'pll', label: 'PLL skip', caseId: null, alg: skip, moves: moveCount(skip), after: apply(s, skip) }];
    const out: SolveOption[] = [];
    for (const c of this.data.pll) for (const a of AUF) c.algs.forEach((alg, ai) => {
      const r = apply(s, `${a} ${alg}`); const post = solvedUpToAuf(r);
      if (post === undefined) return;
      const seq = simplify(`${a} ${alg} ${post}`);
      out.push({ kind: 'pll', caseId: c.id, label: c.id, alt: ai > 0, alg: seq, moves: moveCount(seq), after: apply(r, post) });
    });
    return dedupe(out);
  }

  ollOptions(s: CubeState): SolveOption[] {
    if (ollOk(s)) return [{ kind: 'oll', label: 'OLL skip', caseId: null, alg: '', moves: 0, after: s, next: bestOf(this.pllOptions(s)) }];
    const out: SolveOption[] = [];
    for (const c of this.data.oll) for (const a of AUF) c.algs.forEach((alg, ai) => {
      const seq = simplify(`${a} ${alg}`); const r = apply(s, seq);
      if (!ollOk(r)) return;
      out.push({ kind: 'oll', caseId: c.id, label: c.id + (c.nick ? ` · ${c.nick}` : ''), alt: ai > 0, alg: seq, moves: moveCount(seq), after: r });
    });
    const opts = dedupe(out);
    for (const o of opts) o.next = bestOf(this.pllOptions(o.after));
    return opts;
  }

  f2lOptions(s: CubeState, withLookahead = true, depth = 0): SolveOption[] {
    const nSolved = solvedSlots(s).filter(Boolean).length;
    const out: SolveOption[] = [];
    for (const y of ROTS) for (const c of this.data.f2l) for (const a of AUF) c.algs.forEach((alg, ai) => {
      const seq = simplify(`${y} ${a} ${alg}`); const r = apply(s, seq);
      if (!crossOk(r)) return;
      // resuelve una pareja más sin romper ninguna de las que ya estaban
      if (solvedSlots(r).filter(Boolean).length !== nSolved + 1 || !keepsPairs(s, r)) return;
      out.push({ kind: 'f2l', caseId: c.id, label: c.id, alt: ai > 0, alg: seq, moves: moveCount(seq), rotation: !!y, slotName: slotLabel(s, r), after: r });
    });
    let opts = dedupe(out);
    if (!opts.length && depth === 0) opts = this.extractionOptions(s);
    if (withLookahead && nSolved === 3) for (const o of opts) if (o.kind === 'f2l') o.next = bestOf(this.ollOptions(o.after));
    return opts;
  }

  /** Cuando ninguna pareja se puede meter: sacar una pieza atascada en un hueco */
  extractionOptions(s: CubeState): SolveOption[] {
    const out: SolveOption[] = [];
    for (const y of ROTS) for (const alg of ["R U R'", "R U' R'", "R U2 R'", "L' U' L", "L' U L"]) {
      const seq = simplify(`${y} ${alg}`); const r = apply(s, seq);
      if (!crossOk(r) || !keepsPairs(s, r) || r.join() === s.join()) continue;
      out.push({ kind: 'extract', caseId: null, label: 'Sacar pieza de un hueco', alg: seq, moves: moveCount(seq), rotation: !!y, after: r });
    }
    const opts = dedupe(out);
    for (const o of opts) o.next = bestOf(this.f2lOptions(o.after, false, 1));
    const withNext = opts.filter(o => o.next);
    return withNext.length ? rank(withNext).slice(0, 4) : opts.slice(0, 2);
  }

  crossOptions(s: CubeState): SolveOption[] {
    // la cruz se hace con el blanco abajo: si no lo está, primero se gira el cubo
    const turn = ['', 'x2', 'x', "x'", 'z', "z'"].find(t => apply(s, t)[31] === 'U') ?? '';
    return solveCross(apply(s, turn)).map(seq => {
      const full = simplify(`${turn} ${seq}`);
      return { kind: 'cross' as const, label: 'Cruz blanca', caseId: null, alg: full, moves: moveCount(full), rotation: !!turn, after: apply(s, full) };
    });
  }

  /** Opciones del paso actual, de mejor a peor (menos movimientos hasta el final) */
  options(s: CubeState): SolveOption[] {
    switch (this.stageOf(s)) {
      case 'cross': return rank(this.crossOptions(s));
      case 'f2l': return rank(this.f2lOptions(s));
      case 'oll': return rank(this.ollOptions(s));
      case 'pll': return rank(this.pllOptions(s));
      default: return [];
    }
  }

  /** Resuelve eligiendo siempre la opción recomendada */
  solveAll(s: CubeState, maxSteps = 20): SolveOption[] {
    const steps: SolveOption[] = []; let cur = s;
    for (let i = 0; i < maxSteps && this.stageOf(cur) !== 'done'; i++) {
      const o = this.options(cur)[0]; if (!o) break;
      steps.push(o); cur = o.after;
    }
    return steps;
  }
}
