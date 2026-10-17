import type { Metadata } from 'next';
import { DailyChallenge } from '@/components/daily/DailyChallenge';

export const metadata: Metadata = { title: 'Reto diario' };
export default function DailyPage() {
  return <DailyChallenge />;
}
