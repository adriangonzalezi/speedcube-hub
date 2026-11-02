// Agrupa un algoritmo en bloques fáciles de recordar: (R U R' U') (R' F R F')…
// Reconoce los "triggers" más habituales; lo que no encaja en ninguno queda suelto.
import { formatMove, tokens } from './notation';

const TRIGGERS = [
  // Sune y Antisune (y sus versiones con la izquierda)
  "R U R' U R U2 R'", "R U2 R' U' R U' R'", "L' U' L U' L' U2 L", "L' U2 L U L' U L",
  // F sexy F'
  "F R U R' U' F'", "f R U R' U' f'", "F U R U' R' F'",
  // sexy move, sledgehammer y variantes
  "R U R' U'", "U R U' R'", "R' U' R U", "U' R' U R", "R' F R F'", "F R' F' R",
  "L' U' L U", "U' L' U L", "L U L' U'", "L F' L' F", "r U R' U'", "R U R' U", "R U' R' U", "R' U' R U'",
  // inserciones de tres movimientos
  "R U R'", "R U' R'", "R U2 R'", "R' U R", "R' U' R", "R' U2 R",
  "L U L'", "L U' L'", "L U2 L'", "L' U L", "L' U' L", "L' U2 L",
  "r U r'", "r U' r'", "r U2 r'", "r' U r", "r' U' r", "r' U2 r",
  "l U l'", "l' U' l", "F U F'", "F U' F'", "F' U F", "F' U' F", "R' F R", "M' U M", "M U M'",
].map(t => tokens(t).map(formatMove)).sort((a, b) => b.length - a.length);

/** "R U R' U' R' F R F'" → "(R U R' U') (R' F R F')". Respeta los paréntesis si ya los tiene. */
export function groupAlg(alg: string): string {
  if (/[()]/.test(alg)) return alg;
  let moves: string[];
  try { moves = tokens(alg).map(formatMove); } catch { return alg; }
  const out: string[] = [];
  for (let i = 0; i < moves.length;) {
    // el bloque más largo que encaje, pero nunca el algoritmo entero (no aportaría nada)
    const t = TRIGGERS.find(tr => tr.length < moves.length && tr.every((m, k) => moves[i + k] === m));
    if (t) { out.push(`(${t.join(' ')})`); i += t.length; }
    else { out.push(moves[i]); i++; }
  }
  return out.join(' ');
}
