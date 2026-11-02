'use client';
import { Fragment, useState } from 'react';
import { PHASES, delta, formatDelta, formatSolve, formatTime, phaseDurations, type Penalty, type Rolling, type Solve } from '@/lib/timer/stats';

function DeltaCell({ d }: { d: number | null }) {
  return <td className={`tm-dcell ${d === null ? '' : d < 0 ? 'faster' : d > 0 ? 'slower' : ''}`}>{d === null ? '' : formatDelta(d)}</td>;
}

/** Lista de tiempos (el más reciente arriba). Al pulsar uno se ve su mezcla y se puede corregir. */
export function SolveList({ solves, roll, onPenalty, onDelete }: { solves: Solve[]; roll: Rolling; onPenalty: (i: number, p: Penalty) => void; onDelete: (i: number) => void }) {
  const [selected, setSelected] = useState(-1);
  return (
    <div className="tm-panel tm-list-panel">
      <h3 className="tm-h">Tiempos {solves.length > 0 && <small>({solves.length})</small>}</h3>
      <div className="tm-list-wrap">
        <table className="tm-list"><tbody>
          {!solves.length ? <tr><td className="muted">Tus tiempos aparecerán aquí.</td></tr> : <>
            <tr><th>#</th><th>Tiempo</th><th>Dif.</th><th>Ao5</th><th>Ao12</th></tr>
            {solves.map((_, k) => {
              const i = solves.length - 1 - k; const s = solves[i];
              return (
                <Fragment key={s.d + '-' + i}>
                  <tr data-i={i} className={i === selected ? 'sel' : ''} onClick={() => setSelected(i === selected ? -1 : i)}>
                    <td className="n">{i + 1}</td><td>{formatSolve(s)}</td><DeltaCell d={delta(s, solves[i - 1])} /><td>{formatTime(roll.ao5[i])}</td><td>{formatTime(roll.ao12[i])}</td>
                  </tr>
                  {i === selected && (
                    <tr className="detail"><td colSpan={5}>
                      <p className="alg">{s.s}</p>
                      {s.sp && <p className="muted">{PHASES[s.sp.length].map((n, j) => `${n} ${formatTime(phaseDurations(s.sp!)[j])}`).join(' · ')}</p>}
                      <p className="muted">{new Date(s.d).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      <span className="tm-actions">
                        {([[null, 'OK'], ['+2', '+2'], ['DNF', 'DNF']] as [Penalty, string][]).map(([p, l]) => <button key={l} className="tool" onClick={() => onPenalty(i, p)}>{l}</button>)}
                        <button className="tool danger" onClick={() => { onDelete(i); setSelected(-1); }}>Borrar</button>
                      </span>
                    </td></tr>
                  )}
                </Fragment>
              );
            })}
          </>}
        </tbody></table>
      </div>
    </div>
  );
}
