'use client';
// Estructura de todas las páginas: menú lateral plegable (o desplegable en el móvil),
// contenido y pie con descargas y copia de seguridad del progreso.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { PdfDialog } from '@/components/algorithms/PdfDialog';
import { useProgress } from '@/state/progress';
import { Footer } from './Footer';
import { Icon, Logo, type IconName } from './icons';

export const NAV: { href: string; icon: IconName; label: string }[] = [
  { href: '/', icon: 'home', label: 'Inicio' },
  { href: '/algoritmos', icon: 'algs', label: 'Algoritmos' },
  { href: '/cronometro', icon: 'timer', label: 'Cronómetro' },
  { href: '/resolucion-guiada', icon: 'guide', label: 'Resolución guiada' },
  { href: '/practica', icon: 'practice', label: 'Práctica' },
  { href: '/lecciones', icon: 'lessons', label: 'Lecciones' },
  { href: '/reto-diario', icon: 'daily', label: 'Reto diario' },
];
const isActive = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

function useIsDark(theme: string) {
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)'); setSystemDark(mq.matches);
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return theme ? theme === 'dark' : systemDark;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { prefs, setPrefs } = useProgress();
  const [open, setOpen] = useState(false); // menú del móvil
  const [pdfOpen, setPdfOpen] = useState(false);
  const dark = useIsDark(prefs.theme);
  const collapsed = prefs.sideCollapsed;
  const current = NAV.find(n => isActive(pathname, n.href));
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className={`shell${collapsed ? ' side-collapsed' : ''}${open ? ' side-open' : ''}`}>
      <aside className="side" aria-label="Menú principal">
        <div className="side-top">
          <Link className="brand" href="/" title="Inicio">
            <Logo />
            <span className="side-label"><b>Cubo Algs</b><small>Aprende CFOP</small></span>
          </Link>
        </div>
        <nav className="side-nav">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} title={n.label} aria-current={isActive(pathname, n.href) ? 'page' : undefined}>
              <Icon name={n.icon} /><span className="side-label">{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="side-bottom">
          <button onClick={() => setPdfOpen(true)} title="Descargar PDF"><Icon name="download" /><span className="side-label">Descargar PDF</span></button>
          <button onClick={() => setPrefs({ theme: dark ? 'light' : 'dark' })} title="Cambiar tema"><Icon name="theme" /><span className="side-label">{dark ? 'Modo claro' : 'Modo oscuro'}</span></button>
          <button className="side-toggle" onClick={() => setPrefs({ sideCollapsed: !collapsed })} title={collapsed ? 'Expandir menú' : 'Contraer menú'}>
            <Icon name="collapse" /><span className="side-label">{collapsed ? 'Expandir menú' : 'Contraer menú'}</span>
          </button>
        </div>
      </aside>
      {open && <div className="side-backdrop" onClick={() => setOpen(false)} />}
      <header className="mbar">
        <button className="mbar-menu" onClick={() => setOpen(true)} aria-label="Abrir menú"><Icon name="menu" /></button>
        <Logo /><b>{current?.label ?? 'Cubo Algs'}</b>
      </header>
      <div id="app">
        <main>{children}</main>
        <Footer />
      </div>
      <PdfDialog open={pdfOpen} onClose={() => setPdfOpen(false)} />
    </div>
  );
}
