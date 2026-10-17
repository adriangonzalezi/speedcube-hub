import type { Metadata } from 'next';
import { TimerPage } from '@/components/timer/TimerPage';

export const metadata: Metadata = { title: 'Cronómetro' };
export default function CronometroPage() {
  return <TimerPage />;
}
