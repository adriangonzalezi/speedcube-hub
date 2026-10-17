import { AlgLink } from '@/components/ui';
import { lesson } from './types';

const unit = 'u6';
const avanzado = [
  lesson({
    id: 'pllfull', unit, title: 'Aprende las 21 PLL', minutes: 3,
    body: () => <>
      <p>El siguiente salto es hacer la PLL en un paso. Empieza por aquí: son 21, salen en cada resolución y ya conoces 6 (T, Y, Ua, Ub, H, Z).</p>
      <ul><li>Aprende 1 o 2 al día y márcalas como <b>En práctica</b>.</li><li>Repásalas en Práctica → Tarjetas con «Toca repasar».</li></ul>
    </>,
    quiz: { q: '¿Cuántas PLL ya conoces del 2 pasos?', options: ['2', '6', '21'], answer: 1 },
    cta: [['Ver las PLL', '/algoritmos/3x3/pll'], ['Repasar con tarjetas', '/practica/tarjetas']],
  }),
  lesson({
    id: 'ollfull', unit, title: 'Aprende las 57 OLL', minutes: 3,
    body: () => <>
      <p>Las OLL son más, pero se aprenden bien por <b>grupos de forma</b> (en Algoritmos puedes filtrar por forma).</p>
      <ul><li>Ya conoces las 7 de esquinas (21–27).</li><li>Sigue por los grupos más frecuentes y aprende 2 o 3 por día.</li></ul>
    </>,
    quiz: { q: '¿Cómo conviene aprender las OLL?', options: ['Todas a la vez', 'Por grupos de forma', 'En orden de número'], answer: 1 },
    cta: [['Ver las OLL', '/algoritmos/3x3/oll']],
  }),
  lesson({
    id: 'reconocer', unit, title: 'Reconocer rápido', minutes: 4,
    body: () => <>
      <p>Saber un algoritmo no sirve si tardas 2 segundos en ver qué caso es.</p>
      <ul>
        <li>En la PLL, mira <b>dos caras laterales</b>: faros, bloques de 2 o 3 piezas iguales y colores opuestos juntos te dicen el caso.</li>
        <li>En la OLL, fíjate en la forma de arriba y en los laterales.</li>
        <li>Entrena el reconocimiento por separado, contra el reloj.</li>
      </ul>
    </>,
    quiz: { q: '¿Cuántas caras laterales hay que mirar para reconocer una PLL?', options: ['Una', 'Dos', 'Las cuatro'], answer: 1 },
    cta: [['Entrenar el reconocimiento', '/practica/reconocimiento']],
  }),
  lesson({
    id: 'lookahead', unit, title: 'Lookahead', minutes: 3,
    body: () => <>
      <p>Cuando ya sabes los algoritmos, lo que más tiempo quita son las <b>pausas</b>.</p>
      <ul><li>Mientras metes una pareja, busca la siguiente con la vista.</li><li>Gira más despacio, pero sin pararte nunca: es mejor lento y fluido que rápido a trompicones.</li></ul>
    </>,
    quiz: { q: '¿Qué conviene para mejorar el lookahead?', options: ['Girar lo más rápido posible', 'Girar más despacio sin pararse', 'Aprender más algoritmos'], answer: 1 },
  }),
  lesson({
    id: 'fingers', unit, title: 'Finger tricks', minutes: 3,
    body: () => <>
      <p>Los <i>finger tricks</i> son formas de girar con los dedos sin cambiar el agarre:</p>
      <ul><li><code>U</code> con el índice derecho, empujando.</li><li><code>U&apos;</code> con el índice izquierdo.</li><li><code>R</code> y <code>R&apos;</code> con la muñeca.</li></ul>
      <p>Practícalos con <AlgLink alg="R U R' U'" />: debería salir sin soltar el cubo.</p>
    </>,
    quiz: { q: '¿Con qué se hace R?', options: ['Con la muñeca', 'Con el pulgar', 'Con el meñique'], answer: 0 },
  }),
  lesson({
    id: 'fases', unit, title: 'Mide tus fases', minutes: 2,
    body: () => <>
      <p>Para saber qué practicar, mide cuánto tardas en cada paso.</p>
      <p>En el Cronómetro elige <b>4 fases</b> y pulsa espacio al acabar la cruz, el F2L y la OLL. La app te dirá qué fase te frena más comparada con el reparto habitual del CFOP (~13 % cruz, ~50 % F2L, ~17 % OLL, ~20 % PLL).</p>
    </>,
    quiz: { q: '¿Qué fase suele llevarse la mitad del tiempo?', options: ['La cruz', 'El F2L', 'La PLL'], answer: 1 },
    cta: [['Abrir el cronómetro', '/cronometro']],
  }),
];
export default avanzado;
