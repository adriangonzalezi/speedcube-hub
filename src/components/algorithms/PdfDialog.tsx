'use client';
// Diálogo de descarga: hojas completas ya hechas o un PDF a medida generado en el navegador.
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ALGORITHMS, SETS, isCaseSet, type CaseSet } from '@/data/algorithms';
import { downloadPdf } from '@/lib/pdf';
import { useToast } from '@/state/AppProviders';
import { STATUS_LABEL, useProgress } from '@/state/progress';

type Which = 'all' | 'notknown';

export function PdfDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const currentSet = pathname.split('/')[3];
  const hasCurrent = isCaseSet(currentSet ?? '');
  const [setChoice, setSetChoice] = useState<'current' | CaseSet | 'all'>('current');
  const [which, setWhich] = useState<Which>('all');
  const [withAlt, setWithAlt] = useState(true);
  const [mine, setMine] = useState(false);
  const [busy, setBusy] = useState(false);
  const progress = useProgress();
  const toast = useToast();

  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) { d.showModal(); if (!hasCurrent) setSetChoice('all'); }
    if (!open && d.open) d.close();
  }, [open, hasCurrent]);

  const generate = async () => {
    const sets: CaseSet[] = setChoice === 'current' ? (hasCurrent ? [currentSet as CaseSet] : SETS) : setChoice === 'all' ? SETS : [setChoice];
    const parts = sets.map(set => ({ set, cases: ALGORITHMS[set].filter(c => which === 'all' || progress.statusOf(c) !== 'known') })).filter(p => p.cases.length);
    if (!parts.length) { toast('No hay casos para exportar con esa selección'); return; }
    setBusy(true);
    try {
      await downloadPdf(parts, {
        withAlt, fileName: `cubo-algs-${parts.map(p => p.set.toUpperCase()).join('-')}${which === 'notknown' ? '-por-dominar' : ''}.pdf`,
        mainAlg: c => (mine ? progress.myAlg(c) : c.algs[0]),
        altAlg: (c, main) => progress.algsOf(c).find(a => a !== main),
        statusLabel: c => { const s = progress.statusOf(c); return s === 'new' ? null : STATUS_LABEL[s]; },
      });
      toast('PDF descargado'); onClose();
    } catch { toast('No se pudo generar el PDF. Usa las hojas completas.'); }
    setBusy(false);
  };

  return (
    <dialog ref={ref} onClose={onClose} onCancel={onClose}>
      <form method="dialog" onSubmit={e => { e.preventDefault(); generate(); }}>
        <h2>Descargar PDF</h2>
        <div className="ready">
          <span className="label">Hojas completas</span>
          <div className="ready-links">
            {SETS.map(s => <a key={s} className="btn" href={`/pdf/${s.toUpperCase()}.pdf`} download>{s.toUpperCase()} <small>{ALGORITHMS[s].length}</small></a>)}
          </div>
        </div>
        <p className="muted">O crea uno a tu medida:</p>
        <fieldset>
          <legend>Conjunto</legend>
          {hasCurrent && <label><input type="radio" checked={setChoice === 'current'} onChange={() => setSetChoice('current')} /> El que estoy viendo ({currentSet.toUpperCase()})</label>}
          {SETS.map(s => <label key={s}><input type="radio" checked={setChoice === s} onChange={() => setSetChoice(s)} /> {s.toUpperCase()}</label>)}
          <label><input type="radio" checked={setChoice === 'all'} onChange={() => setSetChoice('all')} /> F2L, OLL y PLL</label>
        </fieldset>
        <fieldset>
          <legend>Casos</legend>
          <label><input type="radio" checked={which === 'all'} onChange={() => setWhich('all')} /> Todos</label>
          <label><input type="radio" checked={which === 'notknown'} onChange={() => setWhich('notknown')} /> Solo los que no domino</label>
        </fieldset>
        <fieldset>
          <legend>Opciones</legend>
          <label><input type="checkbox" checked={withAlt} onChange={e => setWithAlt(e.target.checked)} /> Incluir algoritmo alternativo</label>
          <label><input type="checkbox" checked={mine} onChange={e => setMine(e.target.checked)} /> Usar mi algoritmo elegido como principal</label>
        </fieldset>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn primary" disabled={busy}>{busy ? 'Generando…' : 'Descargar PDF'}</button>
        </div>
      </form>
    </dialog>
  );
}
