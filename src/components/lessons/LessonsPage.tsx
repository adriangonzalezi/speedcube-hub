'use client';
// Lecciones: índice por unidades (con el objetivo de hoy) y la lección abierta con su pregunta.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProgressRing } from '@/components/ui';
import { useToast } from '@/state/AppProviders';
import { LESSONS, UNITS, findLesson, unitOf, type Lesson } from './content';
import { useLessons } from './useLessons';

function LessonNav({ current }: { current: Lesson }) {
  const ls = useLessons();
  return (
    <aside className="ls-nav">
      <div className="ls-today">
        <ProgressRing small value={ls.doneToday / ls.goal} label={`${ls.doneToday}/${ls.goal}`} />
        <div><b>Hoy</b><small>{ls.doneToday >= ls.goal ? '¡Objetivo cumplido!' : `Objetivo: ${ls.goal} lecciones al día`}</small></div>
      </div>
      <p className="label">{ls.doneCount} de {ls.total} lecciones</p>
      <div className="progress ls-prog"><span className="p-known" style={{ width: `${(ls.doneCount / ls.total) * 100}%` }} /></div>
      {UNITS.map((u, ui) => {
        const lessons = LESSONS.filter(l => l.unit === u.id); const done = lessons.filter(l => ls.store.done[l.id]).length;
        const open = ls.store.open[u.id] ?? u.id === current.unit;
        return (
          <details key={u.id} className="ls-unit" open={open} onToggle={e => { const o = (e.currentTarget as HTMLDetailsElement).open; if (o !== open) ls.setOpen(u.id, o); }}>
            <summary><span><b>{ui + 1}. {u.title}</b><small>{done}/{lessons.length}</small></span></summary>
            <ol>{lessons.map(l => (
              <li key={l.id}>
                <Link href={`/lecciones/${l.id}`} className={`${l.id === current.id ? 'cur' : ''} ${ls.store.done[l.id] ? 'done' : ''}`}>
                  <span className="ls-n">{ls.store.done[l.id] ? '✓' : LESSONS.indexOf(l) + 1}</span>
                  <span><b>{l.title}</b><small>{l.minutes} min</small></span>
                </Link>
              </li>
            ))}</ol>
          </details>
        );
      })}
    </aside>
  );
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const ls = useLessons();
  const toast = useToast();
  const router = useRouter();
  const idx = LESSONS.indexOf(lesson); const next = LESSONS[idx + 1]; const unit = unitOf(lesson);
  const ans = ls.store.quiz[lesson.id]; const q = lesson.quiz;
  const done = !!ls.store.done[lesson.id];
  const complete = () => {
    ls.complete(lesson.id);
    toast(ls.doneToday + 1 === ls.goal ? '¡Objetivo de hoy cumplido!' : '¡Lección completada!');
    if (next) router.push(`/lecciones/${next.id}`);
  };
  return (
    <article className="ls-body">
      <p className="label">Unidad {UNITS.indexOf(unit) + 1} · {unit.title} · Lección {idx + 1} de {LESSONS.length} · {lesson.minutes} min</p>
      <h2 className="co-title">{lesson.title}</h2>
      <div className="ls-text">{lesson.body()}</div>
      <div className="ls-quiz">
        <h3 className="tm-h">Comprueba lo aprendido</h3>
        <div className="ls-q">
          <p>{q.q}</p>
          <div className="ls-opts">
            {q.options.map((o, oi) => (
              <button key={o} className={`btn ${ans !== undefined ? (oi === q.answer ? 'right' : oi === ans ? 'wrong' : '') : ''}`} disabled={ans !== undefined} onClick={() => ls.answer(lesson.id, oi)}>{o}</button>
            ))}
          </div>
          {ans !== undefined && <p className="ls-verdict">{ans === q.answer ? '¡Correcto!' : 'Casi. Repasa la lección: la respuesta correcta está marcada en verde.'}</p>}
        </div>
      </div>
      <div className="train-buttons">
        {done ? <>
          <span className="pill ok">✓ Completada</span>
          {next && <Link className="btn primary" href={`/lecciones/${next.id}`}>Siguiente: {next.title} →</Link>}
        </> : <button className="btn primary" onClick={complete}>{next ? 'Completar y seguir →' : 'Completar'}</button>}
        {lesson.cta?.map(([label, href]) => <Link key={href} className="btn" href={href}>{label}</Link>)}
      </div>
    </article>
  );
}

/** Sin id: abre la primera lección pendiente */
export function LessonsPage({ id }: { id?: string }) {
  const ls = useLessons();
  const router = useRouter();
  const lesson = (id && findLesson(id)) || ls.firstPending || LESSONS[0];
  useEffect(() => { if (!id) router.replace(`/lecciones/${lesson.id}`); }, [id, lesson.id, router]);
  return (
    <div className="ls-grid">
      <LessonNav current={lesson} />
      <LessonView key={lesson.id} lesson={lesson} />
    </div>
  );
}
