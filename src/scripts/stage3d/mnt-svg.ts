/** Ilustración SVG de la línea MNT (ver StageVisual.astro y project.ts): el
    fotograma quieto del lienzo, con el latido a medio golpe. */
import type { Projector } from './projection';
import { BLOCK, RINGS, RING_BAND, SHELL, SLOTS, TRACE, mntShapes } from './mnt-shapes';
import type { Pose, Vec3 } from './web-shapes';

export function mntSvg(index: number, pr: Projector): string {
  const { screen, scale, world, depthOf, pts, face, path, key } = pr;
  const s = mntShapes(index);
  const f = (n: number) => n.toFixed(1);
  const coreId = `pv-core-${key}`;
  let back = '';
  let front = '';

  const circle = (r: number, q: Pose, n = 96): Vec3[] =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return world([Math.cos(a) * r, 0, Math.sin(a) * r], q);
    });

  // Anillos: la mitad de atrás va detrás del bloque y la de delante, delante.
  const center = depthOf(world([0, 0, 0], s.block));
  s.rings.forEach((q, k) => {
    if (q.o < 0.01) return;
    const r = RINGS[k];
    const outer = circle(r + RING_BAND / 2, q);
    const inner = circle(r - RING_BAND / 2, q);
    const halves: Array<[boolean, number[]]> = [[false, []], [true, []]];
    outer.forEach((p, i) => halves[depthOf(p) > center ? 1 : 0][1].push(i));
    for (const [isFront, idx] of halves) {
      if (idx.length < 2) continue;
      // Tramos seguidos (la mitad puede cruzar el índice 0).
      const runs: number[][] = [];
      idx.forEach((i) => {
        const last = runs[runs.length - 1];
        if (last && i === last[last.length - 1] + 1) last.push(i);
        else runs.push([i]);
      });
      let svg = '';
      for (const run of runs) {
        if (run.length < 2) continue;
        const o = run.map((i) => outer[i]);
        const n = run.map((i) => inner[i]);
        svg += `<path class="pv-face pv-band" d="${path([...o, ...n.reverse()], true)}"/>`;
        svg += `<path class="pv-line pv-ring" d="${path(o)}${path(n)}"/>`;
      }
      svg = `<g opacity="${q.o.toFixed(2)}">${svg}</g>`;
      if (isFront) front += svg;
      else back += svg;
    }
  });

  // Bloque.
  let block = '';
  {
    const q = s.block;
    const { w, h, d } = BLOCK;
    const top: Vec3[] = [[-w / 2, h / 2, d / 2], [w / 2, h / 2, d / 2], [w / 2, h / 2, -d / 2], [-w / 2, h / 2, -d / 2]];
    const side: Vec3[] = [[w / 2, h / 2, d / 2], [w / 2, h / 2, -d / 2], [w / 2, -h / 2, -d / 2], [w / 2, -h / 2, d / 2]];
    const z = d / 2, x = w / 2 - 0.12;
    const W = (p: Vec3) => world(p, q);
    let detail = '';
    for (const [y, hh] of SLOTS) {
      detail += path([W([-x, y + hh / 2, z]), W([x, y + hh / 2, z]), W([x, y - hh / 2, z]), W([-x, y - hh / 2, z])], true);
      detail += path([W([-x + 0.08, y, z]), W([-x + 0.36, y, z])]);
    }
    const leds = SLOTS.map(([y]) => path([W([x - 0.14, y, z]), W([x - 0.08, y, z])])).join('');
    const trace = path(TRACE.map(([tx, ty]) => W([tx, ty, z])));
    const C = W([0, -0.05, 0]);
    const [cx, cy] = screen(C);
    block =
      `<defs><radialGradient id="${coreId}"><stop offset="0" class="pv-glow-stop" stop-opacity=".9"/><stop offset="1" class="pv-glow-stop" stop-opacity="0"/></radialGradient></defs>` +
      `<polygon class="pv-face" points="${pts(top, q)}"/><polygon class="pv-face" points="${pts(side, q)}"/>` +
      `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(0.6 * q.s * scale(C))}" fill="url(#${coreId})" opacity=".45"/>` +
      `<polygon class="pv-face pv-front" points="${pts(face(w, h, d / 2), q)}"/>` +
      `<path class="pv-line" d="${detail}"/><path class="pv-line pv-beat" d="${leds}${trace}"/>`;
  }

  // Cúpula: silueta (envolvente convexa de puntos de la superficie) y paralelos.
  let shell = '';
  if (s.shell.o > 0.01) {
    const q = s.shell;
    const P: Array<readonly [number, number]> = [];
    for (let i = 0; i <= 24; i++) {
      for (let j = 0; j < 48; j++) {
        const v = (i / 24) * Math.PI, u = (j / 48) * Math.PI * 2;
        P.push(screen(world([Math.sin(v) * Math.cos(u) * SHELL.rx, Math.cos(v) * SHELL.ry, Math.sin(v) * Math.sin(u) * SHELL.rx], q)));
      }
    }
    const hull = convexHull(P);
    const lat = (k: number) => {
      const r = SHELL.rx * Math.sqrt(1 - k * k);
      return path(Array.from({ length: 97 }, (_, i) => {
        const a = (i / 96) * Math.PI * 2;
        return world([Math.cos(a) * r, SHELL.ry * k, Math.sin(a) * r], q);
      }));
    };
    shell =
      `<g opacity="${q.o.toFixed(2)}"><polygon class="pv-face pv-shell" points="${hull.map((p) => p.map(f).join(',')).join(' ')}"/>` +
      `<path class="pv-line" d="${lat(0)}"/><path class="pv-line pv-faint" d="${lat(0.55)}${lat(0.86)}${lat(-0.55)}"/></g>`;
  }

  return back + block + front + shell;
}

/** Envolvente convexa (cadena monótona de Andrew). */
function convexHull(points: Array<readonly [number, number]>) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: readonly number[], a: readonly number[], b: readonly number[]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Array<readonly [number, number]> = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Array<readonly [number, number]> = [];
  for (const q of p.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
