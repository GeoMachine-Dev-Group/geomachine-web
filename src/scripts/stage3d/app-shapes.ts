/**
 * Formas de la línea APP («Aplicaciones»): un móvil cuya pantalla son capas
 * de vidrio apiladas. Datos puros, sin three.js (ver glass-kit.ts).
 *
 * Juego fijo de 22 piezas que se interpolan entre servicios:
 * móvil · 3 capas (usuarios, datos, panel) · escritorio · icono de app ·
 * 2 módulos de integración · 10 bloques de hora · 4 cables.
 */
import type { Pose, Vec3 } from './web-shapes';
import { rotate } from './projection';
import {
  arcSegs, circleSegs, dashSegs, pose, rectSegs, roundRectSegs, wire,
  type CardSpec, type Kit, type PieceSpec, type Seg,
} from './glass-kit';

const PHONE: CardSpec = {
  kind: 'card', w: 0.92, h: 1.86, d: 0.08, r: 0.14,
  glyph: [
    [-0.1, 0.84, 0.1, 0.84],
    [-0.16, -0.85, 0.16, -0.85],
    ...roundRectSegs(-0.4, -0.78, 0.4, 0.76, 0.06),
  ],
};

/** Las tres capas de la pantalla. Cada una dibuja en su franja, así que
    apiladas componen una pantalla completa. */
const LAYER = { kind: 'card', w: 0.8, h: 1.54, d: 0.024, r: 0.06, ink: 0.9 } as const;
const USERS: Seg[] = [
  ...circleSegs(-0.2, 0.55, 0.085, 20),
  ...arcSegs(-0.2, 0.33, 0.15, 0.13, 0.15, Math.PI - 0.15, 12),
  [-0.34, 0.35, -0.06, 0.35],
  [0, 0.6, 0.3, 0.6], [0, 0.5, 0.22, 0.5], [0, 0.4, 0.26, 0.4],
];
const DATA: Seg[] = [
  ...arcSegs(-0.18, 0.13, 0.15, 0.045, 0, Math.PI * 2, 20),
  ...arcSegs(-0.18, 0.0, 0.15, 0.045, Math.PI, Math.PI * 2, 10),
  ...arcSegs(-0.18, -0.13, 0.15, 0.045, Math.PI, Math.PI * 2, 10),
  [-0.33, 0.13, -0.33, -0.13], [-0.03, 0.13, -0.03, -0.13],
  [0.06, 0.12, 0.3, 0.12], [0.06, 0.04, 0.3, 0.04], [0.06, -0.04, 0.3, -0.04], [0.06, -0.12, 0.3, -0.12],
  [0.14, 0.15, 0.14, -0.15],
];
const PANEL: Seg[] = [
  [-0.3, -0.68, 0.3, -0.68], [-0.3, -0.68, -0.3, -0.3],
  ...rectSegs(-0.24, -0.68, -0.14, -0.5),
  ...rectSegs(-0.09, -0.68, 0.01, -0.4),
  ...rectSegs(0.06, -0.68, 0.16, -0.55),
  ...rectSegs(0.21, -0.68, 0.29, -0.34),
];

const DESK: CardSpec = {
  kind: 'card', w: 2.0, h: 1.25, d: 0.05, r: 0.05,
  glyph: [
    [-0.94, 0.47, 0.94, 0.47],
    ...circleSegs(-0.88, 0.54, 0.022, 8), ...circleSegs(-0.81, 0.54, 0.022, 8), ...circleSegs(-0.74, 0.54, 0.022, 8),
    [-0.56, 0.47, -0.56, -0.56],
    [-0.88, 0.34, -0.66, 0.34], [-0.88, 0.24, -0.7, 0.24], [-0.88, 0.14, -0.66, 0.14],
    // Hueco donde se instala la app: un recuadro de puntos.
    ...dashSegs(0.06, 0.24, 0.42, 0.24, 6), ...dashSegs(0.42, 0.24, 0.42, -0.12, 6),
    ...dashSegs(0.42, -0.12, 0.06, -0.12, 6), ...dashSegs(0.06, -0.12, 0.06, 0.24, 6),
    [-0.4, -0.32, 0.8, -0.32], [-0.4, -0.42, 0.5, -0.42],
  ],
};

const ICON: CardSpec = {
  kind: 'card', w: 0.36, h: 0.36, d: 0.08, r: 0.09, tone: 'tile',
  glyph: [...circleSegs(0, 0, 0.08, 16), [-0.03, 0, 0.03, 0], [0, -0.03, 0, 0.03]],
};

/** Módulo de integración: pagos (tarjeta) y reservas (calendario). */
const HUB = { kind: 'card', w: 0.72, h: 0.72, d: 0.34 } as const;
const PAY: Seg[] = [
  ...roundRectSegs(-0.24, -0.15, 0.24, 0.15, 0.03),
  [-0.24, 0.06, 0.24, 0.06],
  ...rectSegs(-0.17, -0.08, -0.07, -0.01),
  [0.04, -0.08, 0.17, -0.08],
];
const CAL: Seg[] = [
  ...rectSegs(-0.22, -0.2, 0.22, 0.15),
  [-0.22, 0.06, 0.22, 0.06],
  [-0.11, 0.12, -0.11, 0.21], [0.11, 0.12, 0.11, 0.21],
  [-0.07, 0.06, -0.07, -0.2], [0.07, 0.06, 0.07, -0.2], [-0.22, -0.07, 0.22, -0.07],
  ...rectSegs(0.1, -0.17, 0.19, -0.1),
];

/** Bloque de una hora: un cubo con un reloj. */
const BLOCK: CardSpec = {
  kind: 'card', w: 0.27, h: 0.27, d: 0.27, tone: 'tile',
  glyph: [...circleSegs(0, 0, 0.085, 14), [0, 0, 0, 0.055], [0, 0, 0.04, 0]],
};

const BLOCKS = 10;
const WIRES = 4;

const PIECES: PieceSpec[] = [
  PHONE,
  { ...LAYER, glyph: USERS },
  { ...LAYER, glyph: DATA },
  { ...LAYER, glyph: PANEL },
  DESK,
  ICON,
  { ...HUB, glyph: PAY },
  { ...HUB, glyph: CAL },
  ...Array.from({ length: BLOCKS }, () => BLOCK),
  ...Array.from({ length: WIRES }, (): PieceSpec => ({ kind: 'wire' })),
];

const I = { phone: 0, layer: 1, desk: 4, icon: 5, hub: 6, block: 8, wire: 18 };

/* --- Poses ---------------------------------------------------------------- */

const PHONE_AT: Vec3 = [-0.6, -0.12, -0.3];
const SIZE = 1.05;
/** Rejilla de los bloques: 5 columnas × 2 filas, en el suelo. */
const blockAt = (n: number): Vec3 => [0.2 + ((n % 5) - 2) * 0.42, -0.62, -0.2 - Math.floor(n / 5) * 0.46];

/** Punto de la cara de una placa con esa pose (coordenadas locales x, y). */
const onCard = (q: Pose, x: number, y: number): Vec3 => {
  const [a, b, c] = rotate([x * q.s, y * q.s, 0], q.r);
  return [q.p[0] + a, q.p[1] + b, q.p[2] + c];
};

function base(): Pose[] {
  const s: Pose[] = [];
  s[I.phone] = pose([PHONE_AT[0], PHONE_AT[1], PHONE_AT[2] - 0.4], [0, 0, 0], 0, 0.9);
  for (let k = 0; k < 3; k++) s[I.layer + k] = pose([PHONE_AT[0], PHONE_AT[1] - 0.01, PHONE_AT[2] + 0.06], [0, 0, 0], 0, SIZE * 0.96);
  s[I.desk] = pose([0.85, 0.2, -1.5], [0, -0.1, 0], 0, 0.9);
  s[I.icon] = pose([PHONE_AT[0], PHONE_AT[1] + 0.2, PHONE_AT[2] + 0.1], [0, 0, 0], 0, 0.5);
  s[I.hub] = pose([-0.8, -0.05, -0.1], [0, 0.1, 0], 0, 0.8);
  s[I.hub + 1] = pose([1.3, -0.05, -0.6], [0, -0.1, 0], 0, 0.8);
  for (let n = 0; n < BLOCKS; n++) s[I.block + n] = pose(blockAt(n), [0, 0, 0], 0, 0.4);
  for (let w = 0; w < WIRES; w++) s[I.wire + w] = wire([0.3, -0.3, -0.4], [0.3, 0.3, -0.4], 0);
  return s;
}

/** Pose de cada pieza para el servicio i de la línea APP (0–4). */
export function appShapes(i: number): Pose[] {
  const s = base();
  switch (i) {
    case 0: { // MVP web: las tres capas salen de la pantalla del móvil, en despiece
      s[I.phone] = pose(PHONE_AT, [0, 0.1, 0], 1, SIZE);
      for (let k = 0; k < 3; k++) {
        const t = k + 1;
        s[I.layer + k] = pose(
          [PHONE_AT[0] + 0.5 * t, PHONE_AT[1] + 0.12 * t, PHONE_AT[2] + 0.2 * t],
          [0, 0.1, 0],
          1,
          SIZE,
        );
      }
      break;
    }
    case 1: { // Arquitectura backend: las capas, tumbadas y separadas, unidas por cables
      const tilt: Vec3 = [-1.15, 0, Math.PI / 2];
      const ys = [0.66, -0.04, -0.74];
      ys.forEach((y, k) => (s[I.layer + k] = pose([0.3, y, -0.45], tilt, 1, 1.45)));
      // Dos cables entre cada par de capas: uno delante a la izquierda y otro
      // detrás a la derecha, con un nodo en cada extremo.
      const anchors: [number, number][] = [[0.22, 0.6], [-0.22, -0.6]];
      for (let w = 0; w < WIRES; w++) {
        const k = Math.floor(w / 2);
        const [x, y] = anchors[w % 2];
        const a = onCard(s[I.layer + k], x, y);
        const b = onCard(s[I.layer + k + 1], x, y);
        s[I.wire + w] = wire(a, b);
        s[I.block + 2 * w] = pose(a, [0, 0, 0], 1, 0.3);
        s[I.block + 2 * w + 1] = pose(b, [0, 0, 0], 1, 0.3);
      }
      s[I.phone] = pose([PHONE_AT[0], PHONE_AT[1], PHONE_AT[2] - 0.6], [0, 0, 0], 0, 0.9);
      break;
    }
    case 2: { // Bolsa de horas: diez bloques; tres ya se han usado y suben
      for (let n = 0; n < BLOCKS; n++) s[I.block + n] = pose(blockAt(n), [0, 0, 0], 1, 1.35);
      const used = [4, 9, 3];
      used.forEach((n, m) => {
        const [x, y, z] = blockAt(n);
        s[I.block + n] = pose(
          [x + 0.12 + 0.08 * m, y + 0.62 + 0.5 * m, z + 0.1 * m],
          [0.1 * (m + 1), -0.3 * (m + 1), 0.08 * (m + 1)],
          1 - 0.2 * m,
          1.35,
        );
      });
      break;
    }
    case 3: { // PWA: el icono despega del móvil hacia el escritorio
      const ph: Vec3 = [-0.85, -0.2, 0.25];
      s[I.phone] = pose(ph, [0, 0.22, 0], 1, 0.9);
      s[I.layer] = pose([ph[0] + 0.02, ph[1] - 0.01, ph[2] + 0.06], [0, 0.22, 0], 0.55, 0.88);
      s[I.desk] = pose([0.9, 0.15, -0.95], [0, -0.12, 0], 1, 1.08);
      s[I.icon] = pose([0.05, 0.62, -0.25], [0.15, -0.2, 0.12], 1, 1.35);
      // Estela: tres bloques pequeñísimos sobre el arco.
      const trail: Vec3[] = [[-0.62, 0.25, 0.12], [-0.42, 0.48, 0.0], [-0.2, 0.6, -0.12]];
      trail.forEach((p, m) => (s[I.block + m] = pose(p, [0, 0, 0], 0.5 + 0.2 * m, 0.24)));
      break;
    }
    case 4: { // Integraciones: dos módulos unidos por cables, con datos en tránsito
      const a: Vec3 = [-0.75, -0.1, 0.05];
      const b: Vec3 = [1.3, -0.1, -0.65];
      const S = 1.25;
      s[I.hub] = pose(a, [0, 0.12, 0], 1, S);
      s[I.hub + 1] = pose(b, [0, -0.12, 0], 1, S);
      const half = 0.36 * S;
      const offs = [0.2, 0, -0.2];
      const at = (t: number, dy: number): Vec3 => [lerp(a[0] + half, b[0] - half, t), a[1] + dy, lerp(a[2] - 0.05, b[2] + 0.05, t)];
      offs.forEach((dy, w) => (s[I.wire + w] = wire(at(0, dy), at(1, dy))));
      s[I.block] = pose(at(0.3, 0.2), [0, 0, 0], 1, 0.5);
      s[I.block + 1] = pose(at(0.62, -0.2), [0, 0, 0], 1, 0.5);
      s[I.block + 2] = pose(at(0.82, 0), [0, 0, 0], 0.6, 0.38);
      break;
    }
  }
  return s;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const APP_KIT: Kit = { pieces: PIECES, poses: appShapes };
