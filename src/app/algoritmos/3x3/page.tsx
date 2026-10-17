import type { Metadata } from 'next';
import { SetPicker } from '@/components/algorithms/SetPicker';

export const metadata: Metadata = { title: 'Algoritmos 3x3' };
export default function Cube3x3Page() {
  return <SetPicker />;
}
