'use client';
// Lista de casos de un conjunto con buscador, filtros por estado y forma, y orden.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ALGORITHMS, SETS, groupsOf, type AlgCase, type CaseSet } from '@/data/algorithms';
import { Breadcrumbs, ProgressBar, Segmented, SubNav } from '@/components/ui';
import { moveCount } from '@/lib/cube/notation';
import { useProgress, type SortKey, type Status, type UiPrefs } from '@/state/progress';
import { CaseCard } from './CaseCard';

const STATUS_FILTERS: [UiPrefs['status'], string][] = [['all', 'Todos'], ['new', 'Pendiente'], ['learning', 'En práctica'], ['known', 'Dominado']];
const SORTS: [SortKey, string][] = [['num', 'Orden: número'], ['group', 'Orden: grupo'], ['len', 'Orden: alg más corto'], ['status', 'Orden: estado']];
const STATUS_ORDER: Record<Status, number> = { learning: 0, new: 1, known: 2 };

export function CaseBrowser({ set }: { set: CaseSet }) {
  const progress = useProgress();
  const { prefs, setPrefs, statusOf, algsOf, myAlg } = progress;
  const [q, setQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const groups = groupsOf(set);
  const selected = prefs.groups[set];
  const cases = ALGORITHMS[set];

  // "/" enfoca el buscador; Escape lo vacía
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement)?.tagName)) { e.preventDefault(); searchRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, []);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase().replace(/\s+/g, ' ');
    const filtered = cases.filter(c => {
      if (prefs.status !== 'all' && statusOf(c) !== prefs.status) return false;
      if (selected.length && !selected.includes(c.group)) return false;
      if (!query) return true;
      if (/^\d+$/.test(query)) return String(c.num) === query;
      return [c.id, c.num, c.group, c.nick, ...algsOf(c)].join(' | ').toLowerCase().includes(query);
    });
    const sorters: Record<SortKey, (a: AlgCase, b: AlgCase) => number> = {
      num: () => 0,
      group: (a, b) => groups.indexOf(a.group) - groups.indexOf(b.group),
      len: (a, b) => moveCount(myAlg(a)) - moveCount(myAlg(b)),
      status: (a, b) => STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)],
    };
    return filtered.sort((a, b) => sorters[prefs.sort](a, b) || cases.indexOf(a) - cases.indexOf(b));
  }, [q, cases, prefs.status, prefs.sort, selected, statusOf, algsOf, myAlg, groups]);

  const c = progress.counts(set, cases);
  const toggleGroup = (g: string | null) => setPrefs({ groups: { ...prefs.groups, [set]: g === null ? [] : selected.includes(g) ? selected.filter(x => x !== g) : [...selected, g] } });

  return (
    <section>
      <Breadcrumbs items={[['Algoritmos', '/algoritmos'], ['3x3', '/algoritmos/3x3'], [set.toUpperCase()]]} />
      <SubNav label="Conjunto de algoritmos" value={set} hrefOf={s => `/algoritmos/3x3/${s}`}
        items={SETS.map(s => [s, <>{s.toUpperCase()} <small>{progress.counts(s, ALGORITHMS[s]).known}/{ALGORITHMS[s].length}</small></>])} />

      <div className="progress-row">
        <ProgressBar known={c.known} learning={c.learning} total={c.total} />
        <p className="progress-text"><b>{c.known}</b> de {c.total} dominados · <b>{c.learning}</b> en práctica · {c.total - c.known - c.learning} pendientes</p>
      </div>

      <div className="toolbar">
        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input ref={searchRef} type="search" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') { setQ(''); e.currentTarget.blur(); } }}
            placeholder="Busca por número, nombre, grupo o movimiento (p. ej. 27, sune, T, R U R')" autoComplete="off" />
          <kbd>/</kbd>
        </label>
        <Segmented label="Filtrar por estado" value={prefs.status} options={STATUS_FILTERS} onChange={status => setPrefs({ status })} />
        <label className="tm-opt" title="Separa los algoritmos en bloques fáciles de recordar: (R U R' U') (R' F R F')">
          <input type="checkbox" checked={prefs.groupAlgs} onChange={e => setPrefs({ groupAlgs: e.target.checked })} /> Bloques ( )
        </label>
        <select aria-label="Ordenar" value={prefs.sort} onChange={e => setPrefs({ sort: e.target.value as SortKey })}>
          {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>

      <div className="chips" aria-label="Filtrar por forma">
        <button className="chip" aria-pressed={!selected.length} onClick={() => toggleGroup(null)}>Todas las formas</button>
        {groups.map(g => (
          <button key={g} className="chip" aria-pressed={selected.includes(g)} onClick={() => toggleGroup(g)}>
            {g} <small>{cases.filter(x => x.group === g).length}</small>
          </button>
        ))}
      </div>

      <div className="grid">{list.map(x => <CaseCard key={x.id} c={x} set={set} progress={progress} />)}</div>
      {!list.length && <p className="empty">No hay casos con estos filtros. Prueba a quitar alguno.</p>}
    </section>
  );
}
