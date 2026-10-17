'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { CubeNet } from '@/components/ui';
import { fromScramble, solver } from '@/lib/cube';
import { scrambleKindLabel } from '@/lib/cube/scramble';
import { days, longDate, shiftDay } from '@/lib/dates';
import { effective, formatTime } from '@/lib/timer/stats';
import { useTimerSpecial, useToast } from '@/state/AppProviders';
import { formatResult, saveDailyResult, useDaily, useDailyScramble } from './useDaily';

function nextChallengeIn() {
  const now = new Date(); const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const m = Math.round((+tomorrow - +now) / 60000); return `${Math.floor(m / 60)} h ${m % 60} min`;
}

/** Calendario de las últimas 5 semanas */
function DailyCalendar({ results, today }: { results: ReturnType<typeof useDaily>['store']['results']; today: string }) {
  const first = shiftDay(today, -34);
  return (
    <div className="tm-panel">
      <h3 className="tm-h">Últimas 5 semanas</h3>
      <div className="dl-cal">
        {Array.from({ length: 35 }, (_, i) => shiftDay(first, i)).map(d => {
          const r = results[d];
          return <span key={d} className={`${r ? (r.p === 'DNF' ? 'dnf' : 'ok') : ''} ${d === today ? 'today' : ''}`} title={`${longDate(d)}${r ? ` · ${formatResult(r)}` : ''}`} />;
        })}
      </div>
      <p className="muted dl-legend"><i className="ok" /> hecho <i className="dnf" /> DNF <i /> sin hacer</p>
    </div>
  );
}

export function DailyChallenge() {
  const daily = useDaily();
  const scramble = useDailyScramble(daily.today);
  const { start } = useTimerSpecial();
  const router = useRouter();
  const toast = useToast();
  const r = daily.result;
  const guidedMoves = useMemo(() => (scramble && r ? solver.solveAll(fromScramble(scramble.text)).reduce((a, o) => a + o.moves, 0) : 0), [scramble, r]);
  const history = Object.entries(daily.store.results).sort((a, b) => b[0].localeCompare(a[0]));
  const ok = history.map(([, x]) => effective(x)).filter(v => v !== Infinity);

  const begin = () => {
    if (!scramble) return;
    const day = daily.today;
    start({
      scramble: scramble.text, label: 'Reto diario · un solo intento', phases: 1, insp: true,
      banner: <><b>Reto diario</b> <span className="muted">Un solo intento con inspección WCA. Pulsa espacio para empezar la inspección.</span></>,
      onDone: solve => { saveDailyResult(day, { t: solve.t, p: solve.p, d: solve.d }); setTimeout(() => router.push('/reto-diario'), 1500); },
    });
    router.push('/cronometro');
  };
  const share = async () => {
    const txt = `Cubo Algs · Reto diario ${daily.today}\n⏱ ${formatResult(r!)} · racha de ${days(daily.streak)}`;
    try { await navigator.clipboard.writeText(txt); toast('Resultado copiado'); } catch { toast(txt); }
  };

  return (
    <section>
      <div className="dl-head">
        <div><h2 className="co-title">Reto diario</h2><p className="co-explain">{longDate(daily.today)} · la misma mezcla para todo el mundo · un solo intento</p></div>
        <div className="dl-streak"><span className="dl-fire">{daily.streak}</span><span>{daily.streak === 1 ? 'día seguido' : 'días seguidos'}</span></div>
      </div>
      <div className="dl-main">
        {!scramble ? <p className="muted">Generando la mezcla oficial de hoy…</p> : <>
          <div className="tm-scramble">
            <p className="tm-scr-text">{scramble.text}</p>
            <div className="tm-scr-tools"><span className="tm-scr-kind">{scrambleKindLabel(scramble.kind)} · blanco arriba, verde delante</span></div>
          </div>
          <div className="dl-body">
            <div className="tm-net-wrap"><CubeNet alg={scramble.text} /></div>
            <div className="dl-action">
              {r ? <>
                <p className="label">Tu tiempo de hoy</p>
                <p className="dl-time">{formatResult(r)}</p>
                <p className="muted">Hecho a las {new Date(r.d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}. El siguiente reto llega en {nextChallengeIn()}.</p>
                <p className="dl-guided">La resolución guiada lo resuelve en <b>{guidedMoves} movimientos</b> con CFOP.</p>
                <div className="train-buttons">
                  <Link className="btn primary" href={`/resolucion-guiada?${new URLSearchParams({ mezcla: scramble.text })}`}>Ver la resolución guiada</Link>
                  <button className="btn" onClick={share}>Copiar resultado</button>
                </div>
              </> : <>
                <p className="co-explain">Tienes <b>un intento</b> con inspección WCA de 15 s. Mezcla tu cubo con el blanco arriba y el verde delante, y cuando estés listo empieza.</p>
                <div className="train-buttons"><button className="btn primary" onClick={begin}>Empezar el reto</button></div>
              </>}
            </div>
          </div>
        </>}
      </div>
      <div className="dl-cols">
        <DailyCalendar results={daily.store.results} today={daily.today} />
        <div className="tm-panel">
          <h3 className="tm-h">Tus números</h3>
          <table className="tm-stats"><tbody>
            <tr><th>Retos hechos</th><td>{history.length}</td></tr>
            <tr><th>Racha actual</th><td>{days(daily.streak)}</td></tr>
            <tr><th>Mejor racha</th><td>{days(daily.bestStreak)}</td></tr>
            <tr><th>Mejor tiempo</th><td>{ok.length ? formatTime(Math.min(...ok)) : '–'}</td></tr>
            <tr><th>Media</th><td>{ok.length ? formatTime(ok.reduce((a, b) => a + b, 0) / ok.length) : '–'}</td></tr>
          </tbody></table>
        </div>
      </div>
      <div className="tm-panel dl-hist">
        <h3 className="tm-h">Historial</h3>
        {history.length ? <table className="tm-stats"><tbody>{history.slice(0, 10).map(([d, x]) => <tr key={d}><th>{longDate(d)}</th><td>{formatResult(x)}</td></tr>)}</tbody></table>
          : <p className="muted">Aún no has hecho ningún reto. ¡Hoy es buen día para empezar!</p>}
      </div>
    </section>
  );
}
