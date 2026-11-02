// Tiempos, penalizaciones y medias según el reglamento WCA.

export type Penalty = null | '+2' | 'DNF';
export interface Solve {
  /** milisegundos */
  t: number;
  p: Penalty;
  /** mezcla */
  s: string;
  /** fecha (ms) */
  d: number;
  /** fases acumuladas: [fin cruz, fin F2L, …, total] */
  sp?: number[];
}

export const effective = (s: Pick<Solve, 't' | 'p'>) => (s.p === 'DNF' ? Infinity : s.t + (s.p === '+2' ? 2000 : 0));

/** 12.34 · 1:02.34 · DNF · – (los centisegundos se truncan, como en la WCA) */
export function formatTime(ms: number | undefined | null): string {
  if (ms === undefined || ms === null || Number.isNaN(ms)) return '–';
  if (ms === Infinity) return 'DNF';
  const cs = Math.floor(ms / 10); const s = Math.floor(cs / 100); const m = Math.floor(s / 60);
  const rest = String(cs % 100).padStart(2, '0');
  return m ? `${m}:${String(s % 60).padStart(2, '0')}.${rest}` : `${s}.${rest}`;
}
/** Diferencia con el tiempo anterior (null si alguno es DNF o no hay anterior) */
export function delta(cur: Solve | null | undefined, prev: Solve | null | undefined): number | null {
  if (!cur || !prev) return null;
  const a = effective(cur), b = effective(prev);
  return a === Infinity || b === Infinity ? null : a - b;
}
/** +5.00 / −2.00 (centésimas, con el signo menos tipográfico) */
export const formatDelta = (ms: number) => `${ms > 0 ? '+' : ms < 0 ? '−' : '±'}${(Math.abs(ms) / 1000).toFixed(2)}`;

/**
 * Lee un tiempo escrito a mano (como en csTimer):
 * "21.43" · "1:02.34" · "2143" (= 21.43) · "12345" (= 1:23.45) · "DNF" · "21.43+" (+2)
 * Devuelve null si no se entiende.
 */
export function parseTimeInput(input: string): { t: number; p: Penalty } | null {
  let s = input.trim().toLowerCase().replace(',', '.');
  if (!s) return null;
  if (s.startsWith('dnf')) {
    const inner = s.slice(3).replace(/[()]/g, '').trim();
    const parsed = inner ? parseTimeInput(inner) : null;
    return { t: parsed?.t ?? 0, p: 'DNF' };
  }
  let p: Penalty = null;
  if (s.endsWith('+2')) { p = '+2'; s = s.slice(0, -2).trim(); } else if (s.endsWith('+')) { p = '+2'; s = s.slice(0, -1).trim(); }
  let ms: number;
  if (/^\d{1,2}$/.test(s)) {
    // una o dos cifras: segundos enteros ("21" = 21.00)
    ms = +s * 1000;
  } else if (/^\d+$/.test(s)) {
    // más cifras: las dos últimas son centésimas; si hay más de 4, las de delante son minutos
    const n = s.padStart(3, '0'); const cs = +n.slice(-2); const rest = n.slice(0, -2);
    const sec = +rest.slice(-2), min = +(rest.slice(0, -2) || 0);
    if (sec >= 60 && min > 0) return null;
    ms = (min * 60 + sec) * 1000 + cs * 10;
  } else {
    const m = s.match(/^(?:(\d+):)?(\d+)(?:\.(\d{1,3}))?$/);
    if (!m) return null;
    const min = m[1] ? +m[1] : 0, sec = +m[2];
    if (m[1] && sec >= 60) return null;
    ms = (min * 60 + sec) * 1000 + (m[3] ? Math.round(+`0.${m[3]}` * 1000) : 0);
  }
  return ms > 0 ? { t: ms, p } : null;
}

export const formatSolve = (s: Solve) => (s.p === 'DNF' ? (s.t ? `DNF(${formatTime(s.t)})` : 'DNF') : formatTime(effective(s)) + (s.p === '+2' ? '+' : ''));

/** Media con recorte: ao5/ao12 quitan el mejor y el peor; ao50/ao100 el 5 % de cada lado */
export function average(win: Solve[], trim: number): number {
  const v = win.map(effective).sort((a, b) => a - b).slice(trim, win.length - trim);
  if (v.some(x => x === Infinity)) return Infinity;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

export const AVERAGES = [
  { key: 'mo3', n: 3, trim: 0, label: 'Mo3' }, { key: 'ao5', n: 5, trim: 1, label: 'Ao5' },
  { key: 'ao12', n: 12, trim: 1, label: 'Ao12' }, { key: 'ao50', n: 50, trim: 3, label: 'Ao50' },
  { key: 'ao100', n: 100, trim: 5, label: 'Ao100' },
] as const;
export type AverageKey = (typeof AVERAGES)[number]['key'];
export type Rolling = Record<AverageKey, (number | undefined)[]>;

/** La media que había justo después de cada tiempo */
export function rolling(list: Solve[]): Rolling {
  const out = {} as Rolling;
  for (const k of AVERAGES) out[k.key] = list.map((_, i) => (i + 1 >= k.n ? average(list.slice(i + 1 - k.n, i + 1), k.trim) : undefined));
  return out;
}
export const bestOf = (arr: (number | undefined)[]) =>
  arr.some(v => v !== undefined) ? arr.reduce<number>((m, v) => (v !== undefined && v < m ? v : m), Infinity) : undefined;

// ---------- Fases (cronómetro multifase) ----------
export const PHASES: Record<number, string[]> = { 1: ['Total'], 2: ['F2L', 'Última capa'], 3: ['Cruz', 'F2L', 'Última capa'], 4: ['Cruz', 'F2L', 'OLL', 'PLL'] };
/** Reparto típico del tiempo en CFOP, para detectar la fase que más frena */
export const PHASE_REFERENCE: Record<number, number[]> = { 2: [0.63, 0.37], 3: [0.13, 0.5, 0.37], 4: [0.13, 0.5, 0.17, 0.2] };
export const phaseDurations = (sp: number[]) => sp.map((v, i) => v - (i ? sp[i - 1] : 0));

export function phaseSummary(solves: Solve[], n: number, last = 12) {
  const withSp = solves.filter(s => s.sp && s.sp.length === n && s.p !== 'DNF').slice(-last);
  if (!withSp.length || n < 2) return null;
  const means = PHASES[n].map((_, i) => withSp.reduce((a, s) => a + phaseDurations(s.sp!)[i], 0) / withSp.length);
  const totalMs = means.reduce((a, b) => a + b, 0);
  const pct = means.map(m => m / totalMs);
  const dev = pct.map((p, i) => p - PHASE_REFERENCE[n][i]);
  const worst = dev.indexOf(Math.max(...dev));
  return { count: withSp.length, means, pct, worst, worstDeviation: dev[worst] };
}
