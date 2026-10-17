import { AlgLink } from '@/components/ui';
import { Figs, MoveFigure } from '../figures';
import { lesson } from './types';

const unit = 'u1';
const primerosPasos = [
  lesson({
    id: 'piezas', unit, title: 'Las piezas del cubo', minutes: 2,
    body: () => <>
      <p>Un cubo de 3x3 tiene tres tipos de piezas:</p>
      <ul>
        <li><b>Centros</b> (6): tienen un color. No se mueven unos respecto a otros, así que el centro marca el color de su cara.</li>
        <li><b>Aristas</b> (12): tienen dos colores.</li>
        <li><b>Esquinas</b> (8): tienen tres colores.</li>
      </ul>
      <p>Los colores opuestos son siempre los mismos: <b>blanco–amarillo</b>, <b>verde–azul</b> y <b>rojo–naranja</b>.</p>
      <Figs><MoveFigure alg="" caption="Resuelto" /></Figs>
    </>,
    quiz: { q: '¿Qué pieza tiene tres colores?', options: ['Un centro', 'Una arista', 'Una esquina'], answer: 2 },
  }),
  lesson({
    id: 'caras', unit, title: 'Las seis caras', minutes: 2,
    body: () => <>
      <p>Cada cara se nombra por su posición, en inglés:</p>
      <ul>
        <li><b>U</b> arriba (<i>up</i>) y <b>D</b> abajo (<i>down</i>)</li>
        <li><b>R</b> derecha (<i>right</i>) y <b>L</b> izquierda (<i>left</i>)</li>
        <li><b>F</b> delante (<i>front</i>) y <b>B</b> detrás (<i>back</i>)</li>
      </ul>
      <p>En esta app sostenemos el cubo con el <b>blanco arriba y el verde delante</b> para leer las mezclas, como en las competiciones.</p>
    </>,
    quiz: { q: '¿Qué letra es la cara de la derecha?', options: ['L', 'R', 'D'], answer: 1 },
  }),
  lesson({
    id: 'sentido', unit, title: 'Sentido de giro', minutes: 3,
    body: () => <>
      <p>Una letra sola es un cuarto de vuelta en el <b>sentido de las agujas del reloj</b>, mirando esa cara de frente.</p>
      <ul><li><code>R&apos;</code> (con apóstrofo): al revés, sentido antihorario.</li><li><code>R2</code>: media vuelta. Da igual el sentido.</li></ul>
      <Figs>{['R', "R'", 'R2', 'U', "U'"].map(m => <MoveFigure key={m} alg={m} />)}</Figs>
      <p>Truco: <code>R</code> sube las piezas de delante hacia arriba; <code>U</code> mueve las de delante hacia la izquierda.</p>
    </>,
    quiz: { q: "¿Qué es U'?", options: ['Cara de arriba en sentido antihorario', 'Cara de arriba media vuelta', 'Cara de abajo'], answer: 0 },
  }),
  lesson({
    id: 'capas', unit, title: 'Capas y giros del cubo', minutes: 3,
    body: () => <>
      <p>Algunos algoritmos mueven más de una capa o el cubo entero:</p>
      <ul>
        <li>Minúscula (<code>r</code>, también <code>Rw</code>): la cara R y la capa de en medio a la vez.</li>
        <li><code>M</code>: la capa entre L y R, en el mismo sentido que L. <code>E</code> va como D y <code>S</code> como F.</li>
        <li><code>x</code>, <code>y</code>, <code>z</code>: giras el cubo entero como R, U y F. No cuentan como movimientos.</li>
      </ul>
      <Figs>{['r', 'M', 'y'].map(m => <MoveFigure key={m} alg={m} />)}</Figs>
    </>,
    quiz: { q: '¿Qué hace y?', options: ['Gira la capa de en medio', 'Gira el cubo entero como U', 'Gira la cara de abajo'], answer: 1 },
  }),
  lesson({
    id: 'primer', unit, title: 'Tu primer algoritmo', minutes: 2,
    body: () => <>
      <p>Un algoritmo es una secuencia de giros que hace algo concreto. El más famoso es <AlgLink alg="R U R' U'" />.</p>
      <p>Haz la prueba: repítelo <b>6 veces seguidas</b> sobre un cubo resuelto. Verás que se desordena… y vuelve a quedar resuelto. Lo usarás en la unidad siguiente.</p>
    </>,
    quiz: { q: "¿Cuántas veces hay que repetir R U R' U' para volver al principio?", options: ['4', '6', '8'], answer: 1 },
  }),
];
export default primerosPasos;
