import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CaseBrowser } from '@/components/algorithms/CaseBrowser';
import { SETS, SET_INFO, isCaseSet } from '@/data/algorithms';

type Params = { params: Promise<{ set: string }> };

export function generateStaticParams() {
  return SETS.map(set => ({ set }));
}
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { set } = await params;
  return { title: isCaseSet(set) ? `${SET_INFO[set].name} 3x3` : 'Algoritmos' };
}
export default async function SetPage({ params }: Params) {
  const { set } = await params;
  if (!isCaseSet(set)) notFound();
  return <CaseBrowser set={set} />;
}
