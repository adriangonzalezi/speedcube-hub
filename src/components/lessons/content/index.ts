// Todas las lecciones, en orden, agrupadas en unidades de lo básico a lo avanzado.
import u1 from './u1-primeros-pasos';
import u2 from './u2-principiante';
import u3 from './u3-cruz';
import u4 from './u4-f2l';
import u5 from './u5-ultima-capa';
import u6 from './u6-avanzado';
import type { Lesson, Unit } from './types';

export type { Lesson, Quiz, Unit } from './types';

export const UNITS: Unit[] = [
  { id: 'u1', title: 'Primeros pasos', description: 'Conoce el cubo y aprende a leer algoritmos.' },
  { id: 'u2', title: 'Método principiante', description: 'Resuelve el cubo entero por capas, con 6 algoritmos cortos.' },
  { id: 'u3', title: 'La cruz', description: 'Empieza el CFOP: la cruz abajo y bien planificada.' },
  { id: 'u4', title: 'F2L intuitivo', description: 'Resuelve las dos primeras capas por parejas.' },
  { id: 'u5', title: 'Última capa en 2 pasos', description: 'Orienta y permuta la última capa con 16 algoritmos.' },
  { id: 'u6', title: 'Avanzado', description: 'Hacia sub-20: algoritmos completos, reconocimiento y fluidez.' },
];
export const LESSONS: Lesson[] = [...u1, ...u2, ...u3, ...u4, ...u5, ...u6];
export const findLesson = (id: string) => LESSONS.find(l => l.id === id);
export const unitOf = (l: Lesson) => UNITS.find(u => u.id === l.unit)!;
