/**
 * Proyección a SVG de las piezas 3D, para las ilustraciones estáticas de
 * StageVisual.astro (sin JS, sin WebGL o mientras carga three.js). Reproduce
 * en el build lo que pinta el lienzo: mismas poses, mismo giro de la pieza,
 * misma cámara y misma sombra, así que el SVG y el primer fotograma coinciden.
 * Datos puros, sin three.js. Es el único módulo de proyección: lo usan todas
 * las líneas.
 *
 * - projector(W, H, key): con la cámara de WEB (web-shapes.ts). La usan WEB,
 *   APP, SYS, IA y MNT.
 * - projectorFor(cam, pieceRot, W, H, key): con una cámara propia hecha con
 *   makeCamera(). La usan SEO y PACK.
 *
 * Los dos devuelven el mismo objeto. `key` distingue los id de los degradados
 * cuando hay varios SVG en la página: hay que pasarlo único por SVG.
 */
import { CAMERA, PIECE_ROT, SHADOW, cameraEye, cameraTarget, type Pose, type Vec3 } from './web-shapes';

/* --- Cámara ------------------------------------------------------------------ */

export interface CameraConfig {
  fov: number;
  dir: Vec3;
  target: Vec3;
  halfW: number;
  halfH: number;
  /** Cuánto sube el punto de mira en vertical (baja la pieza en el encuadre). */
  tallLift?: number;
}

export interface Camera {
  fov: number;
  target(aspect: number): Vec3;
  eye(aspect: number): Vec3;
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (v: Vec3): Vec3 => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; };

/** La cámara de WEB repetida con parámetros propios, para que todas las piezas
    se vean con el mismo "objetivo": algo elevada y a la derecha, más alta y
    más cerca en un lienzo vertical. */
export function makeCamera(c: CameraConfig): Camera {
  const tan = Math.tan(((c.fov / 2) * Math.PI) / 180);
  const target = (aspect: number): Vec3 =>
    aspect < 1 ? [c.target[0], c.target[1] + (c.tallLift ?? 0.43), c.target[2]] : [...c.target];
  const eye = (aspect: number): Vec3 => {
    const lift = Math.max(0, 1 - aspect) * 0.5;
    const d = unit([c.dir[0], c.dir[1] + lift, c.dir[2]]);
    const near = aspect < 1 ? Math.max(0.76, Math.min(1, 0.76 + (aspect - 0.65) * 0.7)) : 1;
    const k = Math.max(c.halfH / tan, c.halfW / (tan * aspect)) * near;
    const t = target(aspect);
    return [t[0] + d[0] * k, t[1] + d[1] * k, t[2] + d[2] * k];
  };
  return { fov: c.fov, target, eye };
}

/** La cámara de WEB (web-shapes.ts). */
export const WEB_CAMERA: Camera = { fov: CAMERA.fov, target: cameraTarget, eye: cameraEye };

export const pose = (p: Vec3, r: Vec3 = [0, 0, 0], o = 1, s = 1, dim = 0): Pose => ({ p, r, s, o, dim });
export const hidden = (p: Vec3, s = 0.6): Pose => pose(p, [0, 0, 0], 0, s);

/** Euler XYZ de three.js: se aplica Z, luego Y, luego X. */
export function rotate([x, y, z]: Vec3, [rx, ry, rz]: Vec3): Vec3 {
  let a = x * Math.cos(rz) - y * Math.sin(rz), b = x * Math.sin(rz) + y * Math.cos(rz), c = z;
  [a, c] = [a * Math.cos(ry) + c * Math.sin(ry), -a * Math.sin(ry) + c * Math.cos(ry)];
  [b, c] = [b * Math.cos(rx) - c * Math.sin(rx), b * Math.sin(rx) + c * Math.cos(rx)];
  return [a, b, c];
}
/** Alias de rotate(). */
export const rot = rotate;

/** Puntos de una circunferencia en el plano XZ (y fija) o XY. */
export function circle(r: number, n = 40, plane: 'xz' | 'xy' = 'xz', c: Vec3 = [0, 0, 0]): Vec3[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return plane === 'xz'
      ? [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r]
      : [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]];
  });
}

/* --- Proyector ----------------------------------------------------------------- */

export type Projector = ReturnType<typeof projectorFor>;
type Shadow = { y: number; z: number; w: number; d: number };

/** Proyector para un SVG de W×H con la cámara de WEB. */
export function projector(W: number, H: number, key = `${W}x${H}`) {
  return projectorFor(WEB_CAMERA, PIECE_ROT, W, H, key);
}

/** Proyector para un SVG de W×H con una cámara y un giro de pieza propios. */
export function projectorFor(cam: Camera, pieceRot: Vec3, W: number, H: number, key = `${W}x${H}`) {
  const f = H / 2 / Math.tan(((cam.fov / 2) * Math.PI) / 180);
  const eye = cam.eye(W / H);
  const fwd = unit(sub(cam.target(W / H), eye));
  const right = unit(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);

  /** Punto local de una pieza en su pose → espacio de la escena. */
  const world = (local: Vec3, q: Pose): Vec3 => {
    const r = rotate([local[0] * q.s, local[1] * q.s, local[2] * q.s], q.r);
    return rotate([r[0] + q.p[0], r[1] + q.p[1], r[2] + q.p[2]], pieceRot);
  };
  /** Punto en el espacio de la pieza (sin pose propia) → escena. */
  const piece = (p: Vec3): Vec3 => rotate(p, pieceRot);
  /** Una dirección local (normal de cara) llevada a la escena. */
  const direction = (local: Vec3, q: Pose): Vec3 => rotate(rotate(local, q.r), pieceRot);
  const screen = (p: Vec3): [number, number] => {
    const d = sub(p, eye);
    const k = f / dot(d, fwd);
    return [W / 2 + dot(d, right) * k, H / 2 - dot(d, up) * k];
  };
  /** Píxeles por unidad a esa distancia (para radios de círculos). */
  const scale = (p: Vec3) => f / dot(sub(p, eye), fwd);
  /** Para ordenar de atrás adelante: menos es más lejos. */
  const depthOf = (p: Vec3) => -dot(sub(p, eye), fwd);
  /** Profundidad de un punto local de una pieza (por defecto, su centro). */
  const depth = (q: Pose, local: Vec3 = [0, 0, 0]) => depthOf(world(local, q));
  /** ¿Mira hacia la cámara una cara con esa normal y ese punto? */
  const facing = (n: Vec3, p: Vec3) => dot(n, sub(eye, p)) > 0;
  const fmt = ([x, y]: [number, number]) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const xy = (p: Vec3) => fmt(screen(p));
  /** Punto local de una pieza (con su pose) a coordenadas de pantalla. */
  const at = (local: Vec3, q: Pose) => screen(world(local, q));
  /** Polígono "x,y x,y …" con los puntos locales dados. */
  const pts = (corners: Vec3[], q: Pose) => corners.map((c) => fmt(at(c, q))).join(' ');
  const poly = pts;
  const face = (w: number, h: number, z: number): Vec3[] => [
    [-w / 2, h / 2, z], [w / 2, h / 2, z], [w / 2, -h / 2, z], [-w / 2, -h / 2, z],
  ];
  /** Trazo "M x y L x y …" por una lista de puntos de la escena. */
  const path = (points: Vec3[], close = false) =>
    points.map((p, i) => `${i ? 'L' : 'M'}${xy(p).replace(',', ' ')}`).join('') + (close ? 'Z' : '');
  /** Path de una polilínea de puntos locales (cerrada si `close`). */
  const line = (local: Vec3[], q: Pose, close = false) => path(local.map((p) => world(p, q)), close);
  /** Path de segmentos locales [[a, b], …]. */
  const segs = (list: [Vec3, Vec3][], q: Pose) => list.map(([a, b]) => line([a, b], q)).join('');

  /** Caras visibles de una caja centrada en `c` (o las de detrás, vistas por
      dentro, con `back`: el interior de una caja abierta). */
  function box(w: number, h: number, d: number, q: Pose, cls: string, c: Vec3 = [0, 0, 0], skipTop = false, back = false) {
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
  }

  /** Envolvente convexa de unos puntos locales (cilindros, esferas). */
  function hull(local: Vec3[], q: Pose) {
    const list = local.map((p) => at(p, q)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const turn = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = (pts: [number, number][]) => {
      const h: [number, number][] = [];
      for (const p of pts) {
        while (h.length >= 2 && turn(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
        h.push(p);
      }
      h.pop();
      return h;
    };
    return [...half(list), ...half([...list].reverse())].map(fmt).join(' ');
  }

  /** Sombra de contacto: elipse con degradado radial de cobre bajo la pieza.
      Sin `id`, sale de `key`; sin `s`, la sombra de WEB. */
  function glow(id = `pv-glow-${key}`, s: Shadow = SHADOW) {
    const [cx, cy] = screen([0, s.y, s.z]);
    const [lx] = screen([-s.w / 2, s.y, s.z]);
    const [, fy] = screen([0, s.y, s.z - s.d / 2]);
    const [, ny] = screen([0, s.y, s.z + s.d / 2]);
    return (
      `<defs><radialGradient id="${id}"><stop offset="0" class="pv-glow-stop"/><stop offset="1" class="pv-glow-stop" stop-opacity="0"/></radialGradient></defs>` +
      `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${Math.abs(cx - lx).toFixed(1)}" ry="${(Math.abs(ny - fy) / 2).toFixed(1)}" fill="url(#${id})" opacity=".22"/>`
    );
  }

  return {
    W, H, key,
    world, piece, direction, screen, scale, depthOf, depth, facing, xy, at,
    pts, poly, face, path, line, segs, box, hull, glow,
  };
}
