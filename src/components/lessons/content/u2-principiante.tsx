// Reglas comprobadas en tests/lessons.test.ts (1.500 últimas capas aleatorias).
import { AlgLink } from '@/components/ui';
import { EdgePattern, Figs } from '../figures';
import { lesson } from './types';

const unit = 'u2';
const principiante = [
  lesson({
    id: 'cruzb', unit, title: 'La cruz blanca', minutes: 5,
    body: () => <>
      <p>Primer paso: forma una cruz con las 4 aristas blancas alrededor del centro blanco.</p>
      <ul>
        <li>Cada arista tiene otro color: tiene que quedar <b>alineado con el centro lateral</b> de ese color.</li>
        <li>Es intuitivo: lleva cada arista a su sitio sin romper las que ya tienes. Tómate tu tiempo.</li>
      </ul>
    </>,
    quiz: { q: '¿Con qué tiene que coincidir el otro color de cada arista de la cruz?', options: ['Con el centro lateral de su color', 'Con la esquina de al lado', 'Con nada'], answer: 0 },
  }),
  lesson({
    id: 'esquinasb', unit, title: 'Las esquinas blancas', minutes: 4,
    body: () => <>
      <p>Da la vuelta al cubo: <b>blanco abajo</b>. Ahora completa la primera capa.</p>
      <ul>
        <li>Pon una esquina blanca en la capa de arriba, justo encima de su hueco: delante a la derecha.</li>
        <li>Repite <AlgLink alg="R U R' U'" /> hasta que quede bien colocada. Serán 1, 3 o 5 veces.</li>
      </ul>
    </>,
    quiz: { q: "¿Dónde pones la esquina antes de repetir R U R' U'?", options: ['Encima de su hueco, delante a la derecha', 'En cualquier sitio', 'Abajo a la izquierda'], answer: 0 },
  }),
  lesson({
    id: 'segunda', unit, title: 'La segunda capa', minutes: 5,
    body: () => <>
      <p>Busca una arista de la capa de arriba <b>sin amarillo</b> y gira U hasta que su color de delante coincida con el centro de delante.</p>
      <ul>
        <li>Si su otro color va a la derecha: <AlgLink alg="U R U' R' U' F' U F" /></li>
        <li>Si va a la izquierda: <AlgLink alg="U' L' U L U F U' F'" /></li>
      </ul>
      <p>Si una arista está en la segunda capa pero mal puesta, sácala con uno de estos algoritmos y vuelve a meterla.</p>
    </>,
    quiz: { q: '¿Qué aristas se usan para la segunda capa?', options: ['Las que tienen amarillo', 'Las que no tienen amarillo', 'Las blancas'], answer: 1 },
  }),
  lesson({
    id: 'cruzy', unit, title: 'La cruz amarilla', minutes: 4,
    body: () => <>
      <p>Ahora el amarillo está arriba. Para hacer la cruz amarilla usa <AlgLink alg="F R U R' U' F'" />:</p>
      <Figs>
        <EdgePattern title="Punto" edges={[0, 0, 0, 0]} />
        <EdgePattern title="L detrás-izq." edges={[1, 1, 0, 0]} />
        <EdgePattern title="Línea horizontal" edges={[0, 1, 1, 0]} />
      </Figs>
      <p>Desde el punto sale una L; desde la L (detrás a la izquierda) sale la línea; y desde la línea (horizontal) sale la cruz.</p>
    </>,
    quiz: { q: 'Tienes una línea. ¿Cómo la pones?', options: ['Vertical', 'Horizontal', 'Da igual'], answer: 1 },
  }),
  lesson({
    id: 'carey', unit, title: 'La cara amarilla', minutes: 4,
    body: () => <>
      <p>Para orientar las esquinas usa el <b>Sune</b>: <AlgLink alg="R U R' U R U2 R'" /></p>
      <ul>
        <li>Si solo hay <b>una</b> esquina con el amarillo arriba, ponla delante a la izquierda.</li>
        <li>Si no hay ninguna o hay dos, gira U hasta que la esquina de delante a la izquierda tenga el amarillo mirando a la izquierda.</li>
        <li>Repite hasta tener la cara amarilla completa.</li>
      </ul>
    </>,
    quiz: { q: 'Hay una sola esquina bien. ¿Dónde la pones?', options: ['Delante a la izquierda', 'Detrás a la derecha', 'Delante a la derecha'], answer: 0 },
  }),
  lesson({
    id: 'esquinasy', unit, title: 'Colocar las esquinas de arriba', minutes: 4,
    body: () => <>
      <p>Busca <b>faros</b>: dos esquinas con el mismo color en una cara lateral.</p>
      <ul>
        <li>Pon los faros <b>detrás</b> y haz <AlgLink alg="R' F R' B2 R F' R' B2 R2" /></li>
        <li>Si no hay faros, hazlo desde cualquier lado y vuelve a buscar.</li>
      </ul>
    </>,
    quiz: { q: '¿Dónde pones los faros?', options: ['Delante', 'Detrás', 'A la derecha'], answer: 1 },
  }),
  lesson({
    id: 'aristasy', unit, title: 'Terminar el cubo', minutes: 4,
    body: () => <>
      <p>Último paso: colocar las aristas de arriba.</p>
      <ul>
        <li>Si una cara lateral ya está completa, ponla <b>detrás</b> y haz <AlgLink alg="R U' R U R U R U' R' U' R2" />. Si no ha quedado, repítelo.</li>
        <li>Si no hay ninguna cara completa, hazlo una vez desde cualquier lado y vuelve a mirar.</li>
      </ul>
      <p className="ls-note">Comprobado: siguiendo las reglas de esta unidad al pie de la letra se resuelven miles de últimas capas aleatorias sin fallo. ¡Ya sabes resolver el cubo!</p>
    </>,
    quiz: { q: 'Tienes una cara lateral completa. ¿Dónde la pones?', options: ['Delante', 'Detrás', 'A la izquierda'], answer: 1 },
    cta: [['Cronometra tu primera resolución', '/cronometro']],
  }),
];
export default principiante;
