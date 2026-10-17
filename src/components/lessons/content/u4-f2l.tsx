import { AlgLink } from '@/components/ui';
import { CaseAlg, CaseFigure, Figs } from '../figures';
import { lesson } from './types';

const unit = 'u4';
const f2l = [
  lesson({
    id: 'pareja', unit, title: 'Qué es una pareja', minutes: 3,
    body: () => <>
      <p>En el F2L cada esquina blanca va con su arista: juntas forman una <b>pareja</b> que se mete de golpe en su hueco.</p>
      <Figs><CaseFigure set="f2l" num={4} /></Figs>
      <p>Hay 4 huecos, así que son 4 parejas. Todo el F2L se reduce a dos ideas: <b>juntar</b> la pareja arriba y <b>meterla</b>.</p>
    </>,
    quiz: { q: '¿Qué se junta en una pareja?', options: ['Dos aristas', 'Una esquina blanca y su arista', 'Un centro y una esquina'], answer: 1 },
  }),
  lesson({
    id: 'meter', unit, title: 'Meter una pareja formada', minutes: 3,
    body: () => <>
      <p>Si la pareja ya está formada en la capa de arriba, se mete con 3 movimientos:</p>
      <Figs><CaseFigure set="f2l" num={4} /><CaseFigure set="f2l" num={3} /></Figs>
      <ul><li>Hacia la derecha: <CaseAlg set="f2l" num={4} /></li><li>Hacia delante: <CaseAlg set="f2l" num={3} /></li></ul>
    </>,
    quiz: { q: '¿Cuántos movimientos tiene meter una pareja ya formada?', options: ['3', '7', '11'], answer: 0 },
  }),
  lesson({
    id: 'separada', unit, title: 'Una pareja separada', minutes: 3,
    body: () => <>
      <p>Cuando la esquina y la arista están separadas, a veces el mismo giro de U las junta justo al entrar:</p>
      <Figs><CaseFigure set="f2l" num={1} /><CaseFigure set="f2l" num={2} /></Figs>
      <ul><li><CaseAlg set="f2l" num={1} /></li><li><AlgLink alg="U' F' U F" /></li></ul>
      <p>Fíjate en por qué funcionan: el primer giro coloca una pieza para que la otra la «recoja».</p>
    </>,
    quiz: { q: "En U R U' R', ¿para qué sirve el primer U?", options: ['Para nada', 'Para colocar las piezas y que se junten al entrar', 'Para girar el cubo'], answer: 1 },
  }),
  lesson({
    // Comprobado con el simulador: en F2L 17 y 18 la esquina tiene el blanco arriba
    id: 'blancoarriba', unit, title: 'Esquina con el blanco arriba', minutes: 4,
    body: () => <>
      <p>Si la esquina tiene el blanco mirando hacia arriba, no se puede juntar directamente. Primero hay que separarla de la arista y volver a juntarla bien:</p>
      <Figs><CaseFigure set="f2l" num={17} /><CaseFigure set="f2l" num={18} /></Figs>
      <ul><li><CaseAlg set="f2l" num={17} /></li><li><CaseAlg set="f2l" num={18} /></li></ul>
    </>,
    quiz: { q: 'Si el blanco de la esquina mira hacia arriba…', options: ['Se mete directamente', 'Hay que separarla y volver a juntarla', 'Hay que empezar de nuevo'], answer: 1 },
  }),
  lesson({
    id: 'huecos', unit, title: 'Huecos vacíos y sin giros', minutes: 3,
    body: () => <>
      <p>Dos hábitos que ahorran mucho tiempo:</p>
      <ul>
        <li><b>Usa los huecos libres</b> para guardar piezas mientras juntas otra pareja.</li>
        <li><b>Evita girar el cubo</b> (<code>y</code>): cada giro es una pausa. Mejor gira U para traer la pareja delante de su hueco, o usa movimientos de L y B para los huecos de atrás.</li>
      </ul>
      <p>Los 41 casos del F2L tienen algoritmo en Algoritmos, pero entender estas ideas vale más que memorizarlos.</p>
    </>,
    quiz: { q: '¿Qué conviene evitar en el F2L?', options: ['Usar huecos libres', 'Girar el cubo entero', 'Mirar la pareja'], answer: 1 },
    cta: [['Practicar la última pareja', '/practica/ultima-pareja'], ['Ver los 41 casos', '/algoritmos/3x3/f2l']],
  }),
];
export default f2l;
