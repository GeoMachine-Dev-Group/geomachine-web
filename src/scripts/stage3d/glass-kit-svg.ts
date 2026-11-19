/**
 * SVG estático de un Kit (glass-kit.ts): las mismas poses que anima el lienzo,
 * proyectadas en el build. Lo llama StageVisual.astro. Sin three.js.
 */
import type { Pose, Vec3 } from './web-shapes';
import type { Projector } from './projection';
import { roundedRectPoints, type CardSpec, type Kit } from './glass-kit';

/** Caras de una placa: [normal local, esquinas]. Con esquinas redondeadas
    solo delante y detrás (el canto es fino). */
function faces({ w, h, d, r = 0 }: CardSpec): [Vec3, Vec3[]][] {
  const a = w / 2, b = h / 2, c = d / 2;
  if (r > 0) {
    const ring = roundedRectPoints(w, h, r, 3);
    return [
      [[0, 0, 1], ring.map(([x, y]) => [x, y, c] as Vec3)],
      [[0, 0, -1], ring.map(([x, y]) => [x, y, -c] as Vec3)],
    ];
  }
  return [
    [[0, 0, 1], [[-a, -b, c], [a, -b, c], [a, b, c], [-a, b, c]]],
    [[0, 0, -1], [[-a, -b, -c], [-a, b, -c], [a, b, -c], [a, -b, -c]]],
    [[1, 0, 0], [[a, -b, -c], [a, b, -c], [a, b, c], [a, -b, c]]],
    [[-1, 0, 0], [[-a, -b, -c], [-a, -b, c], [-a, b, c], [-a, b, -c]]],
    [[0, 1, 0], [[-a, b, -c], [-a, b, c], [a, b, c], [a, b, -c]]],
    [[0, -1, 0], [[-a, -b, -c], [a, -b, -c], [a, -b, c], [-a, -b, c]]],
  ];
}

export function kitSvg(kit: Kit, index: number, pr: Projector): string {
  const poses = kit.poses(index);
  const shapes: { depth: number; svg: string }[] = [];
  const line = (a: Vec3, b: Vec3, q: Pose) => {
    const [x1, y1] = pr.screen(pr.world(a, q));
    const [x2, y2] = pr.screen(pr.world(b, q));
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };

  kit.pieces.forEach((spec, i) => {
    const q = poses[i];
    if (q.o < 0.01) return;
    const center = pr.world([0, 0, 0], q);
    if (spec.kind === 'wire') {
      shapes.push({
        // Delante de las piezas que une: por su centro quedaría detrás.
        depth: pr.depthOf(center) + 0.3,
        svg: `<path class="pv-wire" opacity="${(q.o * 0.85).toFixed(2)}" d="${line([-0.5, 0, 0], [0.5, 0, 0], q)}"/>`,
      });
      return;
    }
    const cls = spec.tone === 'tile' ? 'pv-face pv-tile' : 'pv-face';
    let body = '';
    let front = false;
    for (const [n, corners] of faces(spec)) {
      const mid = corners.reduce<Vec3>((m, c) => [m[0] + c[0] / corners.length, m[1] + c[1] / corners.length, m[2] + c[2] / corners.length], [0, 0, 0]);
      if (!pr.facing(pr.direction(n, q), pr.world(mid, q))) continue;
      if (n[2] === 1) front = true;
      body += `<polygon class="${cls}" points="${pr.pts(corners, q)}"/>`;
    }
    const z = spec.d / 2;
    const glyph = front && spec.glyph
      ? `<path class="pv-line" d="${spec.glyph.map(([x1, y1, x2, y2]) => line([x1, y1, z], [x2, y2, z], q)).join('')}"/>`
      : '';
    shapes.push({
      depth: pr.depthOf(center),
      svg: `<g opacity="${q.o.toFixed(2)}" class="${q.dim > 0.5 ? 'pv-dim' : ''}">${body}${glyph}</g>`,
    });
  });

  shapes.sort((a, b) => a.depth - b.depth);
  return shapes.map((x) => x.svg).join('');
}
