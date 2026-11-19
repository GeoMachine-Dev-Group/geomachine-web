/**
 * Formas de los paquetes (PACK): «una caja de vidrio que se abre y enseña lo
 * que trae». Datos puros, sin three.js: los usan pack.ts (el lienzo) y
 * StageVisual.astro (el SVG estático, vía packSvg()).
 *
 * Juego fijo de piezas, en este orden:
 * - la caja (sin tapa arriba). Su `dim` es la luz de cobre de dentro: 0
 *   apagada, 1 encendida (la oferta estrella);
 * - la tapa;
 * - las miniaturas de cada línea, en el mismo idioma que sus piezas grandes:
 *   dos hojas (WEB; la segunda puede ir apagada con `dim`, la web vieja), un
 *   móvil en capas (APP), un grupo de nodos (IA), un bloque con anillo
 *   (mantenimiento), una escalera (SEO), un marcador de mapa (SEO local) y una
 *   base de datos en discos;
 * - 5 losetas: los cinco flujos del MVP, productos de tienda o automatizaciones.
 *
 * Lo que no trae un paquete se queda dentro de la caja, invisible: al cambiar
 * de paquete unas piezas se hunden y otras salen.
 *
 * Orden (catalog.ts): PACK-07 (estrella), 01, 02, 03, 04, 05, 06.
 */
import type { Pose, Vec3 } from './web-shapes';
import { PAGE_LINES, SLAB, scattered } from './web-shapes';
import { circle, hidden, makeCamera, pose, projectorFor } from './projection';

export const FLOOR = -1.15;
export const BOX = { w: 2.1, h: 0.72, d: 1.35 };
export const LID = { w: 2.2, h: 0.07, d: 1.45 };
export const RIM = FLOOR + BOX.h;
export const MINI_SLAB = 0.34;
export const PHONE = { w: 0.5, h: 1, d: 0.05 };
export const CUBE = 0.46;
export const RING = 0.5;
export const DISC = { r: 0.3, h: 0.13, gap: 0.06 };
export const TILE = { w: 0.38, h: 0.38, d: 0.05 };
export const TILE_COUNT = 5;
export const PIN = { head: 0.17, len: 0.42 };
export const NODES: { p: Vec3; r: number }[] = [
  { p: [0, 0, 0], r: 0.17 },
  { p: [-0.48, 0.22, 0.08], r: 0.1 },
  { p: [0.42, 0.36, -0.14], r: 0.105 },
  { p: [0.4, -0.3, 0.17], r: 0.09 },
  { p: [-0.34, -0.3, -0.17], r: 0.1 },
  { p: [0.03, 0.58, 0.08], r: 0.085 },
];
export const NODE_LINKS: [number, number][] = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 5], [2, 5], [3, 2]];
/** Escalera en miniatura: [x, alto] de cada peldaño, con la base alineada. */
export const MINI_STEPS: [number, number][] = [[-0.27, 0.22], [0, 0.42], [0.27, 0.62]];
export const MINI_STEP = { w: 0.24, d: 0.42, base: -0.31 };

export const PIECE_ROT: Vec3 = [0.06, -0.16, 0];
export const CAMERA = makeCamera({ fov: 32, dir: [0.32, 0.4, 1], target: [0.05, -0.02, -0.2], halfW: 2.15, halfH: 1.75 });
export const SHADOW = { y: FLOOR - 0.02, z: -0.1, w: 4.6, d: 3 };
export { scattered };

/** Tapa con bisagra en el canto de atrás, abierta `a` radianes. */
function lidHinged(a: number): Pose {
  const hz = -BOX.d / 2, hy = RIM;
  const half = LID.d / 2 - 0.05;
  return pose([0, hy + Math.sin(a) * half + Math.cos(a) * (LID.h / 2), hz + Math.cos(a) * half - Math.sin(a) * (LID.h / 2) + 0.05], [-a, 0, 0]);
}

export interface PackSet {
  box: Pose;
  lid: Pose;
  slabA: Pose;
  slabB: Pose;
  phone: Pose;
  nodes: Pose;
  ring: Pose;
  steps: Pose;
  pin: Pose;
  db: Pose;
  tiles: Pose[];
}

const inside = (x: number, z = 0): Pose => hidden([x, FLOOR + 0.3, z], 0.4);

function base(): PackSet {
  return {
    box: pose([0, FLOOR + BOX.h / 2, 0]),
    lid: { ...lidHinged(1.32), o: 0.75 },
    slabA: inside(-0.5),
    slabB: inside(-0.2, -0.2),
    phone: inside(0.1),
    nodes: inside(0.4),
    ring: inside(0.6),
    steps: inside(-0.6, 0.3),
    pin: inside(0.2, 0.3),
    db: inside(0.5, -0.3),
    tiles: Array.from({ length: TILE_COUNT }, (_, n) => inside(-0.6 + n * 0.3, 0.1)),
  };
}

/** Pose de cada pieza para el paquete i (0–6). */
export function packShapes(i: number): PackSet {
  const s = base();
  switch (i) {
    case 0: { // PACK-07, MVP en 3 semanas: la tapa sale volando, la caja se enciende
      // y el producto entero se levanta: panel, base de datos, copia de seguridad
      // y los cinco flujos en arco por encima.
      s.box = pose([0, FLOOR + BOX.h / 2, 0], [0, 0, 0], 1, 1, 1);
      s.lid = pose([0.05, 1.2, -1.4], [0.4, -0.22, 0.1], 0.5, 0.7);
      s.slabA = pose([-0.08, 0.3, -0.12], [0, 0.12, 0], 1, 0.52);
      s.db = pose([0.82, -0.02, 0.28], [0, 0, 0], 1, 1);
      s.ring = pose([-0.95, 0.0, 0.3], [0.08, 0.55, 0], 1, 0.95);
      s.tiles = s.tiles.map((_, n) => {
        const a = Math.PI * (0.88 - n * 0.19);
        return pose([-0.08 + Math.cos(a) * 1.12, 0.42 + Math.sin(a) * 0.78, 0.32], [0, 0.14, -0.1 + n * 0.05], 1, 0.82);
      });
      break;
    }
    case 1: // PACK-01, Arranque: landing, ficha de Google, mantenimiento
      s.slabA = pose([-0.5, 0.22, -0.12], [0, 0.18, 0], 1, 0.5);
      s.pin = pose([0.22, RIM + 0.12, 0.3], [0, 0, 0], 1, 1.25);
      s.ring = pose([0.78, 0.02, -0.2], [0.08, 0.5, 0]);
      break;
    case 2: // PACK-02, Negocio conectado: web de cinco páginas, SEO base, asistente
      s.slabA = pose([-0.58, 0.24, -0.08], [0, 0.18, 0], 1, 0.5);
      s.slabB = pose([-0.38, 0.32, -0.48], [0, 0.22, -0.02], 0.4, 0.5);
      s.steps = pose([0.2, -0.04, 0.32], [0, 0.3, 0], 1, 1.05);
      s.nodes = pose([0.78, 0.3, -0.2], [0.2, 0.4, 0], 1, 0.85);
      break;
    case 3: // PACK-03, Salto a la IA: auditoría, dos automatizaciones, formación
      s.nodes = pose([0, 0.32, 0], [0.2, 0.5, 0], 1, 1.25);
      s.tiles[1] = pose([-0.88, 0.02, 0.28], [0, 0.2, 0.05], 1, 1);
      s.tiles[3] = pose([0.86, 0.08, 0.28], [0, 0.1, -0.05], 1, 1);
      break;
    case 4: // PACK-04, MVP de transporte: app, backend y base de datos, panel
      s.phone = pose([-0.05, 0.22, 0.22], [0, 0.2, 0.04], 1, 1);
      s.db = pose([0.72, 0.0, 0.05], [0, 0, 0], 1, 1);
      s.slabA = pose([-0.78, 0.26, -0.32], [0, 0.22, 0], 1, 0.46);
      break;
    case 5: // PACK-05, Tienda lista: tienda con productos, SEO local, mantenimiento
      s.slabA = pose([-0.52, 0.24, -0.18], [0, 0.16, 0], 1, 0.5);
      [0, 1, 2].forEach((n) => {
        s.tiles[n] = pose([-0.86 + n * 0.3, -0.06 + (n % 2) * 0.08, 0.3], [0, 0.16, 0], 1, 0.68);
      });
      s.pin = pose([0.3, RIM + 0.12, 0.34], [0, 0, 0], 1, 1.2);
      s.ring = pose([0.8, 0.02, -0.24], [0.08, 0.5, 0]);
      break;
    case 6: // PACK-06, Migración: la web vieja sale apagada, la nueva entra; SEO multiidioma; mantenimiento
      s.slabB = pose([-1.05, 0.14, -0.5], [0.03, 0.5, -0.08], 0.45, 0.48, 1);
      s.slabA = pose([-0.3, 0.26, 0.02], [0, 0.08, 0], 1, 0.5);
      s.steps = pose([0.48, -0.04, 0.34], [0, 0.3, 0], 1, 0.95);
      s.ring = pose([0.88, 0.04, -0.28], [0.08, 0.5, 0], 1, 0.9);
      break;
  }
  return s;
}

export const packPoses = (i: number) => {
  const s = packShapes(i);
  return [s.box, s.lid, s.slabA, s.slabB, s.phone, s.nodes, s.ring, s.steps, s.pin, s.db, ...s.tiles];
};

/* --- Detalles compartidos con el lienzo ------------------------------------ */

const rect = (x1: number, y1: number, x2: number, y2: number, z: number): [Vec3, Vec3][] => [
  [[x1, y1, z], [x2, y1, z]], [[x2, y1, z], [x2, y2, z]], [[x2, y2, z], [x1, y2, z]], [[x1, y2, z], [x1, y1, z]],
];
/** Pantalla del móvil: altavoz, tres tarjetas y la barra de abajo. */
export const PHONE_LINES: [Vec3, Vec3][] = (() => {
  const z = PHONE.d / 2 + 0.003;
  return [
    [[-0.05, 0.33, z], [0.05, 0.33, z]],
    ...rect(-0.14, 0.26, 0.14, 0.1, z),
    ...rect(-0.14, 0.05, 0.14, -0.06, z),
    ...rect(-0.14, -0.11, 0.14, -0.22, z),
    [[-0.08, -0.32, z], [0.08, -0.32, z]],
  ];
})();
/** La capa de detrás del móvil (pantalla siguiente). */
export const PHONE_BACK: Vec3 = [0.12, 0.07, -0.14];
/** Renglón de las losetas. */
export const TILE_LINES: [Vec3, Vec3][] = [
  [[-0.12, 0.08, TILE.d / 2 + 0.003], [0.12, 0.08, TILE.d / 2 + 0.003]],
  [[-0.12, -0.02, TILE.d / 2 + 0.003], [0.04, -0.02, TILE.d / 2 + 0.003]],
  [[-0.12, -0.1, TILE.d / 2 + 0.003], [0.08, -0.1, TILE.d / 2 + 0.003]],
];
export const discY = (n: number) => (n - 1) * (DISC.h + DISC.gap);
/** Anillo del bloque de mantenimiento, ya inclinado (plano local XZ girado). */
export const RING_TILT: Vec3 = [0.38, 0, -0.28];
export const PAGE = PAGE_LINES;
export { SLAB };

/* --- Ilustración estática (SVG) ------------------------------------------- */

function tilt([x, y, z]: Vec3, [rx, , rz]: Vec3): Vec3 {
  // Z y luego X, como la rotación del anillo en el lienzo (sin Y).
  const a = x * Math.cos(rz) - y * Math.sin(rz), b = x * Math.sin(rz) + y * Math.cos(rz);
  return [a, b * Math.cos(rx) - z * Math.sin(rx), b * Math.sin(rx) + z * Math.cos(rx)];
}

export function packSvg(index: number, W: number, H: number, glowId: string) {
  const p = projectorFor(CAMERA, PIECE_ROT, W, H, glowId);
  const s = packShapes(index);
  const out: { depth: number; svg: string }[] = [];
  const g = (q: Pose, inner: string, cls = '') => `<g opacity="${q.o.toFixed(2)}"${cls ? ` class="${cls}"` : ''}>${inner}</g>`;
  const push = (q: Pose, inner: string, bias = 0, cls = '') => {
    if (q.o > 0.01) out.push({ depth: p.depth(q) + bias, svg: g(q, inner, cls) });
  };

  // Caja: la cara de atrás y el fondo van primero; las de delante, al final.
  const b = s.box;
  out.push({ depth: -50, svg: g(b, p.box(BOX.w, BOX.h, BOX.d, b, 'pv-face', [0, 0, 0], true, true).replace(/<polygon/g, '<polygon style="fill-opacity:.35"')) });
  out.push({ depth: 50, svg: g(b, p.box(BOX.w, BOX.h, BOX.d, b, 'pv-face', [0, 0, 0], true).replace(/<polygon/g, '<polygon style="fill-opacity:.25"')) });
  push(s.lid, p.box(LID.w, LID.h, LID.d, s.lid, 'pv-face'), -0.5);

  for (const [q, cls] of [[s.slabA, ''], [s.slabB, s.slabB.dim > 0.5 ? 'pv-dim' : '']] as const) {
    const z = SLAB.d / 2;
    const face: Vec3[] = [[-SLAB.w / 2, SLAB.h / 2, z], [SLAB.w / 2, SLAB.h / 2, z], [SLAB.w / 2, -SLAB.h / 2, z], [-SLAB.w / 2, -SLAB.h / 2, z]];
    const lines = PAGE_LINES.map(([x1, y1, x2, y2]): [Vec3, Vec3] => [[x1, y1, z], [x2, y2, z]]);
    push(q, `<polygon class="pv-face" points="${p.poly(face, q)}"/><path class="pv-line" d="${p.segs(lines, q)}"/>`, 0, cls);
  }
  {
    const q = s.phone;
    const back = { ...q, p: q.p } as Pose;
    const off = (v: Vec3): Vec3 => [v[0] + PHONE_BACK[0], v[1] + PHONE_BACK[1], v[2] + PHONE_BACK[2]];
    const face = (o: (v: Vec3) => Vec3): Vec3[] =>
      ([[-1, 1], [1, 1], [1, -1], [-1, -1]] as const).map(([sx, sy]) => o([(sx * PHONE.w) / 2, (sy * PHONE.h) / 2, PHONE.d / 2]));
    push(q, `<polygon class="pv-face" style="opacity:.5" points="${p.poly(face(off), back)}"/><polygon class="pv-face pv-tile" points="${p.poly(face((v) => v), q)}"/><path class="pv-line" d="${p.segs(PHONE_LINES, q)}"/>`);
  }
  {
    const q = s.nodes;
    const links = NODE_LINKS.map(([a, c]): [Vec3, Vec3] => [NODES[a].p, NODES[c].p]);
    const balls = NODES.map((n) => {
      const [x, y] = p.at(n.p, q);
      const [ex] = p.at([n.p[0] + n.r, n.p[1], n.p[2]], q);
      return `<circle class="pv-face pv-tile" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${Math.abs(ex - x).toFixed(1)}"/>`;
    }).join('');
    push(q, `<path class="pv-line" style="stroke-opacity:.8" d="${p.segs(links, q)}"/>${balls}`, 0.2);
  }
  {
    const q = s.ring;
    const ring = circle(RING, 48).map((v) => tilt(v, RING_TILT));
    const back = ring.filter((v) => v[2] < 0), front = ring.filter((v) => v[2] >= 0);
    push(q, `<path class="pv-line" d="${p.line(back, q)}"/>${p.box(CUBE, CUBE, CUBE, q, 'pv-face pv-tile')}<path class="pv-line" style="stroke-opacity:1" d="${p.line(front, q)}"/>`, 0.2);
  }
  {
    const q = s.steps;
    push(q, MINI_STEPS.map(([x, h]) => p.box(MINI_STEP.w, h, MINI_STEP.d, q, 'pv-face', [x, MINI_STEP.base + h / 2, 0])).join(''), 0.2);
  }
  {
    const q = s.pin;
    const [hx, hy] = p.at([0, PIN.len, 0], q);
    const [ex] = p.at([PIN.head, PIN.len, 0], q);
    const r = Math.abs(ex - hx);
    const [tx, ty] = p.at([0, 0, 0], q);
    push(q, `<polygon class="pv-face pv-tile" points="${tx.toFixed(1)},${ty.toFixed(1)} ${(hx - r * 0.86).toFixed(1)},${(hy + r * 0.5).toFixed(1)} ${(hx + r * 0.86).toFixed(1)},${(hy + r * 0.5).toFixed(1)}"/><circle class="pv-face pv-tile" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${r.toFixed(1)}"/><circle class="pv-line" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${(r * 0.38).toFixed(1)}"/>`, 0.4);
  }
  {
    const q = s.db;
    const discs = [0, 1, 2].map((n) => {
      const y = discY(n);
      const top = circle(DISC.r, 32, 'xz', [0, y + DISC.h / 2, 0]);
      const bot = circle(DISC.r, 32, 'xz', [0, y - DISC.h / 2, 0]);
      return `<polygon class="pv-face pv-tile" points="${p.hull([...top, ...bot], q)}"/><path class="pv-line" d="${p.line(top, q, true)}"/>`;
    }).join('');
    push(q, discs, 0.2);
  }
  s.tiles.forEach((q) => push(q, p.box(TILE.w, TILE.h, TILE.d, q, 'pv-face pv-tile') + `<path class="pv-line" d="${p.segs(TILE_LINES, q)}"/>`, 0.3));

  out.sort((a, c) => a.depth - c.depth);
  return p.glow(glowId, SHADOW) + out.map((x) => x.svg).join('');
}
