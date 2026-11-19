/**
 * Utilidades sin three.js compartidas por los juegos de formas que no son WEB
 * (de momento SEO y PACK): la cámara y la proyección a SVG de la ilustración
 * estática (StageVisual.astro).
 *
 * La cámara repite la de WEB (web-shapes.ts) con parámetros propios, para que
 * todas las piezas se vean con el mismo "objetivo": algo elevada y a la
 * derecha, más alta y más cerca en un lienzo vertical.
 *
 * El proyector reproduce en el build lo que pinta el lienzo: mismas poses,
 * mismo giro de la pieza, misma cámara. Solo dibuja caras que miran a la
 * cámara y ordena de atrás adelante.
 */
import type { Pose, Vec3 } from './web-shapes';

export interface CameraConfig {
  fov: number;
  dir: Vec3;
  target: Vec3;
  halfW: number;
  halfH: number;
  /** Cuánto sube el punto de mira en vertical (baja la pieza en el encuadre). */
  tallLift?: number;
}

const norm = (v: Vec3): Vec3 => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
};

export function makeCamera(c: CameraConfig) {
  const tan = Math.tan(((c.fov / 2) * Math.PI) / 180);
  const target = (aspect: number): Vec3 =>
    aspect < 1 ? [c.target[0], c.target[1] + (c.tallLift ?? 0.43), c.target[2]] : [...c.target];
  const eye = (aspect: number): Vec3 => {
    const lift = Math.max(0, 1 - aspect) * 0.5;
    const d = norm([c.dir[0], c.dir[1] + lift, c.dir[2]]);
    const near = aspect < 1 ? Math.max(0.76, Math.min(1, 0.76 + (aspect - 0.65) * 0.7)) : 1;
    const k = Math.max(c.halfH / tan, c.halfW / (tan * aspect)) * near;
    const t = target(aspect);
    return [t[0] + d[0] * k, t[1] + d[1] * k, t[2] + d[2] * k];
  };
  return { fov: c.fov, target, eye };
}

export const pose = (p: Vec3, r: Vec3 = [0, 0, 0], o = 1, s = 1, dim = 0): Pose => ({ p, r, s, o, dim });
export const hidden = (p: Vec3, s = 0.6): Pose => pose(p, [0, 0, 0], 0, s);

/* --- Proyección a SVG ------------------------------------------------------ */

type Cam = ReturnType<typeof makeCamera>;
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

function rot([x, y, z]: Vec3, [rx, ry, rz]: Vec3): Vec3 {
  // Euler XYZ de three.js: se aplica Z, luego Y, luego X.
  let a = x * Math.cos(rz) - y * Math.sin(rz), b = x * Math.sin(rz) + y * Math.cos(rz), c = z;
  [a, c] = [a * Math.cos(ry) + c * Math.sin(ry), -a * Math.sin(ry) + c * Math.cos(ry)];
  [b, c] = [b * Math.cos(rx) - c * Math.sin(rx), b * Math.sin(rx) + c * Math.cos(rx)];
  return [a, b, c];
}

export interface Projector {
  /** Punto local de una pieza (con su pose) a coordenadas de pantalla. */
  at(local: Vec3, q: Pose): [number, number];
  /** Profundidad del centro de una pieza: menos es más lejos. */
  depth(q: Pose, local?: Vec3): number;
  /** Polígono "x,y x,y …" con los puntos locales dados. */
  poly(local: Vec3[], q: Pose): string;
  /** Path de segmentos locales [[a, b], …]. */
  segs(list: [Vec3, Vec3][], q: Pose): string;
  /** Path de una polilínea (cerrada si `close`). */
  line(local: Vec3[], q: Pose, close?: boolean): string;
  /** Caras visibles de una caja centrada en `c` (o las de detrás, vistas por
      dentro, con `back`: el interior de una caja abierta). */
  box(w: number, h: number, d: number, q: Pose, cls: string, c?: Vec3, skipTop?: boolean, back?: boolean): string;
  /** Envolvente convexa de unos puntos locales (cilindros, esferas). */
  hull(local: Vec3[], q: Pose): string;
  /** Sombra de contacto de cobre, como la del lienzo. */
  glow(id: string, shadow: { y: number; z: number; w: number; d: number }): string;
}

export function projector(cam: Cam, pieceRot: Vec3, W: number, H: number): Projector {
  const f = H / 2 / Math.tan(((cam.fov / 2) * Math.PI) / 180);
  const eye = cam.eye(W / H);
  const fwd = norm(sub(cam.target(W / H), eye));
  const right = norm(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);

  const world = (local: Vec3, q: Pose): Vec3 => {
    const r = rot([local[0] * q.s, local[1] * q.s, local[2] * q.s], q.r);
    return rot([r[0] + q.p[0], r[1] + q.p[1], r[2] + q.p[2]], pieceRot);
  };
  const scr = (p: Vec3): [number, number] => {
    const d = sub(p, eye);
    const k = f / dot(d, fwd);
    return [W / 2 + dot(d, right) * k, H / 2 - dot(d, up) * k];
  };
  const fmt = ([x, y]: [number, number]) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const at = (local: Vec3, q: Pose) => scr(world(local, q));
  const line = (local: Vec3[], q: Pose, close = false) =>
    local.map((p, i) => `${i ? 'L' : 'M'}${at(p, q).map((n) => n.toFixed(1)).join(' ')}`).join('') + (close ? 'Z' : '');

  return {
    at,
    depth: (q, local = [0, 0, 0]) => -dot(sub(world(local, q), eye), fwd),
    poly: (local, q) => local.map((p) => fmt(at(p, q))).join(' '),
    segs: (list, q) => list.map(([a, b]) => line([a, b], q)).join(''),
    line,
    box(w, h, d, q, cls, c = [0, 0, 0], skipTop = false, back = false) {
      const [x, y, z] = c;
      const X = w / 2, Y = h / 2, Z = d / 2;
      const P = (sx: number, sy: number, sz: number): Vec3 => [x + sx * X, y + sy * Y, z + sz * Z];
      const faces: Vec3[][] = [
        [P(-1, -1, 1), P(1, -1, 1), P(1, 1, 1), P(-1, 1, 1)], // +z
        [P(1, -1, -1), P(-1, -1, -1), P(-1, 1, -1), P(1, 1, -1)], // -z
        [P(1, -1, 1), P(1, -1, -1), P(1, 1, -1), P(1, 1, 1)], // +x
        [P(-1, -1, -1), P(-1, -1, 1), P(-1, 1, 1), P(-1, 1, -1)], // -x
        [P(-1, 1, 1), P(1, 1, 1), P(1, 1, -1), P(-1, 1, -1)], // +y
        [P(-1, -1, -1), P(1, -1, -1), P(1, -1, 1), P(-1, -1, 1)], // -y
      ];
      return faces
        .filter((_, i) => !(skipTop && i === 4))
        .filter((fc) => {
          // Cara visible si sus vértices proyectados giran en sentido antihorario
          // (en pantalla, con Y hacia abajo, área negativa).
          const s = fc.map((p) => at(p, q));
          let a = 0;
          for (let i = 0; i < s.length; i++) {
            const [x1, y1] = s[i], [x2, y2] = s[(i + 1) % s.length];
            a += x1 * y2 - x2 * y1;
          }
          return back ? a > 0 : a < 0;
        })
        .map((fc) => `<polygon class="${cls}" points="${fc.map((p) => fmt(at(p, q))).join(' ')}"/>`)
        .join('');
    },
    hull(local, q) {
      const pts = local.map((p) => at(p, q)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const turn = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const half = (list: [number, number][]) => {
        const h: [number, number][] = [];
        for (const p of list) {
          while (h.length >= 2 && turn(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
          h.push(p);
        }
        h.pop();
        return h;
      };
      return [...half(pts), ...half([...pts].reverse())].map(fmt).join(' ');
    },
    glow(id, s) {
      const [cx, cy] = scr([0, s.y, s.z]);
      const [lx] = scr([-s.w / 2, s.y, s.z]);
      const [, fy] = scr([0, s.y, s.z - s.d / 2]);
      const [, ny] = scr([0, s.y, s.z + s.d / 2]);
      return (
        `<defs><radialGradient id="${id}"><stop offset="0" class="pv-glow-stop"/><stop offset="1" class="pv-glow-stop" stop-opacity="0"/></radialGradient></defs>` +
        `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${Math.abs(cx - lx).toFixed(1)}" ry="${(Math.abs(ny - fy) / 2).toFixed(1)}" fill="url(#${id})" opacity=".22"/>`
      );
    },
  };
}

/** Puntos de una circunferencia en el plano XZ (y fija) o XY. */
export function circle(r: number, n = 40, plane: 'xz' | 'xy' = 'xz', c: Vec3 = [0, 0, 0]): Vec3[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return plane === 'xz'
      ? [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r]
      : [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]];
  });
}
