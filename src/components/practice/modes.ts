// Modos de Práctica (compartido por las páginas del servidor y los componentes del cliente).
export const PRACTICE_MODES = [
  ['tarjetas', 'Tarjetas'], ['reconocimiento', 'Reconocimiento'], ['cruz', 'Cruz'], ['ultima-pareja', 'Última pareja'], ['casos', 'Casos cronometrados'],
] as const;
export type PracticeMode = (typeof PRACTICE_MODES)[number][0];
export const isPracticeMode = (m: string): m is PracticeMode => PRACTICE_MODES.some(([k]) => k === m);
