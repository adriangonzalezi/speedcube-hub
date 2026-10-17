'use client';
// Gráfica de evolución: puntos = tiempos individuales, líneas = Ao5 y Ao12. Un solo eje en segundos.
import { useEffect, useRef, useState } from 'react';
import { effective, formatSolve, formatTime, type Rolling, type Solve } from '@/lib/timer/stats';

function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}

export function EvolutionChart({ solves, roll }: { solves: Solve[]; roll: Rolling }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width)); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = solves.length;
  const singles = solves.map(effective);
  const points = singles.map((v, i) => ({ i, v })).filter(p => p.v !== Infinity);
  const finite = (arr: (number | undefined)[]) => arr.filter((v): v is number => v !== undefined && v !== Infinity);
  let content = <p className="muted tm-empty">Haz al menos 2 tiempos para ver tu evolución.</p>;

  if (points.length >= 2 && width) {
    const W = width, H = 240, ml = 44, mr = 12, mt = 10, mb = 26;
    const vals = [...points.map(p => p.v), ...finite(roll.ao5), ...finite(roll.ao12)];
    let lo = Math.min(...vals) / 1000, hi = Math.max(...vals) / 1000;
    const step = niceStep((hi - lo) / 4 || 1);
    lo = Math.max(0, Math.floor(lo / step) * step); hi = Math.ceil(hi / step) * step; if (hi === lo) hi = lo + step;
    const x = (i: number) => ml + (n === 1 ? 0 : (i / (n - 1)) * (W - ml - mr));
    const y = (v: number) => mt + (1 - (v / 1000 - lo) / (hi - lo)) * (H - mt - mb);
    const ticks: number[] = []; for (let t = lo; t <= hi + 1e-9; t += step) ticks.push(t);
    const xStep = Math.max(1, Math.round(niceStep(n / 6)));
    const line = (arr: (number | undefined)[]) => {
      let d = '', pen = false;
      arr.forEach((v, i) => { if (v === undefined || v === Infinity) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)} `; pen = true; });
      return d;
    };
    const onMove = (e: React.PointerEvent<SVGRectElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      setHover(Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1)))));
    };
    content = (
      <>
        <svg width={W} height={H} role="img" aria-label="Evolución de tiempos">
          {ticks.map(t => (
            <g key={t}><line className="grid" x1={ml} x2={W - mr} y1={y(t * 1000)} y2={y(t * 1000)} />
              <text className="tick" x={ml - 6} y={y(t * 1000) + 4} textAnchor="end">{+t.toFixed(2)}</text></g>
          ))}
          {Array.from({ length: Math.ceil(n / xStep) }, (_, k) => k * xStep).map(i => <text key={i} className="tick" x={x(i)} y={H - 8} textAnchor="middle">{i + 1}</text>)}
          {points.map(p => <circle key={p.i} className="pt" cx={x(p.i)} cy={y(p.v)} r={n > 150 ? 2 : 3} />)}
          <path className="ln ao5" d={line(roll.ao5)} /><path className="ln ao12" d={line(roll.ao12)} />
          {hover !== null && <line className="cross" x1={x(hover)} x2={x(hover)} y1={mt} y2={H - mb} />}
          <rect x={ml} y={mt} width={W - ml - mr} height={H - mt - mb} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
        </svg>
        {hover !== null && (
          <div className="tm-tip" style={{ left: x(hover) + 172 > W ? x(hover) - 172 : x(hover) + 12, top: 8 }}>
            <b>Solve {hover + 1}</b><span>{formatSolve(solves[hover])}</span>
            <span><i className="lg-line lg-ao5" />Ao5 {formatTime(roll.ao5[hover])}</span>
            <span><i className="lg-line lg-ao12" />Ao12 {formatTime(roll.ao12[hover])}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="tm-panel tm-chart-panel">
      <div className="tm-chart-head">
        <h3 className="tm-h">Evolución</h3>
        <div className="tm-legend"><span><i className="lg-dot" />Tiempo</span><span><i className="lg-line lg-ao5" />Ao5</span><span><i className="lg-line lg-ao12" />Ao12</span></div>
      </div>
      <div className="tm-chart" ref={box}>{content}</div>
    </div>
  );
}
