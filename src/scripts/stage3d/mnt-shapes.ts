/**
 * Formas de la línea MNT: «un servidor bajo cuidado». Un bloque de vidrio
 * (el servidor o la web) con un latido lento de cobre dentro; cada plan
 * superior le pone una capa más de protección: un anillo de vidrio por plan
 * y, en Enterprise, además una cúpula que lo envuelve todo. Datos puros, sin
 * three.js: los usan mnt.ts (lienzo) y mnt-svg.ts (ilustración estática).
 *
 * Mismo espacio, cámara y giro base que la línea WEB (web-shapes.ts).
 */
import type { Pose, Vec3 } from './web-shapes';

/** El bloque: un servidor de pie, algo más alto que ancho. */
export const BLOCK = { w: 0.92, h: 1.22, d: 0.72 };
/** Tres ranuras en la cara frontal [y centro, alto]. */
export const SLOTS: Array<[number, number]> = [[0.36, 0.17], [0.13, 0.17], [-0.1, 0.17]];
/** Traza del latido en la parte baja de la cara frontal: [x, y] locales. */
export const TRACE: Array<[number, number]> = [
  [-0.34, -0.38], [-0.12, -0.38], [-0.07, -0.31], [-0.02, -0.38], [0.03, -0.38],
  [0.07, -0.5], [0.12, -0.2], [0.17, -0.44], [0.2, -0.38], [0.34, -0.38],
];
/** Anillos de protección: radio medio y ancho de la banda. */
export const RINGS = [1.08, 1.34, 1.6];
export const RING_BAND = 0.12;
/** Cúpula: un elipsoide achatado que envuelve bloque y anillos. */
export const SHELL = { rx: 1.86, ry: 1.3 };
/** Latido: periodo y nivel del fotograma quieto. */
export const BEAT_PERIOD = 1.7;
export const BEAT_STILL = 0.55;

/** Dos golpes (lub-dub) y reposo, 0–1. */
export function beat(t: number) {
  const u = ((t % BEAT_PERIOD) + BEAT_PERIOD) % BEAT_PERIOD;
  const g = (c: number, w: number) => Math.exp(-(((u - c) / w) ** 2));
  return Math.min(1, g(0.12, 0.07) + 0.65 * g(0.4, 0.08));
}

/** Centro de la pieza y altura a la que van los anillos. */
export const CENTER: Vec3 = [0.3, -0.12, -0.5];
const RING_Y = CENTER[1] - 0.06;

/** Inclinación de cada anillo: cruzados, como un giroscopio, sin salirse de
    la cúpula. */
const RING_ROT: Vec3[] = [
  [0.08, 0, 0.1],
  [-0.2, 0, -0.13],
  [0.24, 0, -0.06],
];
/** Giro propio de cada anillo en reposo (rad/s): lentos, en sentidos alternos. */
export const RING_SPIN = [0.16, -0.11, 0.08];

export interface MntShapeSet {
  block: Pose;
  rings: Pose[];
  shell: Pose;
}

const pose = (p: Vec3, r: Vec3 = [0, 0, 0], o = 1, s = 1): Pose => ({ p, r, s, o, dim: 0 });

/** Plan i (0 Basic, 1 Pro, 2 Business, 3 Enterprise). */
export function mntShapes(i: number): MntShapeSet {
  const plan = Math.max(0, Math.min(3, i));
  // Cuanta más protección, más pequeño el bloque en el encuadre: se aleja
  // para que quepa lo que lo rodea.
  const blockScale = [1.6, 1.42, 1.26, 1.14][plan];
  const rings = RINGS.map((_, k): Pose => {
    const p: Vec3 = [CENTER[0], RING_Y, CENTER[2]];
    return k < plan ? pose(p, RING_ROT[k], 1, 1) : pose(p, RING_ROT[k], 0, 0.72);
  });
  return {
    block: pose(CENTER, [0, 0, 0], 1, blockScale),
    rings,
    shell: plan >= 3 ? pose([CENTER[0], CENTER[1] + 0.08, CENTER[2]], [0, 0, 0], 1, 1) : pose([CENTER[0], CENTER[1] + 0.08, CENTER[2]], [0, 0, 0], 0, 0.86),
  };
}

/** Entrada: las capas llegan desde más grandes y transparentes; el bloque,
    desde atrás. */
export function mntScattered(q: Pose, n: number): Pose {
  if (n === 0) return { ...q, p: [q.p[0], q.p[1] - 0.25, q.p[2] - 0.9], s: q.s * 0.9, o: 0 };
  return { ...q, r: [q.r[0] * 2.5, q.r[1] + 0.6, q.r[2] * 2.5], s: q.s * 1.25, o: 0 };
}
