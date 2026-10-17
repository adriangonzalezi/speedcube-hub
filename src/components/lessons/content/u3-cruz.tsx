import { lesson } from './types';

const unit = 'u3';
const cruz = [
  lesson({
    id: 'cfop', unit, title: '¿Qué es CFOP?', minutes: 3,
    body: () => <>
      <p>Es el método que usan casi todos los speedcubers. Tiene 4 pasos:</p>
      <ol>
        <li><b>Cruz</b>: igual que en el método principiante, pero abajo.</li>
        <li><b>F2L</b>: las dos primeras capas a la vez, por parejas.</li>
        <li><b>OLL</b>: la cara de arriba de un solo color, de un golpe.</li>
        <li><b>PLL</b>: colocar las piezas de arriba, de un golpe.</li>
      </ol>
      <p>En total son 41 + 57 + 21 = <b>119 algoritmos</b>, pero puedes empezar con muchos menos (lo verás en la unidad 5).</p>
    </>,
    quiz: { q: '¿En qué orden van los pasos?', options: ['Cruz, OLL, F2L, PLL', 'Cruz, F2L, OLL, PLL', 'F2L, Cruz, PLL, OLL'], answer: 1 },
  }),
  lesson({
    id: 'cruzabajo', unit, title: 'La cruz, abajo', minutes: 3,
    body: () => <>
      <p>En CFOP la cruz se hace <b>directamente en la cara de abajo</b>, sin darle la vuelta al cubo.</p>
      <ul>
        <li>Así, al terminarla ya tienes delante las piezas del F2L.</li>
        <li>Al principio cuesta porque no ves la cara de abajo: inclina el cubo para mirarla, no lo gires.</li>
      </ul>
    </>,
    quiz: { q: '¿Por qué se hace la cruz abajo?', options: ['Porque es obligatorio', 'Para ver el F2L sin girar el cubo', 'Porque es más bonita'], answer: 1 },
  }),
  lesson({
    id: 'cruzplan', unit, title: 'Planifica la cruz', minutes: 4,
    body: () => <>
      <p>En competición tienes <b>15 segundos de inspección</b> antes de empezar. Úsalos para planificar la cruz entera.</p>
      <ul>
        <li>Cualquier cruz se puede hacer en <b>8 movimientos o menos</b>; la media está en unos 6.</li>
        <li>Localiza primero las 4 aristas blancas y piensa en ellas por parejas.</li>
        <li>Puedes formar la cruz «relativa» y ajustarla con un giro de D al final.</li>
      </ul>
    </>,
    quiz: { q: '¿Cuántos movimientos tiene como mucho una cruz óptima?', options: ['6', '8', '12'], answer: 1 },
    cta: [['Practicar la cruz', '/practica/cruz']],
  }),
];
export default cruz;
