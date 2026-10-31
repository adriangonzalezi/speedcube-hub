// Dibujos del cubo en SVG, generados a partir del simulador (sin depender de servicios externos).
import { useId, useMemo } from 'react';
import type { AlgCase, CaseSet } from '@/data/algorithms';
import { caseDiagram, stateDiagram, type Auf, type Diagram } from '@/lib/cube/diagram';
import { SOLVED, apply, type CubeState } from '@/lib/cube/state';

const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(' ');

/** Pinta un Diagram (pegatinas, silueta y flechas) */
export function DiagramSvg({ d, size = 96, label }: { d: Diagram; size?: number; label: string }) {
  const marker = useId().replace(/:/g, '');
  const iso = d.viewBox.startsWith('-');
  const stroke = iso ? 0.06 : 1.2;
  return (
    <svg className="cube-svg" viewBox={d.viewBox} width={size} height={size} role="img" aria-label={label}>
      {d.outline && <polygon points={pts(d.outline)} fill="#141414" />}
      {d.polygons.map((p, i) => <polygon key={i} points={pts(p.points)} fill={p.fill} stroke="#141414" strokeWidth={stroke} strokeLinejoin="round" />)}
      {d.arrows.length > 0 && <>
        <defs>
          <marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#141414" />
          </marker>
        </defs>
        {d.arrows.map((a, i) => {
          // acortar un poco cada flecha para que no tape el centro de las pegatinas
          const [x1, y1] = a.from, [x2, y2] = a.to; const len = Math.hypot(x2 - x1, y2 - y1) || 1; const k = 7 / len;
          return <line key={i} x1={x1 + (x2 - x1) * k} y1={y1 + (y2 - y1) * k} x2={x2 - (x2 - x1) * k} y2={y2 - (y2 - y1) * k}
            stroke="#141414" strokeWidth={2.6} strokeLinecap="round" markerEnd={`url(#${marker})`} />;
        })}
      </>}
    </svg>
  );
}

/** Imagen de un caso (OLL y PLL desde arriba, F2L en 3D) */
export function CaseDiagram({ c, set, auf, iso, size }: { c: AlgCase; set: CaseSet; auf?: Auf; iso?: boolean; size?: number }) {
  const d = useMemo(() => caseDiagram(c, set, { auf, iso }), [c, set, auf, iso]);
  return <DiagramSvg d={d} size={size} label={`Caso ${c.id}`} />;
}

/** Estado del cubo en 3D con los colores WCA (blanco arriba, verde delante) */
export function StateDiagram({ state, back, size, label = 'Estado del cubo' }: { state: CubeState; back?: boolean; size?: number; label?: string }) {
  const d = useMemo(() => stateDiagram(state, back), [state, back]);
  return <DiagramSvg d={d} size={size} label={label} />;
}

/** Cubo resuelto tras unos movimientos (para las lecciones de notación) */
export function MovesDiagram({ alg, size }: { alg: string; size?: number }) {
  const state = useMemo(() => apply(SOLVED, alg), [alg]);
  return <StateDiagram state={state} size={size} label={alg ? `Cubo tras ${alg}` : 'Cubo resuelto'} />;
}

/** Cubo NxN resuelto (para elegir cubo): rejilla de n×n en tres caras */
export function PuzzleDiagram({ n, size = 120 }: { n: number; size?: number }) {
  const P = (x: number, y: number, z: number): [number, number] => [(x - z) * 0.866, -y + (x + z) * 0.5];
  const faces: { color: string; at: (a: number, b: number) => [number, number, number] }[] = [
    { color: '#ffffff', at: (a, b) => [a, 1.5, b] }, { color: '#009b48', at: (a, b) => [a, -b, 1.5] }, { color: '#b71234', at: (a, b) => [1.5, -b, -a] },
  ];
  const step = 3 / n, h = step * 0.44;
  const polys: [string, string][] = [];
  for (const f of faces) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const a = -1.5 + step * (i + 0.5), b = -1.5 + step * (j + 0.5);
    const corners = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([da, db]) => P(...f.at(a + da, b + db)));
    polys.push([pts(corners), f.color]);
  }
  const e = 1.53; const outline = [[-e, e, -e], [e, e, -e], [e, -e, -e], [e, -e, e], [-e, -e, e], [-e, e, e]].map(([x, y, z]) => P(x, y, z));
  return (
    <svg className="cube-svg" viewBox="-2.8 -3.25 5.6 6.5" width={size} height={size} role="img" aria-label={`Cubo ${n}x${n}`}>
      <polygon points={pts(outline)} fill="#141414" />
      {polys.map(([p, c], i) => <polygon key={i} points={p} fill={c} stroke="#141414" strokeWidth={0.04} />)}
    </svg>
  );
}
