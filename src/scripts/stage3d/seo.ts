/**
 * Pieza 3D de la línea SEO: una escalera de peldaños de vidrio (el ranking) y
 * un bloque con cantos de cobre (tu web) que sube por ella. Poses en
 * seo-shapes.ts. Se importa con import() desde ServiceStage.astro.
 */
import {
  BoxGeometry,
  ConeGeometry,
  EdgesGeometry,
  Group,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SphereGeometry,
} from 'three';
import { mountStage3D, type PieceItem, type ShapePlugin, type Tokens } from './core';
import { glass, lerp, lines, pathSegs, segGeometry, tints } from './materials';
import { circle } from './projection';
import {
  BLOCK, CAMERA, GHOST_COUNT, LINK, MAP, MAP_LINES, PIECE_ROT, PIN, SCAN, SHADOW, STEP, STEP_COUNT, TRAIL, TRAIL_HEAD,
  scattered, seoPoses, stepHeight,
} from './seo-shapes';
import type { Vec3 } from './web-shapes';

const seoPlugin: ShapePlugin = {
  pieceRotation: PIECE_ROT,
  camera: CAMERA,
  shadow: SHADOW,
  scattered,

  build(root: Group, t: Tokens): PieceItem[] {
    const { tint, warm, hot } = tints(t);
    const worn = t.inkSoft.clone().lerp(t.panel2, 0.55);
    const items: PieceItem[] = [];
    const add = (g: Group, look: PieceItem['look']) => {
      root.add(g);
      items.push({ object: g, look });
    };

    /* Peldaños: cada uno con su altura, dos renglones de resultado en la cara
       y una tapa de cobre que se enciende. */
    for (let k = 0; k < STEP_COUNT; k++) {
      const h = stepHeight(k);
      const geo = new BoxGeometry(STEP.w, h, STEP.d);
      const z = STEP.d / 2 + 0.004;
      const rows = segGeometry([
        [[-0.17, h / 2 - 0.09, z], [0.17, h / 2 - 0.09, z]],
        [[-0.17, h / 2 - 0.15, z], [0.06, h / 2 - 0.15, z]],
      ]);
      const capGeo = new PlaneGeometry(STEP.w - 0.05, STEP.d - 0.05);
      const body = glass(tint.clone(), true);
      const edge = lines(t.accent.clone());
      const row = lines(t.accent.clone());
      const cap = new MeshBasicMaterial({ color: t.accent.clone(), transparent: true, depthWrite: false });
      const capMesh = new Mesh(capGeo, cap);
      capMesh.rotation.x = -Math.PI / 2;
      capMesh.position.y = h / 2 + 0.003;
      const g = new Group();
      g.add(new Mesh(geo, body), new LineSegments(new EdgesGeometry(geo), edge), new LineSegments(rows, row), capMesh);
      add(g, (o, lit) => {
        g.visible = o > 0.005;
        body.opacity = o * lerp(0.5, 0.58, lit);
        body.color.copy(tint).lerp(warm, lit);
        edge.opacity = o * lerp(0.62, 1, lit);
        row.opacity = o * lerp(0.3, 0.85, lit);
        cap.opacity = o * lit * 0.4;
        capMesh.visible = lit > 0.01;
      });
    }

    /* El bloque (tu web): cara de página en miniatura que aparece al pulirlo. */
    const blockGeo = new BoxGeometry(BLOCK, BLOCK, BLOCK);
    const blockEdges = new EdgesGeometry(blockGeo);
    const zf = BLOCK / 2 + 0.004;
    const pageGeo = segGeometry([
      [[-0.13, 0.12, zf], [0.13, 0.12, zf]],
      [[-0.13, 0.04, zf], [0.07, 0.04, zf]],
      [[-0.13, -0.02, zf], [0.1, -0.02, zf]],
      [[-0.13, -0.11, zf], [-0.01, -0.11, zf]],
    ]);
    {
      const body = glass(hot.clone());
      const edge = lines(t.accent.clone());
      const page = lines(t.accent.clone());
      const coreMat = new MeshBasicMaterial({ color: t.accent.clone(), transparent: true, depthWrite: false });
      const core = new Mesh(new BoxGeometry(BLOCK * 0.42, BLOCK * 0.42, BLOCK * 0.42), coreMat);
      core.rotation.set(0.6, 0.75, 0);
      const g = new Group();
      g.add(core, new Mesh(blockGeo, body), new LineSegments(blockEdges, edge), new LineSegments(pageGeo, page));
      add(g, (o, rough) => {
        coreMat.opacity = o * lerp(0.9, 0.25, rough);
        g.visible = o > 0.005;
        body.opacity = o * lerp(0.75, 0.42, rough);
        body.roughness = lerp(0.12, 0.9, rough);
        body.clearcoat = lerp(1, 0.1, rough);
        body.color.copy(hot).lerp(worn, rough * 0.75);
        edge.opacity = o * lerp(1, 0.55, rough);
        edge.color.copy(t.accent).lerp(t.inkSoft, rough * 0.6);
        page.opacity = o * lerp(0.85, 0.1, rough);
      });
    }

    /* Fantasmas: la estela de la subida o la copia en otro idioma. */
    for (let n = 0; n < GHOST_COUNT; n++) {
      const body = glass(warm.clone(), true);
      const edge = lines(t.accent.clone());
      const g = new Group();
      g.add(new Mesh(blockGeo, body), new LineSegments(blockEdges, edge));
      add(g, (o) => {
        g.visible = o > 0.005;
        body.opacity = o * 0.6;
        edge.opacity = o;
      });
    }

    /* Plano de escaneo: una lámina vertical con líneas de barrido. */
    {
      const geo = new BoxGeometry(0.02, SCAN.h, SCAN.d);
      const scanLines: [Vec3, Vec3][] = Array.from({ length: SCAN.lines }, (_, n) => {
        const y = -SCAN.h / 2 + ((n + 0.5) / SCAN.lines) * SCAN.h;
        return [[0.012, y, -SCAN.d / 2], [0.012, y, SCAN.d / 2]];
      });
      const body = glass(warm.clone(), true);
      const edge = lines(t.accent.clone());
      const ln = lines(t.accent.clone());
      const g = new Group();
      g.add(new Mesh(geo, body), new LineSegments(new EdgesGeometry(geo), edge), new LineSegments(segGeometry(scanLines), ln));
      add(g, (o) => {
        g.visible = o > 0.005;
        body.opacity = o * 0.22;
        edge.opacity = o;
        ln.opacity = o * 0.5;
      });
    }

    /* Estela de la subida: una línea de cobre que acaba en flecha. */
    {
      const ln = lines(t.accent.clone());
      const g = new Group();
      g.add(new LineSegments(segGeometry([...pathSegs(TRAIL), ...TRAIL_HEAD]), ln));
      add(g, (o) => {
        g.visible = o > 0.005;
        ln.opacity = o * 0.95;
      });
    }

    /* Enlace discontinuo entre las dos versiones (multiidioma). */
    {
      const ln = lines(t.accent.clone());
      const g = new Group();
      g.add(new LineSegments(segGeometry(LINK), ln));
      add(g, (o) => {
        g.visible = o > 0.005;
        ln.opacity = o * 0.95;
      });
    }

    /* Marcador de mapa: cabeza de vidrio con un núcleo de cobre y punta abajo. */
    {
      const head = new SphereGeometry(PIN.head, 40, 28);
      const coneH = PIN.len + 0.1;
      const cone = new ConeGeometry(PIN.head * 0.84, coneH, 40, 1, true);
      const body = glass(warm.clone());
      const body2 = glass(warm.clone());
      const edge = lines(t.accent.clone());
      const core = new MeshBasicMaterial({ color: t.accent.clone(), transparent: true, depthWrite: false });
      const headMesh = new Mesh(head, body);
      headMesh.position.y = PIN.len;
      const coneMesh = new Mesh(cone, body2);
      coneMesh.rotation.x = Math.PI;
      coneMesh.position.y = coneH / 2;
      const coreMesh = new Mesh(new SphereGeometry(PIN.head * 0.34, 24, 16), core);
      coreMesh.position.y = PIN.len;
      const c = PIN.len;
      const rings = segGeometry([
        ...pathSegs(circle(PIN.head, 48, 'xz', [0, c, 0]), true),
        ...pathSegs(circle(PIN.head, 48, 'xy', [0, c, 0]), true),
        [[0, 0, 0], [-PIN.head * 0.84, coneH, 0]],
        [[0, 0, 0], [PIN.head * 0.84, coneH, 0]],
      ]);
      const g = new Group();
      g.add(coneMesh, headMesh, coreMesh, new LineSegments(rings, edge));
      add(g, (o) => {
        g.visible = o > 0.005;
        body.opacity = o * 0.55;
        body2.opacity = o * 0.45;
        edge.opacity = o;
        core.opacity = o * 0.85;
      });
    }

    /* Placa de mapa: vidrio plano con cuadrícula y un radio de cobre. */
    {
      const plate = new PlaneGeometry(MAP.w, MAP.d);
      const body = glass(tint.clone(), true);
      const grid = lines(t.accent.clone());
      const ring = lines(t.accent.clone());
      const frame = lines(t.accent.clone());
      const mesh = new Mesh(plate, body);
      mesh.rotation.x = -Math.PI / 2;
      const W2 = MAP.w / 2, D2 = MAP.d / 2;
      const g = new Group();
      g.add(
        mesh,
        new LineSegments(segGeometry(MAP_LINES), grid),
        new LineSegments(segGeometry(pathSegs(circle(1.05, 64), true)), ring),
        new LineSegments(segGeometry(pathSegs([[-W2, 0, -D2], [W2, 0, -D2], [W2, 0, D2], [-W2, 0, D2]], true)), frame),
      );
      add(g, (o) => {
        g.visible = o > 0.005;
        body.opacity = o * 0.3;
        grid.opacity = o * 0.18;
        ring.opacity = o * 0.85;
        frame.opacity = o * 0.4;
      });
    }

    return items;
  },

  poses: seoPoses,
};

export function mount(stage: HTMLElement) {
  return mountStage3D(stage, seoPlugin);
}
