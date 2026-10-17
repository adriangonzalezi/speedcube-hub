// Punto de entrada de la lógica del cubo con los algoritmos de la app ya cargados.
import { ALGORITHMS } from '@/data/algorithms';
import { CfopSolver } from './solver';

export const solver = new CfopSolver(ALGORITHMS);
export * from './notation';
export * from './state';
export { totalMoves, type SolveOption, type Stage } from './solver';
