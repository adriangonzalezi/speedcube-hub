import type { Metadata, Viewport } from 'next';
import { Familjen_Grotesk, Figtree, JetBrains_Mono } from 'next/font/google';
import { AppShell } from '@/components/layout/AppShell';
import { AppProviders } from '@/state/AppProviders';
import '@/styles/base.css';
import '@/styles/layout.css';
import '@/styles/algorithms.css';
import '@/styles/timer.css';
import '@/styles/coach.css';
import '@/styles/practice.css';
import '@/styles/lessons.css';
import '@/styles/daily.css';
import '@/styles/home.css';

const display = Familjen_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' });
const body = Figtree({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: { default: 'Cubo Algs', template: '%s · Cubo Algs' },
  description: 'Aprende, practica y cronometra el método CFOP para el cubo de Rubik.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
