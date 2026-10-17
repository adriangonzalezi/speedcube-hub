import type { Metadata } from 'next';
import { GuidedSolve } from '@/components/guide/GuidedSolve';

export const metadata: Metadata = { title: 'Resolución guiada' };
export default async function GuidedSolvePage({ searchParams }: { searchParams: Promise<{ mezcla?: string }> }) {
  const { mezcla } = await searchParams;
  return <GuidedSolve initialScramble={mezcla} />;
}
