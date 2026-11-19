/** Ilustración SVG de la línea IA (ver StageVisual.astro y project.ts): el
    fotograma quieto del lienzo, con los pulsos donde los deja stillT(). */
import type { Projector } from './project';
import { CASE, EDGES, NODE_R, iaShapes, stillT } from './ia-shapes';
import type { Vec3 } from './web-shapes';

export function iaSvg(index: number, pr: Projector): string {
  const { screen, scale, piece, depthOf, pts, face, key } = pr;
  const s = iaShapes(index);
  const f = (n: number) => n.toFixed(1);
  const pulseId = `pv-pulse-${key}`;
  let out = `<defs><radialGradient id="${pulseId}"><stop offset="0" class="pv-glow-stop"/><stop offset=".35" class="pv-glow-stop" stop-opacity=".55"/><stop offset="1" class="pv-glow-stop" stop-opacity="0"/></radialGradient></defs>`;

  // Hilos, de nodo a nodo.
  let wires = '';
  let pulses = '';
  EDGES.forEach(([a, b], k) => {
    const q = s.edges[k];
    if (q.o < 0.01) return;
    const A = piece(s.nodes[a].p), B = piece(s.nodes[b].p);
    const [x1, y1] = screen(A), [x2, y2] = screen(B);
    wires += `<path class="pv-line pv-wire" opacity="${q.o.toFixed(2)}" d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}"/>`;
    let u = stillT(k);
    if (q.dim > 0.5) u = 1 - u;
    const P: Vec3 = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u];
    const [px, py] = screen(P);
    const env = Math.pow(Math.sin(Math.PI * u), 1.4) * q.o;
    pulses += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(0.13 * scale(P))}" fill="url(#${pulseId})" opacity="${env.toFixed(2)}"/>`;
  });
  out += wires;

  // Nodos, de atrás adelante.
  const nodes = s.nodes
    .filter((q) => q.o > 0.01)
    .map((q) => {
      const P = piece(q.p);
      const [cx, cy] = screen(P);
      const r = NODE_R * q.s * scale(P);
      const hot = q.dim > 0.5;
      const svg =
        (hot ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 3.4)}" fill="url(#${pulseId})" opacity=".5"/>` : '') +
        `<circle class="pv-face pv-node" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>` +
        `<circle class="pv-core" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.32)}" opacity="${hot ? 1 : 0.4}"/>`;
      return { depth: depthOf(P), svg };
    })
    .sort((a, b) => a.depth - b.depth);
  out += nodes.map((n) => n.svg).join('') + pulses;

  // La caja de «IA privada», por encima: vidrio casi transparente.
  if (s.box.o > 0.01) {
    const q = s.box;
    const { w, h, d } = CASE;
    const top: Vec3[] = [[-w / 2, h / 2, d / 2], [w / 2, h / 2, d / 2], [w / 2, h / 2, -d / 2], [-w / 2, h / 2, -d / 2]];
    const side: Vec3[] = [[w / 2, h / 2, d / 2], [w / 2, h / 2, -d / 2], [w / 2, -h / 2, -d / 2], [w / 2, -h / 2, d / 2]];
    out += `<g class="pv-case"><polygon class="pv-face" points="${pts(top, q)}"/><polygon class="pv-face" points="${pts(side, q)}"/><polygon class="pv-face" points="${pts(face(w, h, d / 2), q)}"/></g>`;
  }
  return out;
}
