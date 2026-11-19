/**
 * Proyección a SVG de las piezas 3D, para las ilustraciones estáticas de
 * StageVisual.astro (sin JS, sin WebGL o mientras carga three.js). Usa la
 * misma cámara, el mismo giro base y la misma sombra que el lienzo
 * (web-shapes.ts), así que el SVG y el primer fotograma coinciden.
 * Sin three.js: se ejecuta en el build.
 */
import { CAMERA, PIECE_ROT, SHADOW, cameraEye, cameraTarget, type Pose, type Vec3 } from './web-shapes';

export type Projector = ReturnType<typeof projector>;

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (v: Vec3): Vec3 => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; };

/** Euler XYZ de three.js: se aplica Z, luego Y, luego X. */
export function rot([x, y, z]: Vec3, [rx, ry, rz]: Vec3): Vec3 {
  let a = x * Math.cos(rz) - y * Math.sin(rz), b = x * Math.sin(rz) + y * Math.cos(rz), c = z;
  [a, c] = [a * Math.cos(ry) + c * Math.sin(ry), -a * Math.sin(ry) + c * Math.cos(ry)];
  [b, c] = [b * Math.cos(rx) - c * Math.sin(rx), b * Math.sin(rx) + c * Math.cos(rx)];
  return [a, b, c];
}

/** Proyector para un SVG de W×H con la cámara del lienzo. `key` distingue los
    id de los degradados cuando hay varios SVG en la página. */
export function projector(W: number, H: number, key: string) {
  const f = H / 2 / Math.tan(((CAMERA.fov / 2) * Math.PI) / 180);
  const eye = cameraEye(W / H);
  const fwd = unit(sub(cameraTarget(W / H), eye));
  const right = unit(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);

  /** Punto local de una pieza en su pose → espacio de la escena. */
  const world = (local: Vec3, q: Pose): Vec3 => {
    const r = rot([local[0] * q.s, local[1] * q.s, local[2] * q.s], q.r);
    return rot([r[0] + q.p[0], r[1] + q.p[1], r[2] + q.p[2]], PIECE_ROT);
  };
  /** Punto en el espacio de la pieza (sin pose propia) → escena. */
  const piece = (p: Vec3): Vec3 => rot(p, PIECE_ROT);
  const screen = (p: Vec3) => {
    const d = sub(p, eye);
    const k = f / dot(d, fwd);
    return [W / 2 + dot(d, right) * k, H / 2 - dot(d, up) * k] as const;
  };
  /** Píxeles por unidad a esa distancia (para radios de círculos). */
  const scale = (p: Vec3) => f / dot(sub(p, eye), fwd);
  /** Para ordenar de atrás adelante: menos es más lejos. */
  const depthOf = (p: Vec3) => -dot(sub(p, eye), fwd);
  const xy = (p: Vec3) => screen(p).map((n) => n.toFixed(1)).join(',');
  const pts = (corners: Vec3[], q: Pose) => corners.map((c) => xy(world(c, q))).join(' ');
  const face = (w: number, h: number, z: number): Vec3[] => [
    [-w / 2, h / 2, z], [w / 2, h / 2, z], [w / 2, -h / 2, z], [-w / 2, -h / 2, z],
  ];
  /** Trazo "M x y L x y …" por una lista de puntos de la escena. */
  const path = (points: Vec3[], close = false) =>
    points.map((p, i) => `${i ? 'L' : 'M'}${xy(p).replace(',', ' ')}`).join('') + (close ? 'Z' : '');

  /** Sombra de contacto: elipse con degradado radial de cobre bajo la pieza. */
  const glow = () => {
    const id = `pv-glow-${key}`;
    const [cx, cy] = screen([0, SHADOW.y, SHADOW.z]);
    const [lx] = screen([-SHADOW.w / 2, SHADOW.y, SHADOW.z]);
    const [, fy] = screen([0, SHADOW.y, SHADOW.z - SHADOW.d / 2]);
    const [, ny] = screen([0, SHADOW.y, SHADOW.z + SHADOW.d / 2]);
    return (
      `<defs><radialGradient id="${id}"><stop offset="0" class="pv-glow-stop"/><stop offset="1" class="pv-glow-stop" stop-opacity="0"/></radialGradient></defs>` +
      `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${Math.abs(cx - lx).toFixed(1)}" ry="${(Math.abs(ny - fy) / 2).toFixed(1)}" fill="url(#${id})" opacity=".22"/>`
    );
  };

  return { W, H, key, world, piece, screen, scale, depthOf, xy, pts, face, path, glow };
}
