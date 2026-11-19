/**
 * Juego de piezas genérico para las líneas que no son WEB (APP, SYS): placas
 * y bloques de vidrio con un dibujo de cobre en la cara delantera, y cables
 * de cobre entre ellos. Datos puros, sin three.js, porque los usan dos sitios:
 * - glass-kit-3d.ts, que construye las piezas y las interpola en el lienzo;
 * - glass-kit-svg.ts (vía StageVisual.astro), que proyecta las mismas poses
 *   a un SVG estático.
 *
 * Cámara, giro base, sombra y entrada son los de la línea WEB
 * (web-shapes.ts), para que todas las piezas se vean igual.
 */
import type { Pose, Vec3 } from './web-shapes';

/** Segmento [x1, y1, x2, y2] en la cara delantera de una pieza. */
export type Seg = [number, number, number, number];

export interface CardSpec {
  kind: 'card';
  w: number;
  h: number;
  d: number;
  /** Radio de las esquinas (vista frontal). 0 = caja recta. */
  r?: number;
  /** Dibujo de cobre sobre la cara delantera (+z). */
  glyph?: Seg[];
  /** 'tile': vidrio con punto de cobre y menos brillo, para piezas pequeñas. */
  tone?: 'slab' | 'tile';
  /** Opacidad del dibujo (por defecto 0,55; 0,75 en 'tile'). */
  ink?: number;
}

/** Cable: un segmento de cobre de longitud 1 sobre el eje X local. La pose
    lo coloca entre dos puntos (ver wire()). */
export interface WireSpec {
  kind: 'wire';
}

export type PieceSpec = CardSpec | WireSpec;

export interface Kit {
  pieces: PieceSpec[];
  /** Una pose por pieza, en el mismo orden que `pieces`. */
  poses(index: number): Pose[];
}

export const pose = (p: Vec3, r: Vec3 = [0, 0, 0], o = 1, s = 1, dim = 0): Pose => ({ p, r, s, o, dim });

/** Pose de un cable que va de `a` a `b`. */
export function wire(a: Vec3, b: Vec3, o = 1): Pose {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = Math.max(1e-4, Math.hypot(...d));
  return {
    p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2],
    // Rz lleva X a la altura de la dirección; Ry la gira en planta.
    r: [0, Math.atan2(-d[2], d[0]), Math.asin(d[1] / len)],
    s: len,
    o,
    dim: 0,
  };
}

/* --- Dibujo -------------------------------------------------------------- */

export const rectSegs = (x1: number, y1: number, x2: number, y2: number): Seg[] => [
  [x1, y1, x2, y1], [x2, y1, x2, y2], [x2, y2, x1, y2], [x1, y2, x1, y1],
];

export function arcSegs(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = a0 + ((a1 - a0) * i) / n, t1 = a0 + ((a1 - a0) * (i + 1)) / n;
    out.push([cx + rx * Math.cos(t0), cy + ry * Math.sin(t0), cx + rx * Math.cos(t1), cy + ry * Math.sin(t1)]);
  }
  return out;
}

export const circleSegs = (cx: number, cy: number, r: number, n = 18) => arcSegs(cx, cy, r, r, 0, Math.PI * 2, n);

/** Contorno de un rectángulo de w×h centrado con esquinas de radio r. */
export function roundedRectPoints(w: number, h: number, r: number, n = 5): [number, number][] {
  const out: [number, number][] = [];
  const hw = w / 2 - r, hh = h / 2 - r;
  const corners: [number, number, number][] = [[hw, hh, 0], [-hw, hh, 0.5], [-hw, -hh, 1], [hw, -hh, 1.5]];
  for (const [cx, cy, a] of corners) {
    for (let i = 0; i <= n; i++) {
      const t = (a + (0.5 * i) / n) * Math.PI;
      out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
  }
  return out;
}

export function roundRectSegs(x1: number, y1: number, x2: number, y2: number, r: number): Seg[] {
  const p = roundedRectPoints(x2 - x1, y2 - y1, r, 3);
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
  return p.map((a, i) => {
    const b = p[(i + 1) % p.length];
    return [a[0] + cx, a[1] + cy, b[0] + cx, b[1] + cy];
  });
}

/** Línea de puntos: trocitos cortos entre dos puntos de la cara. */
export function dashSegs(x1: number, y1: number, x2: number, y2: number, n: number): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < n; i++) {
    const a = i / n, b = (i + 0.5) / n;
    out.push([x1 + (x2 - x1) * a, y1 + (y2 - y1) * a, x1 + (x2 - x1) * b, y1 + (y2 - y1) * b]);
  }
  return out;
}
