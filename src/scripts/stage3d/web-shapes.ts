/**
 * Formas de la línea WEB: «la pieza crece con el servicio». Datos puros, sin
 * three.js, porque los usan dos sitios:
 * - web.ts, que interpola un juego fijo de piezas (6 hojas, 9 losetas y un
 *   carrito) entre estas poses al cambiar de pestaña;
 * - StageVisual.astro, que proyecta las mismas poses a un SVG estático (lo que
 *   se ve sin JS, sin WebGL o antes de que cargue el lienzo).
 *
 * Coordenadas: unidades de la escena, en el espacio de la "pieza" (un grupo
 * que el lienzo gira con PIECE_ROT, el reposo y el puntero).
 */

export type Vec3 = [number, number, number];

export interface Pose {
  /** Posición. */
  p: Vec3;
  /** Rotación (euler XYZ, radianes). */
  r: Vec3;
  /** Escala uniforme. */
  s: number;
  /** Opacidad 0–1. */
  o: number;
  /** 0 = nítida, 1 = la hoja vieja: más apagada y más rugosa. */
  dim: number;
}

export interface ShapeSet {
  slabs: Pose[];
  tiles: Pose[];
  cart: Pose;
}

export const SLAB = { w: 1.5, h: 2, d: 0.05 };
export const TILE = { w: 0.34, h: 0.34, d: 0.06 };
export const CART = { w: 0.56, h: 0.36, d: 0.34 };
export const SLAB_COUNT = 6;
export const TILE_COUNT = 9;

/** Giro base de la pieza: compartido por el lienzo y el SVG. */
export const PIECE_ROT: Vec3 = [0.06, -0.16, 0];

/**
 * Cámara en perspectiva algo elevada y a la derecha, mirando un poco por
 * debajo del centro. La distancia se calcula para que quepa una caja de
 * 2·halfW × 2·halfH unidades sea cual sea la proporción del lienzo.
 */
export const CAMERA = {
  fov: 32,
  dir: [0.32, 0.4, 1] as Vec3,
  target: [0.25, -0.05, -0.55] as Vec3,
  halfW: 2.35,
  halfH: 1.58,
};

/** Sombra de contacto: un plano con degradado radial bajo la pieza. */
export const SHADOW = { y: -1.3, z: -0.7, w: 5.2, d: 3.6 };

const norm = (v: Vec3): Vec3 => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
};

export function cameraDistance(aspect: number) {
  const t = Math.tan(((CAMERA.fov / 2) * Math.PI) / 180);
  return Math.max(CAMERA.halfH / t, CAMERA.halfW / (t * aspect));
}

/** Posición de la cámara para un lienzo de esa proporción. */
export function cameraEye(aspect: number): Vec3 {
  const d = norm(CAMERA.dir);
  const k = cameraDistance(aspect);
  return [CAMERA.target[0] + d[0] * k, CAMERA.target[1] + d[1] * k, CAMERA.target[2] + d[2] * k];
}

/**
 * Líneas finas de cobre sobre la cara de cada hoja, como un boceto de página:
 * cabecera, hero con título y botón, un bloque de texto y un formulario.
 * Segmentos [x1, y1, x2, y2] en coordenadas locales de la hoja.
 */
const rect = (x1: number, y1: number, x2: number, y2: number) => [
  [x1, y1, x2, y1], [x2, y1, x2, y2], [x2, y2, x1, y2], [x1, y2, x1, y1],
];
export const PAGE_LINES: number[][] = [
  // cabecera: marca y tres enlaces
  [-0.6, 0.84, -0.32, 0.84], [0.18, 0.84, 0.28, 0.84], [0.34, 0.84, 0.44, 0.84], [0.5, 0.84, 0.6, 0.84],
  // hero
  ...rect(-0.6, 0.72, 0.6, 0.16),
  [-0.48, 0.56, 0.22, 0.56], [-0.48, 0.46, 0.02, 0.46],
  ...rect(-0.48, 0.34, -0.2, 0.26),
  // bloque de texto
  [-0.6, 0.02, 0.6, 0.02], [-0.6, -0.08, 0.48, -0.08], [-0.6, -0.18, 0.28, -0.18],
  // formulario: dos campos y botón
  ...rect(-0.6, -0.34, 0.6, -0.44),
  ...rect(-0.6, -0.52, 0.6, -0.62),
  ...rect(0.24, -0.72, 0.6, -0.84),
];

const pose = (p: Vec3, r: Vec3 = [0, 0, 0], o = 1, s = 1, dim = 0): Pose => ({ p, r, s, o, dim });

const hiddenSlab = (k: number) => pose([0, 0, -0.05 * k], [0, 0, 0], 0, 0.97);
const tileXY = (n: number): [number, number] => [((n % 3) - 1) * 0.44, 0.3 - Math.floor(n / 3) * 0.44];
const hiddenTile = (n: number) => pose([tileXY(n)[0], tileXY(n)[1], 0.03], [0, 0, 0], 0, 0.4);
const hiddenCart = () => pose([0.9, -0.6, 0.05], [0, -0.2, 0], 0, 0.5);

function base(): ShapeSet {
  return {
    slabs: Array.from({ length: SLAB_COUNT }, (_, k) => hiddenSlab(k)),
    tiles: Array.from({ length: TILE_COUNT }, (_, n) => hiddenTile(n)),
    cart: hiddenCart(),
  };
}

/** Pose de cada pieza para el servicio i de la línea WEB (0–4). */
export function webShapes(i: number): ShapeSet {
  const s = base();
  switch (i) {
    case 0: // Landing: una sola hoja
      s.slabs[0] = pose([0, 0, 0]);
      break;
    case 1: // Corporativa: cinco hojas en abanico hacia el fondo, la de delante levantada
      for (let k = 0; k < 5; k++) {
        s.slabs[k] = pose(
          [-0.45 + 0.24 * k, (k === 0 ? 0.18 : 0) - 0.04 * k, 0.45 - 0.68 * k],
          [0, 0.05 * k, -0.014 * k],
          1 - 0.15 * k,
        );
      }
      break;
    case 2: // Tienda: hoja con losetas de producto que se levantan y un carrito
      s.slabs[0] = pose([-0.15, 0, 0.2]);
      s.slabs[1] = pose([0.25, 0.08, -0.65], [0, 0.04, 0], 0.45);
      s.slabs[2] = pose([0.62, 0.15, -1.5], [0, 0.08, 0], 0.22);
      s.tiles = s.tiles.map((_, n) => pose([tileXY(n)[0] - 0.15, tileXY(n)[1] - 0.06, 0.42 + 0.08 * (n % 3)]));
      s.cart = pose([0.98, -0.3, 0.75], [0.05, -0.32, 0]);
      break;
    case 3: // Segundo idioma: la misma hoja duplicada, la copia girada detrás
      s.slabs[0] = pose([-0.32, -0.1, 0.4]);
      s.slabs[1] = pose([0.5, 0.22, -0.75], [0, 0.4, 0.05], 0.75);
      break;
    case 4: // Rediseño: la vieja (apagada) sale, la nueva entra nítida
      s.slabs[1] = pose([-1.75, -0.18, -0.7], [0.04, 0.5, -0.09], 0.42, 1, 1);
      s.slabs[2] = pose([-0.88, -0.07, -0.25], [0.02, 0.24, -0.045], 0.16, 1, 0.6);
      s.slabs[0] = pose([0.4, 0.06, 0.4], [0, -0.06, 0]);
      break;
  }
  return s;
}

/** Versión "desmontada" de una pose para la entrada: algo dispersa, más
    atrás y transparente. Determinista (sin Math.random) por pieza. */
export function scattered(q: Pose, n: number): Pose {
  const h = (k: number) => {
    const x = Math.sin((n + 1) * 12.9898 + k * 78.233) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1;
  };
  return {
    p: [q.p[0] + h(1) * 0.7, q.p[1] + h(2) * 0.45 - 0.2, q.p[2] - 1.1 + h(3) * 0.4],
    r: [q.r[0] + h(4) * 0.25, q.r[1] + h(5) * 0.35, q.r[2] + h(6) * 0.12],
    s: q.s * 0.92,
    o: 0,
    dim: q.dim,
  };
}
