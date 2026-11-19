/**
 * Formas de la línea SEO: «tu web sube en la escalera de resultados». Datos
 * puros, sin three.js: los usan seo.ts (el lienzo) y StageVisual.astro (el SVG
 * estático, vía seoSvg()).
 *
 * Juego fijo de piezas, en este orden:
 * - 6 peldaños de vidrio de alturas crecientes (el ranking). En su pose, `dim`
 *   no es desgaste sino "encendido": 0 vidrio normal, 1 peldaño iluminado;
 * - el bloque (tu web), con cantos de cobre. Su `dim` es lo contrario de
 *   pulido: 1 en bruto (la auditoría), 0 pulido;
 * - 3 bloques fantasma: la estela del bloque al subir o su copia en otro idioma;
 * - el plano de escaneo de la auditoría;
 * - la estela de cobre de la subida mes a mes;
 * - el marcador de mapa de vidrio y su placa de mapa (SEO local).
 *
 * Orden de los servicios (catalog.ts): auditoría, optimización de páginas,
 * SEO local, SEO multiidioma, acompañamiento mensual.
 */
import type { Pose, Vec3 } from './web-shapes';
import { scattered } from './web-shapes';
import { circle, hidden, makeCamera, pose, projector } from './projection';

export const FLOOR = -1.15;
export const STEP = { w: 0.5, d: 0.8 };
export const STEP_COUNT = 6;
export const stepHeight = (k: number) => 0.28 + 0.3 * k;
export const BLOCK = 0.42;
export const GHOST_COUNT = 3;
export const SCAN = { h: 2.25, d: 1.25, lines: 9 };
export const PIN = { head: 0.26, len: 0.62 };
export const MAP = { w: 2.9, d: 2.1 };

export const PIECE_ROT: Vec3 = [0.06, -0.16, 0];
export const CAMERA = makeCamera({ fov: 32, dir: [0.32, 0.4, 1], target: [0.22, -0.15, -0.15], halfW: 2.2, halfH: 1.8 });
export const SHADOW = { y: FLOOR - 0.02, z: -0.2, w: 5, d: 3.2 };
export { scattered };

const stepX = (k: number) => -1.4 + 0.56 * k;
const top = (k: number, s = 1) => FLOOR + stepHeight(k) * s;
/** Centro de un peldaño puesto en su sitio de la escalera. */
const stepAt = (k: number, x: number, z: number, ry = 0, lit = 0, o = 1, s = 1) =>
  pose([x, FLOOR + (stepHeight(k) * s) / 2, z], [0, ry, 0], o, s, lit);
/** El bloque apoyado encima de un peldaño. */
const blockOn = (k: number, x: number, z: number, gap = 0, ry = 0.18, rough = 0, o = 1, s = 1) =>
  pose([x, top(k, s) + BLOCK / 2 + gap, z], [0, ry, 0], o, 1, rough);

/** Estela de la subida: puntos sobre la escalera recta, hasta una flecha. */
export const TRAIL: Vec3[] = [
  ...Array.from({ length: STEP_COUNT }, (_, k): Vec3 => [stepX(k), top(k) + BLOCK + 0.08 + 0.008 * k * k, 0]),
  [stepX(5) + 0.28, top(5) + BLOCK + 0.08 + 0.2 + 0.22, 0],
];
export const TRAIL_HEAD: [Vec3, Vec3][] = (() => {
  const tip = TRAIL[TRAIL.length - 1];
  return [
    [tip, [tip[0] - 0.19, tip[1] - 0.05, 0]],
    [tip, [tip[0] + 0.01, tip[1] - 0.2, 0]],
  ];
})();

/** Enlace discontinuo de longitud 1 sobre el eje X (el hreflang entre las dos
    versiones): su pose lo estira y lo orienta entre dos puntos. */
export const LINK_DASHES = 11;
export const LINK: [Vec3, Vec3][] = Array.from({ length: LINK_DASHES }, (_, n): [Vec3, Vec3] => [
  [n / LINK_DASHES, 0, 0], [(n + 0.55) / LINK_DASHES, 0, 0],
]);
function linkBetween(a: Vec3, b: Vec3, o = 1): Pose {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]);
  return pose(a, [0, Math.atan2(-d[2], d[0]), Math.atan2(d[1], h)], o, L);
}

export interface SeoSet {
  steps: Pose[];
  block: Pose;
  ghosts: Pose[];
  scan: Pose;
  trail: Pose;
  link: Pose;
  pin: Pose;
  map: Pose;
}

function base(): SeoSet {
  return {
    steps: Array.from({ length: STEP_COUNT }, (_, k) => stepAt(k, stepX(k), 0)),
    block: blockOn(0, stepX(0), 0),
    ghosts: Array.from({ length: GHOST_COUNT }, () => hidden([stepX(0), top(0) + BLOCK / 2, 0], 0.9)),
    scan: hidden([0, -0.1, 0], 0.7),
    trail: pose([0, -0.25, 0], [0, 0, 0], 0, 1),
    link: pose([0, top(0) + BLOCK / 2, 0], [0, 0, 0], 0, 0.01),
    pin: hidden([0, FLOOR, -0.15], 0.5),
    map: hidden([0, FLOOR - 0.02, -0.15], 0.85),
  };
}

/** Pose de cada pieza para el servicio i de la línea SEO (0–4). */
export function seoShapes(i: number): SeoSet {
  const s = base();
  switch (i) {
    case 0: // Auditoría: el bloque abajo, en bruto; un plano de escaneo cruza la escalera
      s.steps = s.steps.map((_, k) => stepAt(k, stepX(k), 0, 0, k < 3 ? 0.35 : 0, k < 3 ? 1 : 0.55));
      s.block = blockOn(0, stepX(0), 0.05, 0, 0.18, 1);
      s.scan = pose([0.02, FLOOR + SCAN.h / 2 - 0.05, 0], [0, 0, 0]);
      break;
    case 1: // Optimización: el bloque pulido, un peldaño más arriba y algo levantado
      s.steps = s.steps.map((_, k) => stepAt(k, stepX(k), 0, 0, k === 1 ? 1 : 0, k <= 2 ? 1 : 0.7));
      s.block = blockOn(1, stepX(1), 0.04, 0.2, 0.42, 0);
      s.ghosts[0] = pose([stepX(0), top(0) + BLOCK / 2, 0.05], [0, 0.18, 0], 0.22, 1);
      break;
    case 2: { // SEO local: los peldaños en espiral alrededor de un marcador de mapa
      const R = 1.1, sc = 0.62;
      s.steps = s.steps.map((_, k) => {
        const a = Math.PI * (0.8 + k * 0.22);
        return stepAt(k, Math.cos(a) * R, Math.sin(a) * R * 0.78 - 0.15, Math.PI / 2 - a, k === 5 ? 1 : 0.15, 1, sc);
      });
      const a5 = Math.PI * (0.8 + 5 * 0.22);
      s.block = blockOn(5, Math.cos(a5) * R, Math.sin(a5) * R * 0.78 - 0.15, 0.02, 0.5, 0, 1, sc);
      s.pin = pose([-0.05, FLOOR + 0.02, -0.1], [0, 0, 0], 1, 1.75);
      s.map = pose([0, FLOOR - 0.02, -0.15], [0, 0, 0], 1, 1);
      break;
    }
    case 3: { // Multiidioma: dos escaleras que suben la una hacia la otra, el bloque
      // arriba en las dos y un enlace discontinuo entre ambos (el hreflang).
      [0, 2, 4].forEach((k, n) => { s.steps[k] = stepAt(k, -1.28 + 0.52 * n, 0.12, 0, n === 2 ? 1 : 0); });
      [1, 3, 5].forEach((k, n) => { s.steps[k] = stepAt(k, 1.32 - 0.52 * n, -0.62, -0.12, n === 2 ? 1 : 0, 0.8); });
      s.block = blockOn(4, -0.24, 0.12, 0, 0.3, 0);
      s.ghosts[0] = { ...blockOn(5, 0.28, -0.62, 0, -0.1, 0), o: 0.85 };
      const a = s.block.p, b = s.ghosts[0].p;
      s.link = linkBetween([a[0] + 0.12, a[1] + 0.34, a[2]], [b[0] - 0.12, b[1] + 0.34, b[2]]);
      break;
    }
    case 4: // Acompañamiento mensual: subida continua, peldaños encendidos y la estela
      s.steps = s.steps.map((_, k) => stepAt(k, stepX(k), 0, 0, Math.max(0, (k - 1) / 4)));
      s.block = blockOn(5, stepX(5), 0, 0, 0.3, 0);
      s.ghosts = [2, 3, 4].map((k, n) => ({ ...blockOn(k, stepX(k), 0, 0, 0.3, 0), o: 0.14 + n * 0.12 }));
      s.trail = pose([0, 0, 0]);
      break;
  }
  return s;
}

export const seoPoses = (i: number) => {
  const s = seoShapes(i);
  return [...s.steps, s.block, ...s.ghosts, s.scan, s.trail, s.link, s.pin, s.map];
};

/* --- Ilustración estática (SVG) ------------------------------------------- */

const MAP_LINES: [Vec3, Vec3][] = [
  ...[-1, -0.5, 0, 0.5, 1].map((x): [Vec3, Vec3] => [[x * 1.3, 0, -0.95], [x * 1.3, 0, 0.95]]),
  ...[-1, -0.5, 0, 0.5, 1].map((z): [Vec3, Vec3] => [[-1.4, 0, z * 0.95], [1.4, 0, z * 0.95]]),
];
export { MAP_LINES };

export function seoSvg(index: number, W: number, H: number, glowId: string) {
  const p = projector(CAMERA, PIECE_ROT, W, H);
  const s = seoShapes(index);
  const out: { depth: number; svg: string }[] = [];
  const g = (q: Pose, inner: string, cls = '') => `<g opacity="${q.o.toFixed(2)}"${cls ? ` class="${cls}"` : ''}>${inner}</g>`;

  s.steps.forEach((q, k) => {
    if (q.o < 0.01) return;
    out.push({ depth: p.depth(q), svg: g(q, p.box(STEP.w, stepHeight(k), STEP.d, q, q.dim > 0.5 ? 'pv-face pv-tile' : 'pv-face')) });
  });
  [s.block, ...s.ghosts].forEach((q, n) => {
    if (q.o < 0.01) return;
    out.push({ depth: p.depth(q) + 0.3, svg: g(q, p.box(BLOCK, BLOCK, BLOCK, q, 'pv-face pv-tile'), n === 0 && q.dim > 0.5 ? 'pv-dim' : '') });
  });
  if (s.scan.o > 0.01) {
    const q = s.scan;
    const ls: [Vec3, Vec3][] = Array.from({ length: SCAN.lines }, (_, n) => {
      const y = -SCAN.h / 2 + ((n + 0.5) / SCAN.lines) * SCAN.h;
      return [[0, y, -SCAN.d / 2], [0, y, SCAN.d / 2]];
    });
    out.push({ depth: p.depth(q) + 0.2, svg: g(q, p.box(0.02, SCAN.h, SCAN.d, q, 'pv-face') + `<path class="pv-line" d="${p.segs(ls, q)}"/>`) });
  }
  if (s.trail.o > 0.01) {
    const q = s.trail;
    out.push({ depth: 99, svg: g(q, `<path class="pv-line" style="stroke-opacity:.9" d="${p.line(TRAIL, q)}${p.segs(TRAIL_HEAD, q)}"/>`) });
  }
  if (s.link.o > 0.01) {
    const q = s.link;
    out.push({ depth: 98, svg: g(q, `<path class="pv-line" style="stroke-opacity:.9" d="${p.segs(LINK, q)}"/>`) });
  }
  if (s.map.o > 0.01) {
    const q = s.map;
    const rect: Vec3[] = [[-MAP.w / 2, 0, -MAP.d / 2], [MAP.w / 2, 0, -MAP.d / 2], [MAP.w / 2, 0, MAP.d / 2], [-MAP.w / 2, 0, MAP.d / 2]];
    out.push({
      depth: -99,
      svg: g(q, `<polygon class="pv-face" style="stroke-opacity:.5" points="${p.poly(rect, q)}"/><path class="pv-line" style="stroke-opacity:.25" d="${p.segs(MAP_LINES, q)}"/><path class="pv-line" d="${p.line(circle(1.05, 48), q, true)}"/>`),
    });
  }
  if (s.pin.o > 0.01) {
    const q = s.pin;
    const [hx, hy] = p.at([0, PIN.len, 0], q);
    const [ex] = p.at([PIN.head, PIN.len, 0], q);
    const r = Math.abs(ex - hx);
    const [tx, ty] = p.at([0, 0, 0], q);
    const cone = `${tx.toFixed(1)},${ty.toFixed(1)} ${(hx - r * 0.86).toFixed(1)},${(hy + r * 0.5).toFixed(1)} ${(hx + r * 0.86).toFixed(1)},${(hy + r * 0.5).toFixed(1)}`;
    out.push({
      depth: p.depth(q, [0, PIN.len, 0]) + 0.4,
      svg: g(q, `<polygon class="pv-face pv-tile" points="${cone}"/><circle class="pv-face pv-tile" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${r.toFixed(1)}"/><circle class="pv-line" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${(r * 0.38).toFixed(1)}"/>`),
    });
  }
  out.sort((a, b) => a.depth - b.depth);
  return p.glow(glowId, SHADOW) + out.map((x) => x.svg).join('');
}
