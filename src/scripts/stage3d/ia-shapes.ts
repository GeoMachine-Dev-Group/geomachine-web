/**
 * Formas de la línea IA: «una red que piensa». Nodos de vidrio unidos por
 * hilos de cobre, con pulsos de luz que viajan por los hilos. Datos puros,
 * sin three.js: los usan ia.ts (lienzo) e ia-svg.ts (ilustración estática).
 *
 * Juego fijo de piezas: NODE_COUNT nodos, una caja (el servidor de «IA
 * privada») y un hilo por cada pareja de nodos que se une en alguna pose
 * (EDGES, calculado). Cada pose dice dónde está cada nodo y qué hilos se ven;
 * los hilos no tienen sitio propio: se tienden cada fotograma entre sus dos
 * nodos, así que siguen unidos durante el cambio de forma.
 *
 * Canal `dim` de la pose, reutilizado:
 * - nodos: 0 normal, 1 destacado (núcleo de cobre encendido y halo);
 * - hilos: sentido del pulso, 0 de EDGES[k][0] a [1], 1 al revés.
 *
 * Mismo espacio, cámara y giro base que la línea WEB (web-shapes.ts).
 */
import type { Pose, Vec3 } from './web-shapes';

export const NODE_COUNT = 10;
export const NODE_R = 0.16;
/** Caja de vidrio de «IA privada en tu servidor». */
export const CASE = { w: 2.2, h: 1.78, d: 1.3 };
/** Velocidad de los pulsos, en unidades de escena por segundo. */
export const PULSE_SPEED = 0.62;

type Link = [from: number, to: number, opacity?: number];
interface Layout {
  nodes: Array<[p: Vec3, s?: number, hot?: boolean]>;
  links: Link[];
  box?: boolean;
}

/** Cinco poses, una por servicio de la línea IA (catalog.ts, en orden). */
const LAYOUTS: Layout[] = [
  // 0 · Auditoría de procesos: un flujo suelto de izquierda a derecha con un
  // desvío; un nodo destacado, el cuello de botella que encuentra la auditoría.
  {
    nodes: [
      [[-1.5, -0.42, 0.25]],
      [[-0.86, 0.12, -0.1]],
      [[-0.2, -0.36, 0.2]],
      [[0.5, 0.12, -0.12], 1.75, true],
      [[1.18, -0.3, -0.42]],
      [[1.82, 0.22, -0.82]],
      [[-0.12, 0.78, -0.62], 0.85],
    ],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 6], [6, 3]],
  },
  // 1 · Asistente para clientes: un anillo de nodos al fondo y todos los
  // pulsos convergen hacia un nodo grande delante, el que habla con el cliente.
  {
    nodes: [
      [[0.78, -0.3, 0.85], 1.9, true],
      ...Array.from({ length: 8 }, (_, j): [Vec3, number] => {
        const a = (j / 8) * Math.PI * 2 + Math.PI / 8;
        return [[0.3 + Math.cos(a) * 1.55, 0.05 + Math.sin(a) * 0.92, -1.05 + Math.sin(a) * 0.15], 0.9];
      }),
    ],
    links: [
      ...Array.from({ length: 8 }, (_, j): Link => [j + 1, 0]),
      ...Array.from({ length: 8 }, (_, j): Link => [j + 1, ((j + 1) % 8) + 1, 0.35]),
    ],
  },
  // 2 · Automatización de tareas: una cadena recta, de una entrada a una
  // salida, con los pulsos avanzando a la vez como en una línea de montaje.
  {
    nodes: Array.from({ length: 7 }, (_, j): [Vec3, number, boolean] => {
      const k = j / 6;
      return [[-1.0 + 2.5 * k, -0.7 + 1.25 * k, 0.6 - 1.7 * k], j === 0 || j === 6 ? 1.35 : 1, j === 6];
    }),
    links: Array.from({ length: 6 }, (_, j): Link => [j, j + 1]),
  },
  // 3 · IA privada en tu servidor: la red entera, cerrada en una caja de
  // vidrio. Nada sale de la caja.
  {
    box: true,
    nodes: [
      [[-0.55, -0.32, 0.3], 0.85],
      [[-0.15, 0.3, -0.05], 0.85],
      [[0.42, -0.2, 0.32], 1.25, true],
      [[0.95, 0.32, -0.15], 0.85],
      [[1.18, -0.38, -0.65], 0.85],
      [[0.5, 0.42, -0.95], 0.85],
      [[-0.32, -0.12, -0.85], 0.85],
      [[0.25, -0.5, -0.45], 0.85],
    ],
    links: [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4], [2, 7], [7, 4], [1, 5], [5, 3], [6, 1], [6, 7], [5, 6]],
  },
  // 4 · Formación al equipo: un nodo que enseña, arriba, y un grupo en
  // semicírculo delante de él que recibe los pulsos.
  {
    nodes: [
      [[0.3, 0.72, -0.85], 1.6, true],
      ...Array.from({ length: 6 }, (_, j): [Vec3] => {
        const a = Math.PI * (0.08 + (0.84 * j) / 5);
        return [[0.3 - Math.cos(a) * 1.6, -0.52, -0.55 + Math.sin(a) * 0.95]];
      }),
    ],
    links: [
      ...Array.from({ length: 6 }, (_, j): Link => [0, j + 1]),
      ...Array.from({ length: 5 }, (_, j): Link => [j + 1, j + 2, 0.35]),
    ],
  },
];

/** Todas las parejas de nodos que se unen en alguna pose, sin repetir. */
export const EDGES: Array<[number, number]> = (() => {
  const seen = new Map<string, [number, number]>();
  for (const l of LAYOUTS) {
    for (const [a, b] of l.links) {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!seen.has(key)) seen.set(key, a < b ? [a, b] : [b, a]);
    }
  }
  return [...seen.values()];
})();

/** Desfase de cada hilo en su recorrido (0–1), determinista. */
export function edgePhase(k: number) {
  const x = Math.sin((k + 1) * 91.17) * 43758.5453;
  return x - Math.floor(x);
}

/** Dónde queda el pulso del hilo k en el fotograma quieto (movimiento
    reducido y SVG): repartidos, ninguno en los extremos. */
export function stillT(k: number) {
  return 0.3 + 0.4 * edgePhase(k);
}

export interface IaShapeSet {
  nodes: Pose[];
  box: Pose;
  edges: Pose[];
}

const pose = (p: Vec3, o = 1, s = 1, dim = 0): Pose => ({ p, r: [0, 0, 0], s, o, dim });
const CENTER: Vec3 = [0.3, -0.05, -0.4];
/** Las poses se escriben compactas y se estiran aquí, sobre todo en alto,
    para llenar el mismo hueco que la pieza WEB. */
const SPREAD: Vec3 = [0.8, 1.5, 0.9];
const spread = (p: Vec3): Vec3 => p.map((v, a) => CENTER[a] + (v - CENTER[a]) * SPREAD[a]) as Vec3;

export function iaShapes(i: number): IaShapeSet {
  const l = LAYOUTS[Math.max(0, Math.min(LAYOUTS.length - 1, i))];
  const nodes = Array.from({ length: NODE_COUNT }, (_, n): Pose => {
    const d = l.nodes[n];
    if (!d) {
      // Los que sobran se recogen hacia el centro, pequeños e invisibles.
      const a = n * 2.4;
      return pose([CENTER[0] + Math.cos(a) * 0.4, CENTER[1] + Math.sin(a) * 0.3, CENTER[2]], 0, 0.3);
    }
    return pose(spread(d[0]), 1, d[1] ?? 1, d[2] ? 1 : 0);
  });
  const edges = EDGES.map(([a, b]): Pose => {
    const link = l.links.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
    if (!link) return pose([0, 0, 0], 0);
    return pose([0, 0, 0], link[2] ?? 1, 1, link[0] === a ? 0 : 1);
  });
  const box = l.box ? pose(CENTER, 1) : pose(CENTER, 0, 0.82);
  return { nodes, box, edges };
}

/** Entrada: los nodos parten algo dispersos y transparentes. */
export function iaScattered(q: Pose, n: number): Pose {
  const h = (k: number) => {
    const x = Math.sin((n + 1) * 12.9898 + k * 78.233) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1;
  };
  return {
    p: [q.p[0] + h(1) * 0.6, q.p[1] + h(2) * 0.45 - 0.15, q.p[2] - 0.9 + h(3) * 0.4],
    r: q.r,
    s: q.s * 0.6,
    o: 0,
    dim: q.dim,
  };
}
