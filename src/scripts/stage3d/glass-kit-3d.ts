/**
 * Construye en three.js las piezas de un Kit (glass-kit.ts) con el mismo
 * material que la línea WEB: vidrio verde ahumado, cantos y dibujo de cobre,
 * y cables de cobre. Lo importan app.ts y sys.ts, que viajan en trozos
 * aparte; three.js va en un trozo compartido.
 */
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshPhysicalMaterial,
  Shape,
} from 'three';
import type { PieceItem, ShapePlugin, Tokens } from './core';
import { CAMERA, PIECE_ROT, SHADOW, cameraEye, cameraTarget, scattered } from './web-shapes';
import { roundedRectPoints, type CardSpec, type Kit, type Seg } from './glass-kit';

/** Vidrio: los mismos valores que web.ts. `soft` para las piezas pequeñas. */
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

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function segGeometry(segs: number[][]) {
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(segs.flat(), 3));
  return g;
}

/** Cuerpo y cantos de una placa: caja recta o con esquinas redondeadas. */
function cardGeometry(spec: CardSpec) {
  const { w, h, d, r = 0 } = spec;
  if (r <= 0) {
    const body = new BoxGeometry(w, h, d);
    return { body, edges: new EdgesGeometry(body) };
  }
  const pts = roundedRectPoints(w, h, r);
  const shape = new Shape();
  pts.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const body = new ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  body.translate(0, 0, -d / 2);
  // Contorno delante y detrás; sin las aristas de la teselación del canto.
  const loop = (z: number) => pts.map(([x, y], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length];
    return [x, y, z, x2, y2, z];
  });
  return { body, edges: segGeometry([...loop(d / 2), ...loop(-d / 2)]) };
}

function glyphGeometry(glyph: Seg[], z: number) {
  return segGeometry(glyph.map(([x1, y1, x2, y2]) => [x1, y1, z, x2, y2, z]));
}

export function kitPlugin(kit: Kit): ShapePlugin {
  return {
    pieceRotation: PIECE_ROT,
    camera: { fov: CAMERA.fov, target: cameraTarget, eye: cameraEye },
    shadow: SHADOW,
    scattered,
    poses: kit.poses,

    build(root: Group, t: Tokens): PieceItem[] {
      // Los mismos tintes que web.ts.
      const tint = t.panel2.clone().offsetHSL(0.01, 0.1, 0.03);
      const tileTint = tint.clone().lerp(t.accent, 0.16);
      const worn = t.inkSoft.clone().lerp(t.panel2, 0.55);

      // Piezas iguales comparten geometría.
      const cache = new Map<string, ReturnType<typeof cardGeometry> & { glyph?: BufferGeometry }>();
      const wireGeo = segGeometry([[-0.5, 0, 0, 0.5, 0, 0]]);

      return kit.pieces.map((spec): PieceItem => {
        const g = new Group();
        root.add(g);

        if (spec.kind === 'wire') {
          const mat = lines(t.accent.clone());
          g.add(new LineSegments(wireGeo, mat));
          return {
            object: g,
            look(o) {
              g.visible = o > 0.005;
              mat.opacity = o * 0.85;
            },
          };
        }

        const key = JSON.stringify(spec);
        let geo = cache.get(key);
        if (!geo) {
          geo = { ...cardGeometry(spec), glyph: spec.glyph && glyphGeometry(spec.glyph, spec.d / 2 + 0.004) };
          cache.set(key, geo);
        }
        const soft = spec.tone === 'tile';
        const base = soft ? tileTint : tint;
        const body = glass(base.clone(), soft);
        const edge = lines(t.accent.clone());
        const page = lines(t.accent.clone());
        g.add(new Mesh(geo.body, body), new LineSegments(geo.edges, edge));
        if (geo.glyph) g.add(new LineSegments(geo.glyph, page));

        return {
          object: g,
          look(o, dim) {
            g.visible = o > 0.005;
            body.opacity = o * lerp(soft ? 0.6 : 0.5, 0.3, dim);
            body.roughness = lerp(0.28, 0.9, dim);
            body.color.copy(base).lerp(worn, dim * 0.7);
            edge.opacity = o * lerp(soft ? 1 : 0.95, 0.4, dim);
            edge.color.copy(t.accent).lerp(t.inkSoft, dim);
            page.opacity = o * lerp(spec.ink ?? (soft ? 0.75 : 0.55), 0.18, dim);
            page.color.copy(t.accent).lerp(t.inkSoft, dim);
          },
        };
      });
    },
  };
}
