'use client';
// Piezas de interfaz reutilizables en toda la app.
import Link from 'next/link';
import type { ReactNode } from 'react';
import { byFace, fromScramble, type Face } from '@/lib/cube/state';
import { groupAlg } from '@/lib/cube/triggers';
import { animationUrl } from '@/lib/visualcube';
import { useProgress } from '@/state/progress';

/** Imagen de VisualCube (servicio externo, por eso no usamos next/image) */
export function CubeImage({ src, alt = '', size = 96, lazy = true, className, onLoad }: { src: string; alt?: string; size?: number; lazy?: boolean; className?: string; onLoad?: () => void }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={size} height={size} loading={lazy ? 'lazy' : undefined} className={className} onLoad={onLoad} />;
}

const NET_COLORS: Record<Face, string> = { U: '#ffffff', D: '#ffd500', F: '#009b48', B: '#0046ad', R: '#b71234', L: '#ff5800' };
const NET_POS: Record<Face, [number, number]> = { U: [30, 0], L: [0, 30], F: [30, 30], R: [60, 30], B: [90, 30], D: [30, 60] };
/** Red desplegada del cubo tras aplicar una mezcla (blanco arriba, verde delante) */
export function CubeNet({ alg, label = 'Estado del cubo tras la mezcla' }: { alg: string; label?: string }) {
  let faces: Record<Face, Face[]>;
  try { faces = byFace(fromScramble(alg)); } catch { faces = byFace(fromScramble('')); }
  return (
    <svg className="tm-net" viewBox="0 0 120 90" role="img" aria-label={label}>
      {(Object.keys(NET_POS) as Face[]).flatMap(face => faces[face].map((c, i) => (
        <rect key={`${face}${i}`} x={NET_POS[face][0] + (i % 3) * 10 + 0.5} y={NET_POS[face][1] + Math.floor(i / 3) * 10 + 0.5}
          width="9" height="9" rx="1.2" fill={NET_COLORS[c]} stroke="#1b1d1a" strokeWidth=".5" />
      )))}
    </svg>
  );
}

/** Grupo de botones donde solo uno está activo */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, ReactNode][]; onChange: (v: T) => void; label?: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([v, text]) => <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>{text}</button>)}
    </div>
  );
}

/** Pestañas con subrayado (subnavegación) */
export function SubNav<T extends string>({ value, items, onChange, hrefOf, label }: { value: T; items: [T, ReactNode][]; onChange?: (v: T) => void; hrefOf?: (v: T) => string; label: string }) {
  return (
    <div className="subnav" role="tablist" aria-label={label}>
      {items.map(([v, text]) => hrefOf
        ? <Link key={v} href={hrefOf(v)} role="tab" aria-selected={v === value} className="subnav-link">{text}</Link>
        : <button key={v} role="tab" aria-selected={v === value} onClick={() => onChange?.(v)}>{text}</button>)}
    </div>
  );
}

export function ProgressBar({ known, learning = 0, total, height }: { known: number; learning?: number; total: number; height?: number }) {
  return (
    <div className="progress" aria-hidden="true" style={height ? { height } : undefined}>
      <span className="p-known" style={{ width: `${(known / total) * 100}%` }} />
      <span className="p-learning" style={{ width: `${(learning / total) * 100}%` }} />
    </div>
  );
}

export function ProgressRing({ value, label, small }: { value: number; label: string; small?: boolean }) {
  return <div className={`home-ring${small ? ' sm' : ''}`} style={{ ['--p' as string]: Math.min(value, 1) }}><span>{label}</span></div>;
}

export const Pill = ({ ok, children }: { ok?: boolean; children: ReactNode }) => <span className={`pill${ok ? ' ok' : ''}`}>{children}</span>;

/** Un algoritmo, separado en bloques si así lo prefiere el usuario */
export function AlgText({ alg }: { alg: string }) {
  const { prefs } = useProgress();
  return <>{prefs.groupAlgs ? groupAlg(alg) : alg}</>;
}

/** Algoritmo en monoespaciada con enlace a la animación */
export function AlgLink({ alg }: { alg: string }) {
  return (
    <span className="ls-alg"><code><AlgText alg={alg} /></code>
      <a href={animationUrl(alg)} target="_blank" rel="noopener noreferrer" title="Ver animación">▶</a>
    </span>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return <header className="page-head"><h2 className="co-title">{title}</h2>{children && <p className="co-explain">{children}</p>}</header>;
}

export function Breadcrumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav className="crumbs" aria-label="Ruta">
      {items.map(([label, href], i) => (
        <span key={label} className="crumb">
          {i > 0 && <span aria-hidden="true">/</span>}
          {href ? <Link href={href}>{label}</Link> : <b>{label}</b>}
        </span>
      ))}
    </nav>
  );
}
