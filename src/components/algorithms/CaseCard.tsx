'use client';
// Ficha de un caso: imagen, estado, algoritmos (elegir el tuyo, copiar, animación) y algoritmo propio.
import { useState } from 'react';
import type { AlgCase, CaseSet } from '@/data/algorithms';
import { CaseDiagram } from '@/components/cube/CubeDiagram';
import { moveCount } from '@/lib/cube/notation';
import { animationUrl } from '@/lib/visualcube';
import { useToast } from '@/state/AppProviders';
import { STATUS_LABEL, type Progress } from '@/state/progress';

const LABELS = ['Principal', 'Alternativa', 'Alternativa 2'];

export function CaseCard({ c, set, progress }: { c: AlgCase; set: CaseSet; progress: Progress }) {
  const toast = useToast();
  const status = progress.statusOf(c);
  const algs = progress.algsOf(c);
  const mine = progress.myIndex(c);
  const custom = progress.custom[c.id] ?? '';
  const [draft, setDraft] = useState(custom);

  const copy = async (alg: string) => {
    try { await navigator.clipboard.writeText(alg); toast('Algoritmo copiado'); } catch { toast('No se pudo copiar'); }
  };
  const saveCustom = () => {
    const v = draft.trim().replace(/\s+/g, ' ');
    if (v === custom) return;
    progress.setCustom(c, v);
    if (v) toast('Guardado como tu algoritmo');
  };

  return (
    <article className="card" data-status={status}>
      <div className="img"><CaseDiagram c={c} set={set} /></div>
      <div className="head">
        <h3>{c.id} {c.nick && <span className="nick">{c.nick}</span>}</h3>
        <div className="meta"><span>{c.group}</span><span>Prob. {c.prob}</span></div>
        <button className="status-btn" data-status={status} title="Cambiar estado"
          onClick={() => toast(`${c.id}: ${STATUS_LABEL[progress.cycleStatus(c.id)]}`)}>{STATUS_LABEL[status]}</button>
      </div>
      <div className="algs">
        {algs.map((a, i) => {
          const isCustom = !!custom && i === algs.length - 1;
          return (
            <div key={i} className={`alg-row${i === mine ? ' mine' : ''}`} role="button" tabIndex={0} title="Usar este como mi algoritmo"
              onClick={() => progress.pickAlg(c.id, i)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); progress.pickAlg(c.id, i); } }}>
              <div>
                <span className="alg-label">{isCustom ? 'Mío' : LABELS[i] ?? 'Alternativa'}{i === mine ? ' · elegido' : ''} · {moveCount(a)} mov.</span>
                <p className="alg">{a}</p>
              </div>
              <span className="alg-tools" onClick={e => e.stopPropagation()}>
                <button className="tool" title="Copiar" aria-label="Copiar algoritmo" onClick={() => copy(a)}>⧉</button>
                <a className="tool" href={animationUrl(a)} target="_blank" rel="noopener noreferrer" title="Ver animación" aria-label="Ver animación">▶</a>
              </span>
            </div>
          );
        })}
      </div>
      <div className="custom">
        <input placeholder="Añadir mi propio algoritmo…" value={draft} aria-label={`Mi algoritmo para ${c.id}`}
          onChange={e => setDraft(e.target.value)} onBlur={saveCustom} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
      </div>
    </article>
  );
}
