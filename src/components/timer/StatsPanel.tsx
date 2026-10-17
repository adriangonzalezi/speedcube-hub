'use client';
import Link from 'next/link';
import { AVERAGES, PHASES, PHASE_REFERENCE, bestOf, effective, formatTime, phaseSummary, type Rolling, type Solve } from '@/lib/timer/stats';

/** Actual y mejor de cada media, y media de la sesión */
export function StatsPanel({ solves, roll, phases }: { solves: Solve[]; roll: Rolling; phases: number }) {
  const singles = solves.map(effective);
  const n = solves.length;
  const rows: [string, number | undefined, number | undefined][] = [
    ['Tiempo', singles[n - 1], bestOf(singles)],
    ...AVERAGES.map(k => [k.label, roll[k.key][n - 1], bestOf(roll[k.key])] as [string, number | undefined, number | undefined]),
  ];
  const ok = singles.filter(v => v !== Infinity);
  const mean = ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : undefined;
  return (
    <div className="tm-panel">
      <h3 className="tm-h">Estadísticas</h3>
      <table className="tm-stats">
        <tbody>
          <tr><th /><th>Actual</th><th>Mejor</th></tr>
          {rows.map(([label, cur, best]) => <tr key={label}><th>{label}</th><td>{formatTime(cur)}</td><td className="best">{formatTime(best)}</td></tr>)}
        </tbody>
      </table>
      <p className="tm-mean">{n ? `Media de la sesión: ${formatTime(mean)} · ${ok.length}/${n} resueltos` : 'Aún no hay tiempos en esta sesión.'}</p>
      <PhaseStats solves={solves} phases={phases} />
    </div>
  );
}

const PRACTICE_FOR: Record<string, [string, string]> = {
  Cruz: ['/practica/cruz', 'Practicar la cruz'], F2L: ['/practica/ultima-pareja', 'Practicar la última pareja'],
  OLL: ['/practica/casos', 'Cronometrar casos de OLL'], PLL: ['/practica/casos', 'Cronometrar casos de PLL'],
  'Última capa': ['/practica/casos', 'Cronometrar casos OLL y PLL'],
};

/** Media por fase de los últimos 12 tiempos con fases, y la fase que más te frena */
function PhaseStats({ solves, phases }: { solves: Solve[]; phases: number }) {
  if (phases < 2) return null;
  const sum = phaseSummary(solves, phases);
  const names = PHASES[phases];
  if (!sum) return <div className="tm-phase-stats"><p className="muted tm-ph-empty">Haz tiempos con {phases} fases y aquí verás cuánto tardas en cada una.</p></div>;
  const worst = names[sum.worst]; const [href, label] = PRACTICE_FOR[worst];
  return (
    <div className="tm-phase-stats">
      <h4 className="tm-ph-title">Por fases <small>(media de {sum.count})</small></h4>
      <div className="tm-ph-bar">{sum.pct.map((p, i) => <span key={names[i]} style={{ flex: p }} title={names[i]}>{names[i]}</span>)}</div>
      <table className="tm-stats"><tbody>
        {names.map((name, i) => <tr key={name}><th>{name}</th><td>{formatTime(sum.means[i])}</td><td>{Math.round(sum.pct[i] * 100)} %</td></tr>)}
      </tbody></table>
      {sum.worstDeviation > 0.03
        ? <p className="tm-ph-tip">Tu <b>{worst}</b> se lleva el {Math.round(sum.pct[sum.worst] * 100)} % del tiempo; lo habitual en CFOP es ~{Math.round(PHASE_REFERENCE[phases][sum.worst] * 100)} %. <Link href={href}>{label} →</Link></p>
        : <p className="tm-ph-tip">Tu reparto entre fases está equilibrado.</p>}
    </div>
  );
}
