import type { ReactNode } from 'react';

export interface Quiz { q: string; options: string[]; answer: number }
export interface Lesson {
  id: string;
  unit: string;
  title: string;
  minutes: number;
  body: () => ReactNode;
  quiz: Quiz;
  /** Enlaces para practicar lo aprendido: [texto, ruta] */
  cta?: [string, string][];
}
export interface Unit { id: string; title: string; description: string }

export const lesson = (l: Lesson) => l;
