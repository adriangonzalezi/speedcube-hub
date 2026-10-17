import type { Metadata } from 'next';
import { PuzzlePicker } from '@/components/algorithms/PuzzlePicker';

export const metadata: Metadata = { title: 'Algoritmos' };
export default function AlgorithmsPage() {
  return <PuzzlePicker />;
}
