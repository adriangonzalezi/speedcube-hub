import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PracticePage } from '@/components/practice/PracticePage';
import { PRACTICE_MODES, isPracticeMode } from '@/components/practice/modes';

type Params = { params: Promise<{ modo: string }> };

export function generateStaticParams() {
  return PRACTICE_MODES.map(([modo]) => ({ modo }));
}
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { modo } = await params;
  return { title: `Práctica · ${PRACTICE_MODES.find(([k]) => k === modo)?.[1] ?? ''}` };
}
export default async function PracticeModePage({ params }: Params) {
  const { modo } = await params;
  if (!isPracticeMode(modo)) notFound();
  return <PracticePage mode={modo} />;
}
