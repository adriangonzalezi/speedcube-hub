'use client';
// Página de inicio: lo que te toca hoy (reto, lección, repaso) y un resumen de tu progreso.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ALGORITHMS, SETS } from '@/data/algorithms';
import { useDaily, formatResult } from '@/components/daily/useDaily';
import { useLessons } from '@/components/lessons/useLessons';
import { Pill, ProgressBar, ProgressRing } from '@/components/ui';
import { bestOf, effective, formatTime } from '@/lib/timer/stats';
import { useProgress } from '@/state/progress';
import { useTimerData } from '@/state/timer';

function greeting(h: number) {
  return h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
}

export function HomeDashboard() {
  const daily = useDaily();
  const lessons = useLessons();
  const progress = useProgress();
  const timer = useTimerData();
  // la hora y la fecha solo en el navegador, para no desajustar el HTML del servidor
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const due = progress.dueCount;
  const tasks = [!!daily.result, lessons.doneToday >= lessons.goal, due === 0];
  const doneTasks = tasks.filter(Boolean).length;
  const next = lessons.summary().next;
  const n = timer.solves.length;

  return (
    <section>
      <header className="home-hero">
        <div>
          <p className="label">{now?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h2 className="home-title">{now ? greeting(now.getHours()) : 'Hola'}</h2>
          <p className="co-explain">Hoy llevas <b>{doneTasks} de 3</b> tareas: el reto diario, {lessons.goal} lecciones y tu repaso.</p>
        </div>
        <ProgressRing value={doneTasks / 3} label={`${doneTasks}/3`} />
      </header>

      <h3 className="home-h">Para hoy</h3>
      <div className="home-grid">
        <article className="home-card">
          <div className="home-card-head"><h4>Reto diario</h4><Pill ok={!!daily.result}>{daily.result ? `✓ ${formatResult(daily.result)}` : 'Pendiente'}</Pill></div>
          <p>{daily.result ? <>Hoy hiciste <b>{formatResult(daily.result)}</b>.</> : 'Una mezcla oficial, la misma para todo el mundo. Un solo intento.'}</p>
          <p className="muted">Racha: <b>{daily.streak} {daily.streak === 1 ? 'día' : 'días'}</b></p>
          <Link className={`btn${daily.result ? '' : ' primary'}`} href="/reto-diario">{daily.result ? 'Ver resultado' : 'Hacer el reto'}</Link>
        </article>
        <article className="home-card">
          <div className="home-card-head"><h4>Lección del día</h4><Pill ok={lessons.doneToday >= lessons.goal}>{lessons.doneToday >= lessons.goal ? `✓ ${lessons.doneToday} hoy` : `${lessons.doneToday}/${lessons.goal} hoy`}</Pill></div>
          {next ? <>
            <p className="home-lesson"><small>{next.unit} · {next.minutes} min</small><b>{next.title}</b></p>
            <p className="muted">{lessons.doneCount} de {lessons.total} lecciones completadas</p>
            <Link className={`btn${lessons.doneToday >= lessons.goal ? '' : ' primary'}`} href={`/lecciones/${next.id}`}>Empezar lección</Link>
          </> : <><p>¡Has completado todas las lecciones!</p><Link className="btn" href="/lecciones">Repasar lecciones</Link></>}
        </article>
        <article className="home-card">
          <div className="home-card-head"><h4>Repaso de algoritmos</h4><Pill ok={due === 0}>{due === 0 ? '✓ Al día' : `${due} pendientes`}</Pill></div>
          <p>{due ? <>Te tocan <b>{due} casos</b> del repaso espaciado.</> : 'No tienes repasos pendientes. Marca casos como «En práctica» para añadirlos.'}</p>
          <Link className={`btn${due ? ' primary' : ''}`} href="/practica/tarjetas" onClick={() => { if (due) progress.setPrefs({ trainPool: 'due', trainSet: 'all' }); }}>{due ? 'Repasar ahora' : 'Ir a Práctica'}</Link>
        </article>
      </div>

      <h3 className="home-h">Tu progreso</h3>
      <div className="home-grid">
        <article className="home-card">
          <div className="home-card-head"><h4>Cronómetro</h4><span className="muted">{timer.session.name}</span></div>
          <table className="tm-stats home-stats"><tbody>
            <tr><th>Tiempos</th><td>{n}</td></tr>
            <tr><th>Mejor</th><td>{formatTime(bestOf(timer.solves.map(effective)))}</td></tr>
            <tr><th>Ao5 actual</th><td>{formatTime(timer.roll.ao5[n - 1])}</td></tr>
            <tr><th>Ao12 actual</th><td>{formatTime(timer.roll.ao12[n - 1])}</td></tr>
          </tbody></table>
          <Link className="btn" href="/cronometro">Abrir el cronómetro</Link>
        </article>
        <article className="home-card">
          <div className="home-card-head"><h4>Algoritmos 3x3</h4></div>
          <div className="home-sets">
            {SETS.map(s => {
              const c = progress.counts(s, ALGORITHMS[s]);
              return (
                <Link key={s} className="home-set" href={`/algoritmos/3x3/${s}`}>
                  <span><b>{s.toUpperCase()}</b><small>{c.known}/{c.total} dominados</small></span>
                  <ProgressBar known={c.known} learning={c.learning} total={c.total} />
                </Link>
              );
            })}
          </div>
          <Link className="btn" href="/algoritmos/3x3">Ver algoritmos</Link>
        </article>
        <article className="home-card">
          <div className="home-card-head"><h4>Resolución guiada</h4></div>
          <p>Pega una mezcla y te proponemos cómo resolverla paso a paso, enseñando qué deja cada opción.</p>
          <Link className="btn" href="/resolucion-guiada">Analizar una mezcla</Link>
        </article>
      </div>
    </section>
  );
}
