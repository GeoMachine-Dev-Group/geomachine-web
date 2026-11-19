/**
 * Materiales comunes de las piezas 3D que no son WEB (SEO, PACK…): el mismo
 * vidrio ahumado verde y los mismos trazos de cobre que web.ts, para que todas
 * las líneas hablen el mismo idioma. Va con three.js en el trozo compartido.
 */
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  LineBasicMaterial,
  MeshPhysicalMaterial,
} from 'three';
import type { Tokens } from './core';
import type { Vec3 } from './web-shapes';

/** Vidrio. `soft` para las piezas pequeñas: menos barniz y menos reflejo del
    entorno, para que no brillen más que las grandes. */
export function glass(tint: Color, soft = false) {
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

export function lines(color: Color) {
  return new LineBasicMaterial({ color, transparent: true, depthWrite: false });
}

/** Tintes de la casa: el vidrio verde oscuro y su versión con punto de cobre. */
export function tints(t: Tokens) {
  const tint = t.panel2.clone().offsetHSL(0.01, 0.1, 0.03);
  return { tint, warm: tint.clone().lerp(t.accent, 0.16), hot: tint.clone().lerp(t.accent, 0.42) };
}

/** Geometría de segmentos sueltos [[a, b], …] para LineSegments. */
export function segGeometry(list: [Vec3, Vec3][]) {
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(list.flatMap(([a, b]) => [...a, ...b]), 3));
  return g;
}

/** Polilínea (o lazo cerrado) como segmentos. */
export function pathSegs(pts: Vec3[], close = false): [Vec3, Vec3][] {
  const out: [Vec3, Vec3][] = [];
  for (let i = 0; i < pts.length - 1; i++) out.push([pts[i], pts[i + 1]]);
  if (close && pts.length > 2) out.push([pts[pts.length - 1], pts[0]]);
  return out;
}

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
