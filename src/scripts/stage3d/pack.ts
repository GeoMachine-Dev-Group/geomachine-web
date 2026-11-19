/**
 * Pieza 3D de los paquetes: una caja de vidrio que se abre y enseña, en
 * miniatura, las piezas de las líneas que incluye. Poses en pack-shapes.ts.
 * Se importa con import() desde ServiceStage.astro.
 */
import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  BufferGeometry,
  Group,
  IcosahedronGeometry,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SphereGeometry,
  SRGBColorSpace,
} from 'three';
import { mountStage3D, type PieceItem, type ShapePlugin, type Tokens } from './core';
import { glass, lerp, lines, pathSegs, segGeometry, tints } from './materials';
import { circle } from './projection';
import {
  BOX, CAMERA, CUBE, DISC, LID, MINI_STEP, MINI_STEPS, NODES, NODE_LINKS, PAGE, PHONE, PHONE_BACK, PHONE_LINES,
  PIECE_ROT, PIN, RING, RING_TILT, SHADOW, SLAB, TILE, TILE_COUNT, TILE_LINES, discY, packPoses, scattered,
} from './pack-shapes';

/** Haz de luz que sube de la caja encendida: cobre abajo, nada arriba, y
    apagado hacia los lados. */
function beamTexture(color: string) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d')!;
  const v = g.createLinearGradient(0, 128, 0, 0);
  v.addColorStop(0, color);
  v.addColorStop(1, 'transparent');
  g.fillStyle = v;
  g.fillRect(0, 0, 64, 128);
  g.globalCompositeOperation = 'destination-in';
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, 'transparent');
  h.addColorStop(0.5, '#000');
  h.addColorStop(1, 'transparent');
  g.fillStyle = h;
  g.fillRect(0, 0, 64, 128);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** Luz de cobre del fondo de la caja: degradado radial. */
function glowTexture(color: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'transparent');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

const packPlugin: ShapePlugin = {
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
    /** Pieza sencilla: cuerpo de vidrio y cantos de cobre que siguen la opacidad. */
    const simple = (g: Group, parts: { mat: Material & { opacity: number }; k: number }[]) =>
      add(g, (o) => {
        g.visible = o > 0.005;
        parts.forEach(({ mat, k }) => { mat.opacity = o * k; });
      });

    /* Caja abierta: la cara de arriba no se pinta; el canto sí. */
    {
      const geo = new BoxGeometry(BOX.w, BOX.h, BOX.d);
      const body = glass(tint.clone());
      const none = new MeshBasicMaterial({ visible: false });
      const edge = lines(t.accent.clone());
      const light = new MeshBasicMaterial({ map: glowTexture(t.accentCss), transparent: true, depthWrite: false });
      const floor = new Mesh(new PlaneGeometry(BOX.w * 0.95, BOX.d * 0.95), light);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -BOX.h / 2 + 0.01;
      const beam = new MeshBasicMaterial({
        map: beamTexture(t.accentCss), transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide,
      });
      const beamH = 1.9;
      const beamA = new Mesh(new PlaneGeometry(BOX.w * 0.85, beamH), beam);
      beamA.position.y = -BOX.h / 2 + beamH / 2;
      const g = new Group();
      g.add(new Mesh(geo, [body, body, none, body, body, body]), new LineSegments(new EdgesGeometry(geo), edge), floor, beamA);
      add(g, (o, glow) => {
        g.visible = o > 0.005;
        beam.opacity = o * glow * 0.4;
        beamA.visible = glow > 0.01;
        body.opacity = o * 0.34;
        body.color.copy(tint).lerp(warm, glow);
        edge.opacity = o;
        light.opacity = o * (0.12 + glow * 0.78);
      });
    }

    /* Tapa. */
    {
      const geo = new BoxGeometry(LID.w, LID.h, LID.d);
      const body = glass(tint.clone());
      const edge = lines(t.accent.clone());
      const g = new Group();
      g.add(new Mesh(geo, body), new LineSegments(new EdgesGeometry(geo), edge));
      simple(g, [{ mat: body, k: 0.45 }, { mat: edge, k: 1 }]);
    }

    /* Dos hojas de web (la segunda puede ser la vieja, apagada). */
    {
      const geo = new BoxGeometry(SLAB.w, SLAB.h, SLAB.d);
      const edges = new EdgesGeometry(geo);
      const z = SLAB.d / 2 + 0.004;
      const page = segGeometry(PAGE.map(([x1, y1, x2, y2]) => [[x1, y1, z], [x2, y2, z]]));
      for (let n = 0; n < 2; n++) {
        const body = glass(tint.clone());
        const edge = lines(t.accent.clone());
        const ln = lines(t.accent.clone());
        const g = new Group();
        g.add(new Mesh(geo, body), new LineSegments(edges, edge), new LineSegments(page, ln));
        add(g, (o, dim) => {
          g.visible = o > 0.005;
          body.opacity = o * lerp(0.55, 0.3, dim);
          body.roughness = lerp(0.28, 0.9, dim);
          body.color.copy(tint).lerp(worn, dim * 0.7);
          edge.opacity = o * lerp(0.95, 0.4, dim);
          edge.color.copy(t.accent).lerp(t.inkSoft, dim);
          ln.opacity = o * lerp(0.6, 0.18, dim);
          ln.color.copy(t.accent).lerp(t.inkSoft, dim);
        });
      }
    }

    /* Móvil en dos capas. */
    {
      const geo = new BoxGeometry(PHONE.w, PHONE.h, PHONE.d);
      const edges = new EdgesGeometry(geo);
      const front = glass(warm.clone());
      const back = glass(tint.clone());
      const edge = lines(t.accent.clone());
      const edgeBack = lines(t.accent.clone());
      const screen = lines(t.accent.clone());
      const rear = new Group();
      rear.position.set(...PHONE_BACK);
      rear.add(new Mesh(geo, back), new LineSegments(edges, edgeBack));
      const g = new Group();
      g.add(rear, new Mesh(geo, front), new LineSegments(edges, edge), new LineSegments(segGeometry(PHONE_LINES), screen));
      simple(g, [{ mat: front, k: 0.6 }, { mat: back, k: 0.3 }, { mat: edge, k: 1 }, { mat: edgeBack, k: 0.45 }, { mat: screen, k: 0.75 }]);
    }

    /* Nodos de IA: gemas de vidrio unidas por hilos de cobre. */
    {
      const g = new Group();
      const body = glass(warm.clone(), true);
      const core = glass(hot.clone());
      const edge = lines(t.accent.clone());
      const link = lines(t.accent.clone());
      NODES.forEach((n, k) => {
        const geo = new IcosahedronGeometry(n.r, 0);
        const m = new Mesh(geo, k === 0 ? core : body);
        const e = new LineSegments(new EdgesGeometry(geo), edge);
        m.position.set(...n.p);
        e.position.set(...n.p);
        g.add(m, e);
      });
      g.add(new LineSegments(segGeometry(NODE_LINKS.map(([a, b]) => [NODES[a].p, NODES[b].p])), link));
      simple(g, [{ mat: body, k: 0.6 }, { mat: core, k: 0.8 }, { mat: edge, k: 1 }, { mat: link, k: 0.7 }]);
    }

    /* Mantenimiento: un bloque con un anillo de cobre en órbita. */
    {
      const geo = new BoxGeometry(CUBE, CUBE, CUBE);
      const body = glass(warm.clone());
      const edge = lines(t.accent.clone());
      const ringMat = lines(t.accent.clone());
      const ring = new LineSegments(segGeometry(pathSegs(circle(RING, 64), true)), ringMat);
      ring.rotation.set(...RING_TILT);
      const g = new Group();
      g.add(new Mesh(geo, body), new LineSegments(new EdgesGeometry(geo), edge), ring);
      simple(g, [{ mat: body, k: 0.6 }, { mat: edge, k: 1 }, { mat: ringMat, k: 0.95 }]);
    }

    /* Escalera de SEO en miniatura. */
    {
      const g = new Group();
      const body = glass(tint.clone());
      const edge = lines(t.accent.clone());
      MINI_STEPS.forEach(([x, h]) => {
        const geo = new BoxGeometry(MINI_STEP.w, h, MINI_STEP.d);
        const m = new Mesh(geo, body);
        const e = new LineSegments(new EdgesGeometry(geo), edge);
        m.position.set(x, MINI_STEP.base + h / 2, 0);
        e.position.copy(m.position);
        g.add(m, e);
      });
      simple(g, [{ mat: body, k: 0.5 }, { mat: edge, k: 1 }]);
    }

    /* Marcador de mapa (SEO local, ficha de Google). */
    {
      const coneH = PIN.len + 0.05;
      const head = new Mesh(new SphereGeometry(PIN.head, 32, 20), glass(warm.clone()));
      head.position.y = PIN.len;
      const cone = new Mesh(new ConeGeometry(PIN.head * 0.84, coneH, 32, 1, true), glass(warm.clone()));
      cone.rotation.x = Math.PI;
      cone.position.y = coneH / 2;
      const coreMat = new MeshBasicMaterial({ color: t.accent.clone(), transparent: true, depthWrite: false });
      const core = new Mesh(new SphereGeometry(PIN.head * 0.36, 16, 12), coreMat);
      core.position.y = PIN.len;
      const edge = lines(t.accent.clone());
      const wire = segGeometry([
        ...pathSegs(circle(PIN.head, 40, 'xz', [0, PIN.len, 0]), true),
        ...pathSegs(circle(PIN.head, 40, 'xy', [0, PIN.len, 0]), true),
        [[0, 0, 0], [-PIN.head * 0.84, coneH, 0]],
        [[0, 0, 0], [PIN.head * 0.84, coneH, 0]],
      ]);
      const g = new Group();
      g.add(cone, head, core, new LineSegments(wire, edge));
      simple(g, [
        { mat: head.material, k: 0.55 }, { mat: cone.material, k: 0.45 }, { mat: coreMat, k: 0.85 }, { mat: edge, k: 1 },
      ]);
    }

    /* Base de datos: tres discos. */
    {
      const geo = new CylinderGeometry(DISC.r, DISC.r, DISC.h, 48);
      const edges = new EdgesGeometry(geo, 20);
      const body = glass(warm.clone());
      const edge = lines(t.accent.clone());
      const g = new Group();
      for (let n = 0; n < 3; n++) {
        const m = new Mesh(geo, body);
        const e = new LineSegments(edges, edge);
        m.position.y = e.position.y = discY(n);
        g.add(m, e);
      }
      simple(g, [{ mat: body, k: 0.55 }, { mat: edge, k: 1 }]);
    }

    /* Losetas: flujos, productos, automatizaciones. */
    {
      const geo = new BoxGeometry(TILE.w, TILE.h, TILE.d);
      const edges = new EdgesGeometry(geo);
      const rows = new BufferGeometry();
      rows.setAttribute('position', new Float32BufferAttribute(TILE_LINES.flatMap(([a, b]) => [...a, ...b]), 3));
      for (let n = 0; n < TILE_COUNT; n++) {
        const body = glass(warm.clone(), true);
        const edge = lines(t.accent.clone());
        const row = lines(t.accent.clone());
        const g = new Group();
        g.add(new Mesh(geo, body), new LineSegments(edges, edge), new LineSegments(rows, row));
        simple(g, [{ mat: body, k: 0.6 }, { mat: edge, k: 1 }, { mat: row, k: 0.7 }]);
      }
    }

    return items;
  },

  poses: packPoses,
};

export function mount(stage: HTMLElement) {
  return mountStage3D(stage, packPlugin);
}
