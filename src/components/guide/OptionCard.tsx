'use client';
import { CubeImage } from '@/components/ui';
import { totalMoves, type SolveOption } from '@/lib/cube';
import { stateImageUrl } from '@/lib/visualcube';

/** «OLL 27 (7 mov.) → T Perm (14 mov.)» */
export function nextText(o: SolveOption) {
  if (!o.next) return '';
  const chain = [`${o.next.label} (${o.next.moves} mov.)`];
  if (o.next.next) chain.push(`${o.next.next.label} (${o.next.next.moves} mov.)`);
  return chain.join(' → ');
}

interface Props {
  option: SolveOption;
  title?: string;
  recommended?: boolean;
  /** Texto de la etiqueta de la opción recomendada */
  badge?: string;
  /** Ocultar el resultado (para los ejercicios donde hay que adivinar la mejor) */
  hidden?: boolean;
  chosen?: boolean;
  actionLabel?: string;
  onPick?: () => void;
}

/** Una opción de un paso: algoritmo, cómo queda el cubo y qué deja para el siguiente paso */
export function OptionCard({ option: o, title, recommended, badge = 'Recomendado', hidden, chosen, actionLabel = 'Usar', onPick }: Props) {
  return (
    <article className={`co-opt${recommended ? ' best' : ''}${chosen ? ' chosen' : ''}`}>
      {hidden ? <span className="ls-qmark">?</span> : <CubeImage src={stateImageUrl(o.after, false, 120)} alt="Resultado" size={88} />}
      <div className="co-opt-body">
        <div className="co-opt-head">
          <h4>{title ?? o.label}{o.kind === 'f2l' && o.slotName && <span className="muted"> · hueco {o.slotName}</span>}</h4>
          {recommended && <span className="badge">{badge}</span>}
          {o.alt && <span className="tag">alternativo</span>}
          {chosen && <span className="tag">tu elección</span>}
        </div>
        <p className="alg">{o.alg || '(nada que hacer)'}</p>
        <p className="co-meta">
          <span>{o.moves} mov.{o.rotation ? ' · con giro de cubo' : ''}</span>
          {!hidden && o.next && <><span>Te deja: <b>{nextText(o)}</b></span><span>Total: {Math.round(totalMoves(o))} mov.</span></>}
        </p>
      </div>
      {onPick && <button className={`btn${recommended ? ' primary' : ''}`} onClick={onPick}>{actionLabel}</button>}
    </article>
  );
}

/** Vistas delantera y trasera del cubo */
export function CubeViews({ state }: { state: import('@/lib/cube').CubeState }) {
  return (
    <div className="co-cube">
      <div className="co-views">
        <figure><CubeImage src={stateImageUrl(state, false)} alt="Cubo, vista delantera" size={200} lazy={false} /><figcaption>Delante</figcaption></figure>
        <figure><CubeImage src={stateImageUrl(state, true)} alt="Cubo, vista trasera" size={200} lazy={false} /><figcaption>Detrás</figcaption></figure>
      </div>
    </div>
  );
}
