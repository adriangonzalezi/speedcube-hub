'use client';
// Zona del tiempo: muestra el cronómetro, las fases y las acciones sobre el último tiempo.
import { PHASES, delta, formatDelta, formatSolve, formatTime, phaseDurations, type Penalty, type Solve } from '@/lib/timer/stats';
import { useStackmat } from './useStackmat';

interface Props {
  enabled: boolean;
  inspection: boolean;
  voice: boolean;
  phases: number;
  last: Solve | null;
  /** Tiempo anterior, para enseñar la diferencia (+5.00 / −2.00) */
  prev?: Solve | null;
  onFinish: (ms: number, penalty: Penalty, splits: number[]) => void;
  onLastAction?: (action: Penalty | 'delete') => void;
}

function Splits({ sp, live, count }: { sp: number[]; live: boolean; count: number }) {
  const names = PHASES[count] ?? [];
  if (count < 2) return null;
  const durations = phaseDurations(sp);
  return (
    <div className="tm-splits">
      {names.map((name, i) => {
        const has = i < sp.length; const cur = live && i === sp.length - 1;
        return <span key={name} className={cur ? 'cur' : has ? '' : 'todo'}><b>{name}</b> {has ? formatTime(durations[i]) : '–'}</span>;
      })}
    </div>
  );
}

export function TimerStage({ enabled, inspection, voice, phases, last, prev, onFinish, onLastAction }: Props) {
  const timer = useStackmat({ enabled, inspection, voice, phases, onFinish });
  const { phase, elapsed, inspLeft, splits } = timer;

  let display: string;
  if (phase === 'run') display = formatTime(elapsed);
  else if (phase === 'inspect') display = inspLeft > 0 ? String(Math.ceil(inspLeft / 1000)) : '+2';
  else if (phase === 'hold' || phase === 'ready' || phase === 'pre') display = '0.00';
  else display = last ? formatSolve(last) : '0.00';
  const stageClass = phase === 'pre' ? 'idle' : phase;

  return (
    <div className={`tm-stage ${stageClass}`} tabIndex={0} aria-label="Cronómetro. Mantén pulsado espacio y suelta para empezar."
      onPointerDown={e => { if ((e.target as HTMLElement).closest('button') || phase === 'run') return; e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); timer.press(); }}
      onPointerUp={e => { if (!(e.target as HTMLElement).closest('button')) timer.release(); }}
      onPointerCancel={() => { if (phase === 'hold' || phase === 'ready') timer.cancel(); }}>
      <div className="tm-time">{display}</div>
      {phase === 'idle' && (() => {
        const d = delta(last, prev);
        return d === null ? null : <div className={`tm-delta ${d < 0 ? 'faster' : d > 0 ? 'slower' : ''}`} title="Diferencia con el tiempo anterior">{formatDelta(d)}</div>;
      })()}
      {phase === 'run' ? <Splits sp={[...splits, elapsed]} live count={phases} />
        : phase === 'idle' && last?.sp ? <Splits sp={last.sp} live={false} count={last.sp.length} /> : null}
      {phase === 'idle' && !last && <p className="tm-hint">Mantén pulsado <kbd>Espacio</kbd> y suelta para empezar · en el móvil, mantén pulsada esta zona</p>}
      {phase === 'idle' && last && onLastAction && (
        <div className="tm-last">
          {([[null, 'OK'], ['+2', '+2'], ['DNF', 'DNF']] as [Penalty, string][]).map(([p, l]) => (
            <button key={l} className="tool" aria-pressed={last.p === p} onClick={() => onLastAction(p)}>{l}</button>
          ))}
          <button className="tool" onClick={() => onLastAction('delete')}>Borrar</button>
        </div>
      )}
    </div>
  );
}
