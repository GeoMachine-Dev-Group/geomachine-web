/**
 * Proyección de las poses a SVG en el build, con la misma cámara que el
 * lienzo (web-shapes.ts). La usa StageVisual.astro para todas las líneas.
 * Datos puros, sin three.js.
 */
import { CAMERA, PIECE_ROT, SHADOW, cameraEye, cameraTarget, type Pose, type Vec3 } from './web-shapes';

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (v: Vec3): Vec3 => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; };

/** Euler XYZ de three.js: se aplica Z, luego Y, luego X. */
export function rotate([x, y, z]: Vec3, [rx, ry, rz]: Vec3): Vec3 {
  let a = x * Math.cos(rz) - y * Math.sin(rz), b = x * Math.sin(rz) + y * Math.cos(rz), c = z;
  [a, c] = [a * Math.cos(ry) + c * Math.sin(ry), -a * Math.sin(ry) + c * Math.cos(ry)];
  [b, c] = [b * Math.cos(rx) - c * Math.sin(rx), b * Math.sin(rx) + c * Math.cos(rx)];
  return [a, b, c];
}

export type Projector = ReturnType<typeof projector>;

/** Cámara de un lienzo de W×H px: de coordenadas locales de una pieza a px. */
export function projector(W: number, H: number) {
  const f = H / 2 / Math.tan(((CAMERA.fov / 2) * Math.PI) / 180);
  const eye = cameraEye(W / H);
  const fwd = unit(sub(cameraTarget(W / H), eye));
  const right = unit(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);

  /** De local de la pieza (con su pose) a escena (con el giro base). */
  function world(local: Vec3, q: Pose): Vec3 {
    const r = rotate([local[0] * q.s, local[1] * q.s, local[2] * q.s], q.r);
    return rotate([r[0] + q.p[0], r[1] + q.p[1], r[2] + q.p[2]], PIECE_ROT);
  }
  /** Una dirección local (normal de cara) llevada a la escena. */
  function direction(local: Vec3, q: Pose): Vec3 {
    return rotate(rotate(local, q.r), PIECE_ROT);
  }
  function screen(p: Vec3) {
    const d = sub(p, eye);
    const k = f / dot(d, fwd);
    return [W / 2 + dot(d, right) * k, H / 2 - dot(d, up) * k] as const;
  }
  /** Para ordenar de atrás adelante: menos es más lejos. */
  const depthOf = (p: Vec3) => -dot(sub(p, eye), fwd);
  /** ¿Mira hacia la cámara una cara con esa normal y ese punto? */
  const facing = (n: Vec3, p: Vec3) => dot(n, sub(eye, p)) > 0;
  const pts = (corners: Vec3[], q: Pose) =>
    corners.map((c) => screen(world(c, q)).map((n) => n.toFixed(1)).join(',')).join(' ');

  /** Sombra de contacto: elipse con degradado radial de cobre bajo la pieza. */
  function glow(id: string) {
    const [cx, cy] = screen([0, SHADOW.y, SHADOW.z]);
    const [lx] = screen([-SHADOW.w / 2, SHADOW.y, SHADOW.z]);
    const [, fy] = screen([0, SHADOW.y, SHADOW.z - SHADOW.d / 2]);
    const [, ny] = screen([0, SHADOW.y, SHADOW.z + SHADOW.d / 2]);
    return (
      `<defs><radialGradient id="${id}"><stop offset="0" class="pv-glow-stop"/><stop offset="1" class="pv-glow-stop" stop-opacity="0"/></radialGradient></defs>` +
      `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${Math.abs(cx - lx).toFixed(1)}" ry="${(Math.abs(ny - fy) / 2).toFixed(1)}" fill="url(#${id})" opacity=".22"/>`
    );
  }

  return { world, direction, screen, depthOf, facing, pts, glow };
}
