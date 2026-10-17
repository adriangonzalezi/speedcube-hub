// Web Worker: genera mezclas oficiales (estado aleatorio, como la WCA) con el resolvedor de cubejs.
// Arrancar el resolvedor tarda ~1 s, por eso vive fuera del hilo principal.
import Cube from 'cubejs';
import { mulberry32 } from './scramble';

type Request = { id: number; seed?: number };
export type WorkerMessage = { ready: true } | { id: number; scramble: string };

Cube.initSolver();
postMessage({ ready: true } satisfies WorkerMessage);

onmessage = (e: MessageEvent<Request>) => {
  const { id, seed } = e.data;
  let cube: InstanceType<typeof Cube>;
  if (seed) {
    // cubejs usa Math.random: con una semilla fija, todos obtienen la misma mezcla
    const original = Math.random;
    Math.random = mulberry32(seed);
    cube = Cube.random();
    Math.random = original;
  } else cube = Cube.random();
  const scramble = Cube.inverse(cube.solve()).trim().replace(/\s+/g, ' ');
  postMessage({ id, scramble } satisfies WorkerMessage);
};
