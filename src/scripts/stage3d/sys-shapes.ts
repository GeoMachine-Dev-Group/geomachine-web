/**
 * Formas de la línea SYS («Sistemas y Backend»): módulos de servidor de vidrio
 * que encajan en un rack. Datos puros, sin three.js (ver glass-kit.ts).
 *
 * Juego fijo de 18 piezas que se interpolan entre servicios:
 * 5 módulos de rack · 2 raíles · 2 conectores de API · procesador ·
 * 2 módulos de memoria · gráfica · disco · 4 cables.
 */
import type { Pose, Vec3 } from './web-shapes';
import { circleSegs, pose, rectSegs, roundRectSegs, wire, type CardSpec, type Kit, type PieceSpec, type Seg } from './glass-kit';

/** Módulo de 1U: dos bahías de disco, rejilla, pilotos y botón. */
const MODULE: CardSpec = {
  kind: 'card', w: 1.7, h: 0.3, d: 1.0,
  glyph: [
    ...rectSegs(-0.78, -0.07, -0.5, 0.07),
    ...rectSegs(-0.45, -0.07, -0.17, 0.07),
    [-0.76, 0, -0.6, 0], [-0.43, 0, -0.27, 0],
    ...Array.from({ length: 6 }, (_, k): Seg => [-0.04 + k * 0.07, -0.08, -0.04 + k * 0.07, 0.08]),
    ...circleSegs(0.52, 0, 0.022, 8), ...circleSegs(0.6, 0, 0.022, 8),
    ...circleSegs(0.74, 0, 0.05, 14), [0.74, 0.01, 0.74, 0.06],
  ],
};
const RAIL: CardSpec = { kind: 'card', w: 0.07, h: 1.86, d: 0.07, tone: 'tile' };
/** Conector de API: placa con «< >». */
const PORT: CardSpec = {
  kind: 'card', w: 0.4, h: 0.4, d: 0.08, r: 0.07, tone: 'tile',
  glyph: [
    [-0.05, 0.08, -0.12, 0], [-0.12, 0, -0.05, -0.08],
    [0.05, 0.08, 0.12, 0], [0.12, 0, 0.05, -0.08],
    [0.025, 0.1, -0.025, -0.1],
  ],
};
const pins = (n: number, a: number, b: number, at: number): Seg[] =>
  Array.from({ length: n }, (_, k) => {
    const x = -at + (2 * at * k) / (n - 1);
    return [x, a, x, b];
  });
const CPU: CardSpec = {
  kind: 'card', w: 0.62, h: 0.62, d: 0.07, tone: 'tile',
  glyph: [
    ...rectSegs(-0.17, -0.17, 0.17, 0.17),
    ...rectSegs(-0.09, -0.09, 0.09, 0.09),
    ...pins(6, 0.21, 0.28, 0.15),
    ...pins(6, -0.21, -0.28, 0.15),
    ...pins(6, 0.21, 0.28, 0.15).map(([x1, y1, x2, y2]): Seg => [y1, x1, y2, x2]),
    ...pins(6, -0.21, -0.28, 0.15).map(([x1, y1, x2, y2]): Seg => [y1, x1, y2, x2]),
  ],
};
const RAM: CardSpec = {
  kind: 'card', w: 1.1, h: 0.24, d: 0.03,
  glyph: [
    ...[-0.4, -0.18, 0.04, 0.26].flatMap((x) => rectSegs(x - 0.08, -0.05, x + 0.08, 0.07)),
    ...pins(14, -0.09, -0.12, 0.48),
  ],
};
const GPU: CardSpec = {
  kind: 'card', w: 1.1, h: 0.46, d: 0.16,
  glyph: [
    ...circleSegs(-0.26, 0, 0.16, 22), ...circleSegs(-0.26, 0, 0.04, 10),
    ...circleSegs(0.24, 0, 0.16, 22), ...circleSegs(0.24, 0, 0.04, 10),
    ...[-0.26, 0.24].flatMap((cx) => [0, 1, 2].map((k): Seg => {
      const a = (k * 2 * Math.PI) / 3;
      return [cx + 0.045 * Math.cos(a), 0.045 * Math.sin(a), cx + 0.15 * Math.cos(a + 0.5), 0.15 * Math.sin(a + 0.5)];
    })),
    [0.46, 0.17, 0.46, -0.17],
  ],
};
const SSD: CardSpec = {
  kind: 'card', w: 0.6, h: 0.36, d: 0.05,
  glyph: [...roundRectSegs(-0.22, -0.1, 0.08, 0.1, 0.02), [0.16, 0.12, 0.16, -0.12], [0.22, 0.12, 0.22, -0.12]],
};

const MODULES = 5;
const WIRES = 4;

const PIECES: PieceSpec[] = [
  ...Array.from({ length: MODULES }, () => MODULE),
  RAIL, RAIL,
  PORT, PORT,
  CPU, RAM, RAM, GPU, SSD,
  ...Array.from({ length: WIRES }, (): PieceSpec => ({ kind: 'wire' })),
];

const I = { module: 0, rail: 5, port: 7, cpu: 9, ram: 10, gpu: 12, ssd: 13, wire: 14 };

/* --- Poses ---------------------------------------------------------------- */

const RACK: Vec3 = [-0.05, 0, -0.45];
const STEP = 0.355;
const moduleAt = (k: number): Vec3 => [RACK[0], RACK[1] + 2 * STEP - k * STEP, RACK[2]];
const CHASSIS: Vec3 = [0.2, -0.78, -0.45];
const CHASSIS_S = 1.12;

function base(): Pose[] {
  const s: Pose[] = [];
  for (let k = 0; k < MODULES; k++) s[I.module + k] = pose(CHASSIS, [0, 0, 0], 0, 0.9);
  s[I.rail] = pose([RACK[0] - 0.9, RACK[1], RACK[2] + 0.5], [0, 0, 0], 0, 0.9);
  s[I.rail + 1] = pose([RACK[0] + 0.9, RACK[1], RACK[2] + 0.5], [0, 0, 0], 0, 0.9);
  s[I.port] = pose([1.5, 0.35, 0.0], [0, -0.2, 0], 0, 0.6);
  s[I.port + 1] = pose([1.5, -0.4, 0.0], [0, -0.2, 0], 0, 0.6);
  // Componentes, recogidos dentro del chasis.
  for (let c = I.cpu; c <= I.ssd; c++) s[c] = pose([CHASSIS[0], CHASSIS[1], CHASSIS[2]], [-Math.PI / 2, 0, 0], 0, 0.5);
  for (let w = 0; w < WIRES; w++) s[I.wire + w] = wire([CHASSIS[0], CHASSIS[1], CHASSIS[2]], [CHASSIS[0], CHASSIS[1] + 0.3, CHASSIS[2]], 0);
  return s;
}

/** Pose de cada pieza para el servicio i de la línea SYS (0–1). */
export function sysShapes(i: number): Pose[] {
  const s = base();
  switch (i) {
    case 0: { // Infraestructura Linux: rack completo con conectores de API
      for (let k = 0; k < MODULES; k++) s[I.module + k] = pose(moduleAt(k));
      s[I.rail] = pose([RACK[0] - 0.89, RACK[1] - 0.0, RACK[2] + 0.52]);
      s[I.rail + 1] = pose([RACK[0] + 0.89, RACK[1] - 0.0, RACK[2] + 0.52]);
      const ports: Vec3[] = [[1.55, 0.4, -0.05], [1.55, -0.42, -0.05]];
      ports.forEach((p, n) => (s[I.port + n] = pose(p, [0, -0.25, 0])));
      // Dos módulos a cada conector, del costado del rack al borde de la placa.
      const from = [0, 1, 3, 4];
      from.forEach((k, w) => {
        const m = moduleAt(k);
        const p = ports[w < 2 ? 0 : 1];
        s[I.wire + w] = wire([m[0] + 0.85, m[1], m[2] + 0.25], [p[0] - 0.19, p[1] + (w % 2 ? -0.08 : 0.08), p[2] + 0.04]);
      });
      break;
    }
    case 1: { // Auditoría de hardware: chasis abierto y sus piezas en despiece
      s[I.module] = pose(CHASSIS, [0, 0, 0], 1, CHASSIS_S);
      // Delante, las piezas elegidas; detrás y apagadas, las descartadas.
      const tilt = -0.4;
      const parts: [number, Vec3, number, number][] = [
        [I.cpu, [-0.5, 0.08, -0.1], 0.12, 0],
        [I.gpu, [0.8, 0.14, -0.2], -0.14, 0],
        [I.ram, [0.18, 0.62, -0.65], 0, 0],
        [I.ram + 1, [0.42, 0.9, -1.05], -0.08, 1],
        [I.ssd, [-0.95, 0.62, -0.85], 0.2, 1],
      ];
      parts.forEach(([n, p, ry, dim]) => (s[n] = pose(p, [tilt, ry, 0], dim ? 0.55 : 1, 1, dim)));
      // Líneas de despiece: de cada pieza elegida a su sitio en el chasis.
      const top = CHASSIS[1] + 0.15 * CHASSIS_S;
      ([[I.cpu, -0.55], [I.ram, 0.0], [I.gpu, 0.55]] as const).forEach(([n, dx], w) => {
        const p = s[n].p;
        s[I.wire + w] = wire([p[0], p[1] - 0.16, p[2]], [CHASSIS[0] + dx, top, CHASSIS[2] + 0.1], 0.9);
      });
      break;
    }
  }
  return s;
}

export const SYS_KIT: Kit = { pieces: PIECES, poses: sysShapes };
