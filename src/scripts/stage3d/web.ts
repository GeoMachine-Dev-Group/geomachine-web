/**
 * Pieza 3D de la línea WEB (piloto): hojas de vidrio ahumado con cantos de
 * cobre que crecen con el servicio (ver web-shapes.ts). Se importa con
 * import() desde ServiceStage.astro; three.js viaja en este trozo.
 */
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshPhysicalMaterial,
} from 'three';
import { mountStage3D, type PieceItem, type ShapePlugin, type Tokens } from './core';
import {
  CAMERA, CART, PAGE_LINES, PIECE_ROT, SHADOW, SLAB, SLAB_COUNT, TILE, TILE_COUNT,
  cameraEye, cameraTarget, scattered, webShapes,
} from './web-shapes';

/** Vidrio. `soft` para las piezas pequeñas (losetas y carrito): menos barniz
    y menos reflejo del entorno, para que no brillen más que las hojas. */
function glass(tint: Color, soft = false) {
  return new MeshPhysicalMaterial({
    envMapIntensity: soft ? 0.35 : 1,
    color: tint,
    metalness: 0,
    roughness: 0.28,
    clearcoat: soft ? 0.25 : 1,
    clearcoatRoughness: soft ? 0.5 : 0.18,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
}

function lines(color: Color) {
  return new LineBasicMaterial({ color, transparent: true, depthWrite: false });
}

const webPlugin: ShapePlugin = {
  pieceRotation: PIECE_ROT,
  camera: { fov: CAMERA.fov, target: cameraTarget, eye: cameraEye },
  shadow: SHADOW,
  scattered,

  build(root: Group, t: Tokens): PieceItem[] {
    // Vidrio verde oscuro: el panel con un punto de cobre y algo de luz.
    const tint = t.panel2.clone().offsetHSL(0.01, 0.1, 0.03);
    const worn = t.inkSoft.clone().lerp(t.panel2, 0.55);

    const slabGeo = new BoxGeometry(SLAB.w, SLAB.h, SLAB.d);
    const slabEdges = new EdgesGeometry(slabGeo);
    const pageGeo = new BufferGeometry();
    const z = SLAB.d / 2 + 0.004;
    pageGeo.setAttribute(
      'position',
      new Float32BufferAttribute(PAGE_LINES.flatMap(([x1, y1, x2, y2]) => [x1, y1, z, x2, y2, z]), 3),
    );
    const tileGeo = new BoxGeometry(TILE.w, TILE.h, TILE.d);
    const tileEdges = new EdgesGeometry(tileGeo);
    const cartGeo = new BoxGeometry(CART.w, CART.h, CART.d);
    const cartEdges = new EdgesGeometry(cartGeo);
    const handleGeo = new BufferGeometry();
    const hx = CART.w / 2, hy = CART.h / 2, hz = CART.d / 2;
    handleGeo.setAttribute('position', new Float32BufferAttribute([
      -hx, hy, -hz, -hx - 0.1, hy + 0.2, -hz,
      -hx - 0.1, hy + 0.2, -hz, -hx - 0.24, hy + 0.2, -hz,
    ], 3));

    const items: PieceItem[] = [];

    for (let k = 0; k < SLAB_COUNT; k++) {
      const g = new Group();
      const body = glass(tint.clone());
      const edge = lines(t.accent.clone());
      const page = lines(t.accent.clone());
      g.add(new Mesh(slabGeo, body), new LineSegments(slabEdges, edge), new LineSegments(pageGeo, page));
      root.add(g);
      items.push({
        object: g,
        look(o, dim) {
          g.visible = o > 0.005;
          body.opacity = o * lerp(0.5, 0.3, dim);
          body.roughness = lerp(0.28, 0.9, dim);
          body.color.copy(tint).lerp(worn, dim * 0.7);
          edge.opacity = o * lerp(0.95, 0.4, dim);
          edge.color.copy(t.accent).lerp(t.inkSoft, dim);
          page.opacity = o * lerp(0.5, 0.18, dim);
          page.color.copy(t.accent).lerp(t.inkSoft, dim);
        },
      });
    }

    const tileTint = tint.clone().lerp(t.accent, 0.16);
    for (let n = 0; n < TILE_COUNT; n++) {
      const g = new Group();
      const body = glass(tileTint.clone(), true);
      const edge = lines(t.accent.clone());
      g.add(new Mesh(tileGeo, body), new LineSegments(tileEdges, edge));
      root.add(g);
      items.push({
        object: g,
        look(o) {
          g.visible = o > 0.005;
          body.opacity = o * 0.6;
          edge.opacity = o;
        },
      });
    }

    {
      const g = new Group();
      const body = glass(tileTint.clone(), true);
      const edge = lines(t.accent.clone());
      g.add(new Mesh(cartGeo, body), new LineSegments(cartEdges, edge), new LineSegments(handleGeo, edge));
      root.add(g);
      items.push({
        object: g,
        look(o) {
          g.visible = o > 0.005;
          body.opacity = o * 0.5;
          edge.opacity = o;
        },
      });
    }
    return items;
  },

  poses(index: number) {
    const s = webShapes(index);
    return [...s.slabs, ...s.tiles, s.cart];
  },
};

function lerp(a: number, b: number, k: number) {
  return a + (b - a) * k;
}

export function mount(stage: HTMLElement) {
  return mountStage3D(stage, webPlugin);
}
