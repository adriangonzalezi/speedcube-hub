// Reglas comprobadas en tests/lessons.test.ts (1.500 últimas capas aleatorias).
import { AlgLink } from '@/components/ui';
import { CaseAlg, CaseFigure, EdgePattern, Figs } from '../figures';
import { lesson } from './types';

const unit = 'u5';
const OCLL = [21, 22, 23, 24, 25];
const ultimaCapa = [
  lesson({
    id: 'oriaristas', unit, title: 'Orientar las aristas', minutes: 4,
    body: () => <>
      <p>La OLL en 2 pasos empieza poniendo la cruz amarilla:</p>
      <Figs>
        <EdgePattern title="Línea horizontal" edges={[0, 1, 1, 0]} />
        <EdgePattern title="L detrás-izq." edges={[1, 1, 0, 0]} />
        <EdgePattern title="Punto" edges={[0, 0, 0, 0]} />
      </Figs>
      <ul>
        <li>Línea horizontal: <AlgLink alg="F R U R' U' F'" /></li>
        <li>L detrás a la izquierda: <AlgLink alg="F U R U' R' F'" /></li>
        <li>Punto: haz <AlgLink alg="F R U R' U' F'" />, te quedará una L, y sigue con la regla de la L.</li>
      </ul>
      <p className="ls-note">Es más rápido que el método principiante: la L se resuelve directamente.</p>
    </>,
    quiz: { q: 'Tienes una L detrás a la izquierda. ¿Qué haces?', options: ["F U R U' R' F'", "F R U R' U' F'", 'Sune'], answer: 0 },
  }),
  lesson({
    id: 'sune', unit, title: 'Sune y Antisune', minutes: 4,
    body: () => <>
      <p>Con la cruz hecha quedan 7 casos de esquinas. Los dos más frecuentes:</p>
      <Figs><CaseFigure set="oll" num={27} /><CaseFigure set="oll" num={26} /></Figs>
      <ul><li>Sune: <CaseAlg set="oll" num={27} /></li><li>Antisune: <CaseAlg set="oll" num={26} /></li></ul>
      <p>El Antisune es el Sune hecho «al revés».</p>
    </>,
    quiz: { q: '¿Cuántos casos de esquinas hay con la cruz hecha?', options: ['3', '7', '21'], answer: 1 },
  }),
  lesson({
    id: 'ocll', unit, title: 'Los otros 5 casos de esquinas', minutes: 5,
    body: () => <>
      <p>Fíjate en la imagen de cada uno y en los laterales:</p>
      <Figs>{OCLL.map(n => <CaseFigure key={n} set="oll" num={n} />)}</Figs>
      <ul>{OCLL.map(n => <li key={n}>OLL {n}: <CaseAlg set="oll" num={n} /></li>)}</ul>
      <p className="ls-note">Comprobado: con estas dos lecciones se orientan miles de últimas capas aleatorias sin fallo.</p>
    </>,
    quiz: { q: 'El caso OLL 21 se llama…', options: ['H', 'Pi', 'Sune'], answer: 0 },
    cta: [['Ver las OLL', '/algoritmos/3x3/oll']],
  }),
  lesson({
    id: 'faros', unit, title: 'Esquinas: faros y T-perm', minutes: 4,
    body: () => <>
      <p>La PLL en 2 pasos empieza colocando las esquinas. Busca <b>faros</b> (dos esquinas del mismo color en una cara lateral).</p>
      <Figs><CaseFigure set="pll" num="T" /></Figs>
      <ul>
        <li>Si hay faros en una cara, ponlos a la <b>izquierda</b> y haz la T-perm: <CaseAlg set="pll" num="T" /></li>
        <li>Si hay faros en las 4 caras, las esquinas ya están.</li>
      </ul>
    </>,
    quiz: { q: '¿Dónde pones los faros para la T-perm?', options: ['A la izquierda', 'Detrás', 'Delante'], answer: 0 },
  }),
  lesson({
    id: 'yperm', unit, title: 'Sin faros: Y-perm', minutes: 3,
    body: () => <>
      <p>Si no hay faros en ninguna cara, dos esquinas opuestas están cambiadas. Haz la Y-perm desde cualquier lado:</p>
      <Figs><CaseFigure set="pll" num="Y" /></Figs>
      <p><CaseAlg set="pll" num="Y" /></p>
    </>,
    quiz: { q: 'No hay faros en ninguna cara. ¿Qué haces?', options: ['T-perm', 'Y-perm', 'Nada'], answer: 1 },
  }),
  lesson({
    id: 'uperm', unit, title: 'Aristas: Ua y Ub', minutes: 4,
    body: () => <>
      <p>Con las esquinas colocadas, si una cara está completa, las otras tres aristas giran en ciclo:</p>
      <Figs><CaseFigure set="pll" num="Ua" /><CaseFigure set="pll" num="Ub" /></Figs>
      <ul><li>Ua: <CaseAlg set="pll" num="Ua" /></li><li>Ub: <CaseAlg set="pll" num="Ub" /></li></ul>
      <p>Pon la cara completa detrás y mira hacia dónde tienen que girar las aristas.</p>
    </>,
    quiz: { q: '¿En qué se diferencian Ua y Ub?', options: ['Giran las 3 aristas en sentidos contrarios', 'Una mueve esquinas', 'Ninguna'], answer: 0 },
  }),
  lesson({
    id: 'hz', unit, title: 'Aristas: H y Z', minutes: 3,
    body: () => <>
      <p>Si no hay ninguna cara completa, se intercambian aristas por parejas:</p>
      <Figs><CaseFigure set="pll" num="H" /><CaseFigure set="pll" num="Z" /></Figs>
      <ul><li>H (opuestas): <CaseAlg set="pll" num="H" /></li><li>Z (adyacentes): <CaseAlg set="pll" num="Z" /></li></ul>
      <p className="ls-note">Comprobado: con esta unidad se resuelven miles de últimas capas aleatorias sin fallo. ¡Ya haces CFOP en 2 pasos!</p>
    </>,
    quiz: { q: 'En la H-perm, ¿qué aristas se intercambian?', options: ['Las opuestas', 'Las de al lado', 'Ninguna'], answer: 0 },
    cta: [['Ver las PLL', '/algoritmos/3x3/pll']],
  }),
];
export default ultimaCapa;
