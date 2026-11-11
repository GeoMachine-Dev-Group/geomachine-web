import {
  BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Mesh,
  Shape,
  Vector2,
  Vector3,
  type Material,
} from 'three';

const UP = new Vector3(0, 1, 0);

export function roundedRectShape(w: number, h: number, r: number): Shape {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Extruye una silueta hasta `height` con canto biselado, sin que el bisel la
    agrande: la pieza mide exactamente lo que mide la silueta. Queda tumbada, con
    la silueta en XZ y el grosor hacia +Y, apoyada en y = 0. */
export function extrudeFlat(shape: Shape, height: number, bevel: number, bevelSegments = 2, curveSegments = 8): BufferGeometry {
  const g = new ExtrudeGeometry(shape, {
    depth: height - bevel * 2,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments,
    curveSegments,
  });
  g.translate(0, 0, bevel);
  g.rotateX(-Math.PI / 2);
  return g;
}

/** Losa de esquinas redondeadas y canto biselado, apoyada en y = 0. */
export function slab(w: number, d: number, h: number, radius: number, bevel: number, bevelSegments = 2): BufferGeometry {
  return extrudeFlat(roundedRectShape(w, d, radius), h, bevel, bevelSegments);
}

export function polygonShape(points: Array<[number, number]>): Shape {
  return new Shape(points.map(([x, y]) => new Vector2(x, y)));
}

/** Cilindro entre dos puntos. */
export function rod(a: Vector3, b: Vector3, radius: number, material: Material, radial = 14): Mesh {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const m = new Mesh(new CylinderGeometry(radius, radius, len, radial), material);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  return m;
}

export function shadows<T extends Mesh>(m: T, cast = true, receive = true): T {
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}
