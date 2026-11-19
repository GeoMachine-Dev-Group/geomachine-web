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

/** Giro base de la pieza y cámara: compartidos por el lienzo y el SVG. */
export const PIECE_ROT: Vec3 = [0.14, -0.46, 0];
export const CAMERA = { z: 5.9, fov: 27 };

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

const hiddenSlab = (k: number) => pose([0, 0, -0.03 * k], [0, 0, 0], 0, 0.97);
const tileXY = (n: number): [number, number] => [((n % 3) - 1) * 0.44, 0.3 - Math.floor(n / 3) * 0.44];
const hiddenTile = (n: number, dx = 0) => pose([tileXY(n)[0] + dx, tileXY(n)[1], 0.03], [0, 0, 0], 0, 0.4);
const hiddenCart = () => pose([0.9, -0.8, 0.05], [0, -0.2, 0], 0, 0.5);

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
    case 1: // Corporativa: cinco hojas en abanico, la de delante algo levantada
      for (let k = 0; k < 5; k++) {
        s.slabs[k] = pose(
          [-0.42 + 0.3 * k, (k === 0 ? 0.16 : 0) - 0.03 * k, 0.25 - 0.42 * k],
          [0, 0.04 * k, -0.012 * k],
          1 - 0.15 * k,
        );
      }
      break;
    case 2: // Tienda: hoja con losetas de producto que se levantan y un carrito
      s.slabs[0] = pose([-0.15, 0, 0]);
      s.slabs[1] = pose([0.2, 0.06, -0.48], [0, 0.03, 0], 0.45);
      s.slabs[2] = pose([0.5, 0.12, -0.96], [0, 0.06, 0], 0.22);
      s.tiles = s.tiles.map((_, n) => pose([tileXY(n)[0] - 0.15, tileXY(n)[1] - 0.06, 0.18 + 0.05 * (n % 3)]));
      s.cart = pose([0.98, -0.62, 0.42], [0.05, -0.32, 0]);
      break;
    case 3: // Segundo idioma: la misma hoja duplicada, la copia girada detrás
      s.slabs[0] = pose([-0.28, -0.1, 0.22]);
      s.slabs[1] = pose([0.42, 0.2, -0.42], [0, 0.36, 0.05], 0.75);
      break;
    case 4: // Rediseño: la vieja (apagada) sale, la nueva entra nítida
      s.slabs[1] = pose([-1.3, -0.2, -0.6], [0.04, 0.5, -0.09], 0.42, 1, 1);
      s.slabs[2] = pose([-0.62, -0.08, -0.22], [0.02, 0.24, -0.045], 0.16, 1, 0.6);
      s.slabs[0] = pose([0.36, 0.06, 0.26], [0, -0.06, 0]);
      break;
  }
  return s;
}
