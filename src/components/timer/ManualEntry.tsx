'use client';
// Modo «escribir el tiempo»: cronometras con tu cronómetro físico (p. ej. un YJ Pocket Timer)
// y escribes aquí el resultado. Se guarda igual que un tiempo hecho con el cronómetro de la web.
import { useRef, useState } from 'react';
import { delta, formatDelta, formatSolve, parseTimeInput, type Penalty, type Solve } from '@/lib/timer/stats';

interface Props {
  last: Solve | null;
  prev?: Solve | null;
  onFinish: (ms: number, penalty: Penalty, splits: number[]) => void;
  onLastAction?: (action: Penalty | 'delete') => void;
}

export function ManualEntry({ last, prev, onFinish, onLastAction }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const d = delta(last, prev);

  const submit = () => {
    const parsed = parseTimeInput(value);
    if (!parsed) { setError('No entiendo ese tiempo. Prueba con 21.43, 2143, 1:02.34 o DNF.'); return; }
    onFinish(parsed.t, parsed.p, []);
    setValue(''); setError(null); input.current?.focus();
  };

  return (
    <div className="tm-stage tm-manual">
      <div className="tm-time">{last ? formatSolve(last) : '0.00'}</div>
      {d !== null && <div className={`tm-delta ${d < 0 ? 'faster' : d > 0 ? 'slower' : ''}`} title="Diferencia con el tiempo anterior">{formatDelta(d)}</div>}
      <form className="tm-manual-form" onSubmit={e => { e.preventDefault(); submit(); }}>
        <label className="label" htmlFor="tm-manual-input">Tiempo de tu cronómetro</label>
        <div className="co-input-row">
          <input id="tm-manual-input" ref={input} className="co-scramble" value={value} autoFocus autoComplete="off" inputMode="decimal"
            placeholder="21.43" onChange={e => { setValue(e.target.value); setError(null); }} />
          <button className="btn primary" type="submit">Añadir</button>
        </div>
        {error ? <p className="co-error">{error}</p>
          : <p className="tm-hint">Escribe <b>21.43</b> o <b>2143</b>, <b>1:02.34</b>, <b>DNF</b>, o añade <b>+</b> al final para un +2. Pulsa Enter para guardarlo.</p>}
      </form>
      {last && onLastAction && (
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
