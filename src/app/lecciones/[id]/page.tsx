import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LessonsPage } from '@/components/lessons/LessonsPage';
import { LESSONS, findLesson } from '@/components/lessons/content';

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return LESSONS.map(l => ({ id: l.id }));
}
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return { title: findLesson(id)?.title ?? 'Lecciones' };
}
export default async function LessonPage({ params }: Params) {
  const { id } = await params;
  if (!findLesson(id)) notFound();
  return <LessonsPage id={id} />;
}
