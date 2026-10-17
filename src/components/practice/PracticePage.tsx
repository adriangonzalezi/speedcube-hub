'use client';
import { SubNav } from '@/components/ui';
import { CrossTrainer } from './CrossTrainer';
import { Flashcards } from './Flashcards';
import { LastSlotTrainer } from './LastSlotTrainer';
import { Recognition } from './Recognition';
import { TimedCases } from './TimedCases';
import { PRACTICE_MODES, type PracticeMode } from './modes';

const MODES: Record<PracticeMode, () => React.ReactNode> = {
  tarjetas: Flashcards, reconocimiento: Recognition, cruz: CrossTrainer, 'ultima-pareja': LastSlotTrainer, casos: TimedCases,
};

/** Práctica: pestañas con los cinco entrenadores */
export function PracticePage({ mode }: { mode: PracticeMode }) {
  const Mode = MODES[mode];
  return (
    <section>
      <SubNav label="Tipo de práctica" value={mode} hrefOf={m => `/practica/${m}`} items={PRACTICE_MODES.map(([k, l]) => [k, l])} />
      <Mode />
    </section>
  );
}
