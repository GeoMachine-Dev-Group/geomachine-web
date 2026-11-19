/** Ilustración SVG de la línea WEB (ver StageVisual.astro y project.ts). */
import type { Projector } from './projection';
import { CART, PAGE_LINES, SLAB, TILE, webShapes, type Vec3 } from './web-shapes';

export function webSvg(index: number, pr: Projector): string {
  const { screen, world, depthOf, pts, face } = pr;
  type Shape = { depth: number; svg: string };
  const s = webShapes(index);
  const shapes: Shape[] = [];

  s.slabs.forEach((q) => {
    if (q.o < 0.01) return;
    const lines = PAGE_LINES.map(([x1, y1, x2, y2]) => {
      const [a, b] = screen(world([x1, y1, SLAB.d / 2], q));
      const [c, d] = screen(world([x2, y2, SLAB.d / 2], q));
      return `M${a.toFixed(1)} ${b.toFixed(1)}L${c.toFixed(1)} ${d.toFixed(1)}`;
    }).join('');
    shapes.push({
      depth: depthOf(world([0, 0, 0], q)),
      svg: `<g opacity="${q.o.toFixed(2)}" class="${q.dim > 0.5 ? 'pv-dim' : ''}"><polygon class="pv-face" points="${pts(face(SLAB.w, SLAB.h, SLAB.d / 2), q)}"/><path class="pv-line" d="${lines}"/></g>`,
    });
  });
  s.tiles.forEach((q) => {
    if (q.o < 0.01) return;
    shapes.push({
      // Las losetas van sobre la hoja: por su centro quedarían detrás de ella.
      depth: depthOf(world([0, 0, 0], q)) + 0.5,
      svg: `<polygon class="pv-face pv-tile" opacity="${q.o.toFixed(2)}" points="${pts(face(TILE.w, TILE.h, TILE.d / 2), q)}"/>`,
    });
  });
  if (s.cart.o > 0.01) {
    const q = s.cart;
    const { w, h, d } = CART;
    const top: Vec3[] = [[-w / 2, h / 2, d / 2], [w / 2, h / 2, d / 2], [w / 2, h / 2, -d / 2], [-w / 2, h / 2, -d / 2]];
    const side: Vec3[] = [[w / 2, h / 2, d / 2], [w / 2, h / 2, -d / 2], [w / 2, -h / 2, -d / 2], [w / 2, -h / 2, d / 2]];
    shapes.push({
      depth: depthOf(world([0, 0, 0], q)) + 0.5,
      svg: `<g opacity="${q.o.toFixed(2)}"><polygon class="pv-face pv-tile" points="${pts(top, q)}"/><polygon class="pv-face pv-tile" points="${pts(side, q)}"/><polygon class="pv-face pv-tile" points="${pts(face(w, h, d / 2), q)}"/></g>`,
    });
  }
  shapes.sort((a, b) => a.depth - b.depth);
  return shapes.map((x) => x.svg).join('');
}
