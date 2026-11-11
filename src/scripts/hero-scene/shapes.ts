import { rng } from './noise';

/* Las figuras de la escultura: una por línea del catálogo, dibujadas con puntos.
   Cada figura es una nube de N puntos (x, y, z, tono) en un espacio de ±1,2 de
   ancho y ±1 de alto; z es la profundidad, que es lo que hace que al girar se
   lea como un objeto y no como un icono plano.

   Tonos: 0 crema · 1 cobre · 2 granate · 3 apagado (detalle secundario). */

export type ShapeId = 'WEB' | 'APP' | 'IA' | 'MNT' | 'SEO' | 'SYS';

type Pt = [number, number, number, number];

/** Lápiz de puntos: cada primitiva reparte puntos según su longitud o su área. */
class Pen {
  pts: Pt[] = [];
  private r: () => number;
  constructor(seed: number, private density = 1) {
    this.r = rng(seed);
  }
  private j() {
    return (this.r() - 0.5) * 0.006;
  }
  dot(x: number, y: number, z: number, tone: number) {
    this.pts.push([x + this.j(), y + this.j(), z + this.j(), tone]);
  }
  seg3(a: [number, number, number], b: [number, number, number], tone: number, weight = 1) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const n = Math.max(2, Math.round(len * 230 * this.density * weight));
    for (let i = 0; i < n; i++) {
      const t = (i + this.r()) / n;
      this.dot(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, tone);
    }
  }
  seg(x1: number, y1: number, x2: number, y2: number, z: number, tone: number, weight = 1) {
    this.seg3([x1, y1, z], [x2, y2, z], tone, weight);
  }
  poly(points: Array<[number, number]>, z: number, tone: number, closed = false, weight = 1) {
    for (let i = 0; i < points.length - (closed ? 0 : 1); i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      this.seg(a[0], a[1], b[0], b[1], z, tone, weight);
    }
  }
  arc(cx: number, cy: number, r: number, a0: number, a1: number, z: number, tone: number, weight = 1) {
    const n = Math.max(3, Math.round(Math.abs(a1 - a0) * r * 230 * this.density * weight));
    for (let i = 0; i < n; i++) {
      const a = a0 + ((a1 - a0) * (i + this.r())) / n;
      this.dot(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z, tone);
    }
  }
  circ(cx: number, cy: number, r: number, z: number, tone: number, weight = 1) {
    this.arc(cx, cy, r, 0, Math.PI * 2, z, tone, weight);
  }
  disc(cx: number, cy: number, r: number, z: number, tone: number, weight = 1) {
    const n = Math.max(4, Math.round(Math.PI * r * r * 5200 * this.density * weight));
    for (let i = 0; i < n; i++) {
      const a = this.r() * Math.PI * 2;
      const q = Math.sqrt(this.r()) * r;
      this.dot(cx + Math.cos(a) * q, cy + Math.sin(a) * q, z, tone);
    }
  }
  /** Rectángulo de esquinas redondeadas, solo el contorno. */
  rrect(cx: number, cy: number, w: number, h: number, r: number, z: number, tone: number, weight = 1) {
    const x0 = cx - w / 2;
    const x1 = cx + w / 2;
    const y0 = cy - h / 2;
    const y1 = cy + h / 2;
    this.seg(x0 + r, y0, x1 - r, y0, z, tone, weight);
    this.seg(x0 + r, y1, x1 - r, y1, z, tone, weight);
    this.seg(x0, y0 + r, x0, y1 - r, z, tone, weight);
    this.seg(x1, y0 + r, x1, y1 - r, z, tone, weight);
    if (r > 0) {
      const q = Math.PI / 2;
      this.arc(x1 - r, y1 - r, r, 0, q, z, tone, weight);
      this.arc(x0 + r, y1 - r, r, q, 2 * q, z, tone, weight);
      this.arc(x0 + r, y0 + r, r, 2 * q, 3 * q, z, tone, weight);
      this.arc(x1 - r, y0 + r, r, 3 * q, 4 * q, z, tone, weight);
    }
  }
  /** Rectángulo relleno. */
  fill(cx: number, cy: number, w: number, h: number, z: number, tone: number, weight = 1) {
    const n = Math.max(4, Math.round(w * h * 5200 * this.density * weight));
    for (let i = 0; i < n; i++) this.dot(cx + (this.r() - 0.5) * w, cy + (this.r() - 0.5) * h, z, tone);
  }
  /** Caja en alambre. */
  box(cx: number, cy: number, cz: number, w: number, h: number, d: number, tone: number, weight = 1) {
    const X = [cx - w / 2, cx + w / 2];
    const Y = [cy - h / 2, cy + h / 2];
    const Z = [cz - d / 2, cz + d / 2];
    for (const y of Y) for (const z of Z) this.seg3([X[0], y, z], [X[1], y, z], tone, weight);
    for (const x of X) for (const z of Z) this.seg3([x, Y[0], z], [x, Y[1], z], tone, weight);
    for (const x of X) for (const y of Y) this.seg3([x, y, Z[0]], [x, y, Z[1]], tone, weight);
  }
  /** Anillo horizontal (en el plano XZ). */
  ring(cx: number, y: number, cz: number, rx: number, rz: number, tone: number, weight = 1) {
    const n = Math.round(Math.PI * (rx + rz) * 230 * this.density * weight);
    for (let i = 0; i < n; i++) {
      const a = ((i + this.r()) / n) * Math.PI * 2;
      this.dot(cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz, tone);
    }
  }
  /** Rueda dentada. */
  gear(cx: number, cy: number, R: number, teeth: number, z: number, tone: number, phase = 0) {
    const inner = R * 0.82;
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a = phase + i * step;
      const [a0, a1, a2, a3] = [a, a + step * 0.28, a + step * 0.5, a + step * 0.78];
      this.arc(cx, cy, R, a0, a1, z, tone);
      this.seg(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, cx + Math.cos(a2) * inner, cy + Math.sin(a2) * inner, z, tone);
      this.arc(cx, cy, inner, a2, a3, z, tone);
      this.seg(cx + Math.cos(a3) * inner, cy + Math.sin(a3) * inner, cx + Math.cos(a + step) * R, cy + Math.sin(a + step) * R, z, tone);
    }
    this.circ(cx, cy, R * 0.6, z, 3);
    this.circ(cx, cy, R * 0.2, z, tone);
    for (let i = 0; i < 6; i++) {
      const a = phase + (i / 6) * Math.PI * 2;
      this.seg(cx + Math.cos(a) * R * 0.2, cy + Math.sin(a) * R * 0.2, cx + Math.cos(a) * R * 0.6, cy + Math.sin(a) * R * 0.6, z, 3);
    }
  }
}

/** Una web: ventana de navegador con titular, botón, imagen y tres tarjetas, por capas. */
function web(p: Pen) {
  p.rrect(0, 0, 2.3, 1.6, 0.08, 0, 0, 1.3);
  p.seg(-1.15, 0.56, 1.15, 0.56, 0, 0);
  p.disc(-1.02, 0.68, 0.026, 0, 2, 3);
  p.disc(-0.93, 0.68, 0.026, 0, 1, 3);
  p.disc(-0.84, 0.68, 0.026, 0, 0, 3);
  p.rrect(0.12, 0.68, 1.3, 0.1, 0.05, 0, 3);
  // Titular, texto y botones, un poco hacia delante.
  p.fill(-0.56, 0.27, 0.9, 0.085, 0.16, 0, 1.6);
  p.fill(-0.66, 0.13, 0.7, 0.085, 0.16, 0, 1.6);
  p.fill(-0.61, -0.03, 0.8, 0.026, 0.16, 3);
  p.fill(-0.69, -0.1, 0.64, 0.026, 0.16, 3);
  p.fill(-0.83, -0.29, 0.36, 0.12, 0.16, 1, 1.8);
  p.rrect(-0.41, -0.29, 0.36, 0.12, 0.03, 0.16, 0);
  // Imagen, más adelante todavía.
  p.rrect(0.62, 0.08, 0.8, 0.64, 0.04, 0.3, 0);
  p.poly([[0.26, -0.2], [0.48, 0.1], [0.62, -0.06], [0.8, 0.2], [0.98, -0.2]], 0.3, 1);
  p.circ(0.86, 0.27, 0.055, 0.3, 1, 1.5);
  // Tres tarjetas.
  for (const x of [-0.74, 0, 0.74]) {
    p.rrect(x, -0.6, 0.64, 0.26, 0.03, 0.06, 0);
    p.fill(x - 0.1, -0.55, 0.32, 0.022, 0.06, 3);
    p.fill(x - 0.16, -0.63, 0.2, 0.022, 0.06, 3);
  }
  // Cursor.
  p.poly([[-0.72, -0.36], [-0.72, -0.56], [-0.66, -0.5], [-0.6, -0.6], [-0.57, -0.585], [-0.63, -0.485], [-0.56, -0.47]], 0.5, 0, true, 1.4);
}

/** Una app: un móvil con su pantalla y, flotando fuera, una notificación y un chat. */
function app(p: Pen) {
  const x = -0.32;
  p.rrect(x, 0, 0.98, 1.88, 0.15, 0, 0, 1.4);
  p.rrect(x, 0, 0.98, 1.88, 0.15, -0.1, 3);
  p.rrect(x, 0, 0.88, 1.76, 0.1, 0.01, 3, 0.7);
  p.fill(x, 0.83, 0.24, 0.045, 0.01, 0);
  // Cabecera.
  p.circ(x - 0.31, 0.62, 0.075, 0.04, 1, 1.4);
  p.fill(x + 0.02, 0.65, 0.4, 0.03, 0.04, 0);
  p.fill(x - 0.04, 0.585, 0.28, 0.024, 0.04, 3);
  // Tarjeta principal.
  p.rrect(x, 0.3, 0.76, 0.34, 0.05, 0.08, 1, 1.2);
  p.poly([[x - 0.3, 0.2], [x - 0.16, 0.3], [x - 0.04, 0.24], [x + 0.1, 0.37], [x + 0.3, 0.33]], 0.08, 1);
  // Lista.
  for (const y of [-0.06, -0.31, -0.56]) {
    p.rrect(x, y, 0.76, 0.2, 0.04, 0.04, 0);
    p.disc(x - 0.28, y, 0.045, 0.04, y === -0.06 ? 1 : 0, 2);
    p.fill(x + 0.04, y + 0.035, 0.38, 0.024, 0.04, 0);
    p.fill(x - 0.03, y - 0.035, 0.24, 0.022, 0.04, 3);
  }
  for (let i = 0; i < 4; i++) p.disc(x - 0.27 + i * 0.18, -0.8, 0.026, 0.04, i === 0 ? 1 : 3, 3);
  // Notificación, saliendo de la pantalla.
  p.rrect(0.7, 0.52, 0.82, 0.27, 0.06, 0.5, 1, 1.3);
  p.disc(0.4, 0.52, 0.055, 0.5, 1, 2);
  p.fill(0.78, 0.565, 0.46, 0.03, 0.5, 0);
  p.fill(0.72, 0.485, 0.34, 0.024, 0.5, 3);
  // Burbujas de chat.
  p.rrect(0.82, -0.2, 0.62, 0.2, 0.09, 0.34, 0);
  p.fill(0.8, -0.2, 0.4, 0.026, 0.34, 0);
  p.rrect(0.62, -0.5, 0.5, 0.2, 0.09, 0.22, 3);
  p.fill(0.6, -0.5, 0.3, 0.026, 0.22, 3);
}

/** Inteligencia artificial: una red neuronal, con un camino encendido y una órbita. */
function ia(p: Pen) {
  const layers = [
    { x: -1.0, z: -0.3, ys: [0.5, 0, -0.5] },
    { x: -0.36, z: 0.12, ys: [0.76, 0.38, 0, -0.38, -0.76] },
    { x: 0.3, z: 0.12, ys: [0.76, 0.38, 0, -0.38, -0.76] },
    { x: 0.96, z: -0.3, ys: [0.3, -0.3] },
  ];
  const hot = [1, 1, 3, 0]; // el camino que se enciende, un nodo por capa
  for (let l = 0; l < layers.length - 1; l++) {
    const a = layers[l];
    const b = layers[l + 1];
    a.ys.forEach((ya, i) =>
      b.ys.forEach((yb, k) => {
        const lit = hot[l] === i && hot[l + 1] === k;
        p.seg3([a.x, ya, a.z], [b.x, yb, b.z], lit ? 1 : 3, lit ? 2.4 : 0.36);
      }),
    );
  }
  layers.forEach((layer, l) =>
    layer.ys.forEach((y, i) => {
      const lit = hot[l] === i;
      p.circ(layer.x, y, 0.075, layer.z, lit ? 1 : 0, 1.6);
      p.disc(layer.x, y, lit ? 0.05 : 0.022, layer.z, lit ? 1 : 0, 2.5);
    }),
  );
  // Órbita inclinada, con su satélite.
  const n = 520;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    p.dot(Math.cos(a) * 1.22, Math.sin(a) * 0.5 + Math.cos(a) * 0.2, Math.sin(a) * 0.75, 3);
  }
  p.disc(1.22, 0.2, 0.04, 0, 1, 3);
}

/** Mantenimiento: tres engranajes que engranan. */
function mnt(p: Pen) {
  p.gear(-0.34, -0.1, 0.74, 14, 0, 0, 0.1);
  p.gear(0.66, 0.44, 0.4, 8, 0.2, 1, 0.3);
  p.gear(0.62, -0.56, 0.3, 6, -0.16, 0, 0.5);
  // Pulso: sigue vivo.
  p.poly([[-1.1, -0.1], [-0.72, -0.1], [-0.62, 0.06], [-0.5, -0.32], [-0.36, 0.26], [-0.24, -0.1], [0.02, -0.1]], 0.36, 1, false, 1.6);
}

/** Posicionamiento: una búsqueda, cinco barras que suben y la tendencia. */
function seo(p: Pen) {
  p.rrect(-0.1, 0.72, 1.8, 0.22, 0.11, 0.1, 0, 1.2);
  p.circ(-0.82, 0.735, 0.05, 0.1, 1, 2);
  p.seg(-0.785, 0.7, -0.74, 0.655, 0.1, 1, 2);
  p.fill(-0.3, 0.72, 0.66, 0.028, 0.1, 3);
  const heights = [0.22, 0.38, 0.5, 0.74, 1.04];
  const tops: Array<[number, number]> = [];
  heights.forEach((h, i) => {
    const x = -0.84 + i * 0.4;
    const last = i === heights.length - 1;
    p.rrect(x, -0.74 + h / 2, 0.26, h, 0.02, 0, last ? 1 : 0, 1.1);
    if (last) p.fill(x, -0.74 + h / 2, 0.24, h - 0.02, 0, 1, 0.5);
    else p.fill(x, -0.74 + h - 0.03, 0.24, 0.04, 0, 0);
    tops.push([x, -0.74 + h + 0.1]);
  });
  p.seg(-1.1, -0.74, 1.05, -0.74, 0, 3);
  p.poly(tops, 0.3, 1, false, 1.6);
  const [tx, ty] = tops[tops.length - 1];
  p.poly([[tx - 0.13, ty - 0.02], [tx, ty], [tx - 0.04, ty - 0.14]], 0.3, 1, false, 1.6);
  tops.forEach(([x, y]) => p.disc(x, y, 0.03, 0.3, 1, 2.5));
}

/** Sistemas: un rack de cuatro servidores, con sus leds, y el enlace que sube. */
function sys(p: Pen) {
  [0.63, 0.21, -0.21, -0.63].forEach((y, i) => {
    p.box(0, y, 0, 2.0, 0.34, 0.9, 0, 0.5);
    p.rrect(0, y, 2.0, 0.34, 0.02, 0.45, 0, 1.5);
    for (let k = 0; k < 4; k++) p.disc(-0.86 + k * 0.1, y, 0.026, 0.45, k === i % 4 ? 2 : 1, 5);
    for (let k = 0; k < 5; k++) p.rrect(-0.28 + k * 0.17, y, 0.13, 0.2, 0.01, 0.45, k === (i * 2) % 5 ? 1 : 3, 0.9);
    for (let k = 0; k < 6; k++) p.seg(0.62 + k * 0.055, y - 0.1, 0.62 + k * 0.055, y + 0.1, 0.45, 3);
  });
  // Enlace: tres columnas de datos que salen por arriba.
  for (const x of [-0.5, 0, 0.5]) {
    for (let k = 0; k < 9; k++) p.disc(x, 0.86 + k * 0.045, 0.012, -0.1, 1, 4);
  }
}

const BUILDERS: Record<ShapeId, (p: Pen) => void> = { WEB: web, APP: app, IA: ia, MNT: mnt, SEO: seo, SYS: sys };
export const SHAPE_ORDER: ShapeId[] = ['WEB', 'APP', 'IA', 'MNT', 'SEO', 'SYS'];

/** El suelo: anillos concéntricos bajo la escultura. Es igual en todas las
    figuras, así que esos puntos no se mueven al transformarse. */
function ground(count: number): Pt[] {
  const p = new Pen(999, 1);
  for (const r of [0.45, 0.8, 1.15, 1.5]) p.ring(0, -1.06, 0, r, r, 13, r > 1 ? 0.6 : 1);
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    p.seg3([Math.cos(a) * 1.5, -1.06, Math.sin(a) * 1.5], [Math.cos(a) * 1.62, -1.06, Math.sin(a) * 1.62], i % 4 === 0 ? 11 : 13, 2);
  }
  return fit(p.pts, count, 5);
}

/** Ajusta una nube a exactamente `count` puntos: baraja y recorta, o repite. */
function fit(pts: Pt[], count: number, seed: number): Pt[] {
  const r = rng(seed);
  const out = pts.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const k = Math.floor(r() * (i + 1));
    [out[i], out[k]] = [out[k], out[i]];
  }
  if (out.length > count) return out.slice(0, count);
  const base = out.length;
  while (out.length < count) {
    const s = out[Math.floor(r() * base)];
    out.push([s[0] + (r() - 0.5) * 0.008, s[1] + (r() - 0.5) * 0.008, s[2] + (r() - 0.5) * 0.008, s[3]]);
  }
  return out;
}

let floor: Pt[] | null = null;

/** Búfer de `count` puntos (x, y, z, tono) de una figura. Los últimos son
    siempre el suelo (tono + 10). Se pide de una en una: generar las seis de golpe
    sería una tarea larga en un móvil. */
export function buildShape(id: ShapeId, count: number): Float32Array {
  const groundCount = Math.round(count * 0.07);
  floor ??= ground(groundCount);
  const i = SHAPE_ORDER.indexOf(id);
  const pen = new Pen(100 + i * 17);
  BUILDERS[id](pen);
  const pts = fit(pen.pts, count - groundCount, 300 + i).concat(floor);
  const buf = new Float32Array(count * 4);
  pts.forEach((pt, k) => buf.set(pt, k * 4));
  return buf;
}
