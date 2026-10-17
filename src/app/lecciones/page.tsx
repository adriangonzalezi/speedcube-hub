import type { Metadata } from 'next';
import { LessonsPage } from '@/components/lessons/LessonsPage';

export const metadata: Metadata = { title: 'Lecciones' };
export default function LessonsIndex() {
  return <LessonsPage />;
}
