// Notación de movimientos: leer, invertir, simplificar y contar.

/** [cara o capa, cuartos de vuelta en sentido horario (1, 2 o 3)] */
export type Move = [string, number];

const TOKEN = /^([RLUDFBMESrludfbxyz])(w?)(\d?)('?)$/;

export function tokens(alg: string): Move[] {
  return String(alg || '')
    .replace(/[()[\]]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(t => {
      const m = t.match(TOKEN);
      if (!m) throw new Error(`Movimiento no válido: ${t}`);
      const base = m[2] ? m[1].toLowerCase() : m[1];
      let n = m[3] ? +m[3] % 4 : 1;
      if (m[4]) n = (4 - n) % 4;
      return [base, n] as Move;
    })
    .filter(t => t[1] !== 0);
}

export const formatMove = ([b, n]: Move) => b + (n === 2 ? '2' : n === 3 ? "'" : '');

/** Une giros seguidos de la misma capa (U U2 → U') y quita los que se anulan. */
export function simplify(alg: string): string {
  const out: Move[] = [];
  for (const [b, n] of tokens(alg)) {
    const last = out[out.length - 1];
    if (last && last[0] === b) {
      last[1] = (last[1] + n) % 4;
      if (!last[1]) out.pop();
    } else out.push([b, n]);
  }
  return out.map(formatMove).join(' ');
}

export const invert = (alg: string) => tokens(alg).reverse().map(([b, n]) => formatMove([b, (4 - n) % 4])).join(' ');

/** Movimientos sin contar los giros del cubo entero (x, y, z). */
export const moveCount = (alg: string) => tokens(alg).filter(([b]) => !'xyz'.includes(b)).length;

/** Solo giros de caras exteriores (útil para preparar casos sin mover centros). */
export const isFaceOnly = (alg: string) => /^[RLUDFB'2 ]+$/.test(alg);

export const AUF = ['', 'U', "U'", 'U2'] as const;
