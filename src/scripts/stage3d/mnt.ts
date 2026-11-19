/**
 * Pieza 3D de la línea MNT: un bloque de vidrio con latido de cobre y, según
 * el plan, anillos de protección y una cúpula (ver mnt-shapes.ts). Se importa
 * con import() desde ServiceStage.astro; three.js viaja en el trozo común.
 */
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PointLight,
  RingGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
} from 'three';
import { glowTexture, mountStage3D, type PieceItem, type ShapePlugin, type Tokens } from './core';
import { CAMERA, PIECE_ROT, SHADOW, cameraEye, cameraTarget } from './web-shapes';
import {
  BEAT_STILL, BLOCK, RINGS, RING_BAND, RING_SPIN, SHELL, SLOTS, TRACE, beat, mntScattered, mntShapes,
} from './mnt-shapes';

function glass(tint: Color, envMapIntensity = 1) {
  return new MeshPhysicalMaterial({
    envMapIntensity,
    color: tint,
    metalness: 0,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.18,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
}

function lines(color: Color) {
  return new LineBasicMaterial({ color, transparent: true, depthWrite: false });
}

/** Elipse horizontal (plano XZ) a la altura y. */
function ellipse(rx: number, rz: number, y = 0, segments = 96) {
  const g = new BufferGeometry();
  const pts: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * rx, y, Math.sin(a) * rz);
  }
  g.setAttribute('position', new Float32BufferAttribute(pts, 3));
  return g;
}

function mntPlugin(): ShapePlugin {
  // Estado de update(), uno por escenario montado.
  let blockGroup: Group | null = null;
  let blockO = 0;
  const spinners: Group[] = [];
  const beads: MeshBasicMaterial[] = [];
  const ringO: number[] = [];
  let core: Sprite | null = null;
  let trace: LineBasicMaterial | null = null;
  let leds: LineBasicMaterial | null = null;
  let light: PointLight | null = null;

  return {
    pieceRotation: PIECE_ROT,
    camera: { fov: CAMERA.fov, target: cameraTarget, eye: cameraEye },
    shadow: SHADOW,
    scattered: mntScattered,

    build(root: Group, t: Tokens): PieceItem[] {
      const tint = t.panel2.clone().offsetHSL(0.01, 0.1, 0.03);
      const glowMap = glowTexture(t.accentCss);
      const items: PieceItem[] = [];

      /* Bloque: vidrio, cantos de cobre, tres ranuras y la traza del latido. */
      {
        const g = new Group();
        const geo = new BoxGeometry(BLOCK.w, BLOCK.h, BLOCK.d);
        const body = glass(tint.clone());
        const edge = lines(t.accent.clone());
        const z = BLOCK.d / 2 + 0.004, x = BLOCK.w / 2 - 0.12;
        const slotPts: number[] = [];
        const ledPts: number[] = [];
        for (const [y, h] of SLOTS) {
          const y1 = y + h / 2, y2 = y - h / 2;
          slotPts.push(-x, y1, z, x, y1, z, x, y1, z, x, y2, z, x, y2, z, -x, y2, z, -x, y2, z, -x, y1, z);
          // Una rejilla corta a la izquierda y un piloto a la derecha.
          slotPts.push(-x + 0.08, y, z, -x + 0.36, y, z);
          ledPts.push(x - 0.14, y, z, x - 0.08, y, z);
        }
        const slotGeo = new BufferGeometry();
        slotGeo.setAttribute('position', new Float32BufferAttribute(slotPts, 3));
        const ledGeo = new BufferGeometry();
        ledGeo.setAttribute('position', new Float32BufferAttribute(ledPts, 3));
        const traceGeo = new BufferGeometry();
        traceGeo.setAttribute('position', new Float32BufferAttribute(
          TRACE.slice(1).flatMap(([x2, y2], i) => [TRACE[i][0], TRACE[i][1], z, x2, y2, z]), 3,
        ));
        const slotMat = lines(t.accent.clone());
        leds = lines(t.accent.clone());
        trace = lines(t.accent.clone());
        // El latido: un resplandor de cobre dentro del bloque y una luz que
        // tiñe el vidrio de alrededor.
        core = new Sprite(new SpriteMaterial({ map: glowMap, color: t.accent.clone(), transparent: true, depthWrite: false, blending: AdditiveBlending }));
        core.scale.setScalar(1.5);
        core.position.set(0, -0.05, 0);
        core.renderOrder = 2;
        light = new PointLight(t.accent, 0, 3.2, 1.6);
        g.add(
          new Mesh(geo, body),
          new LineSegments(new EdgesGeometry(geo), edge),
          new LineSegments(slotGeo, slotMat),
          new LineSegments(ledGeo, leds),
          new LineSegments(traceGeo, trace),
          core,
          light,
        );
        root.add(g);
        blockGroup = g;
        items.push({
          object: g,
          look(o) {
            blockO = o;
            g.visible = o > 0.005;
            body.opacity = o * 0.5;
            edge.opacity = o * 0.95;
            slotMat.opacity = o * 0.5;
          },
        });
      }

      /* Anillos: banda plana de vidrio con un canto de cobre a cada lado y
         tres cuentas que delatan el giro. */
      const ringTint = tint.clone().lerp(t.accent, 0.1);
      RINGS.forEach((r, k) => {
        const g = new Group();
        const spin = new Group();
        const band = new RingGeometry(r - RING_BAND / 2, r + RING_BAND / 2, 128, 1);
        band.rotateX(-Math.PI / 2);
        const body = glass(ringTint.clone(), 0.7);
        const edge = lines(t.accent.clone());
        const bead = new MeshBasicMaterial({ color: t.accent.clone(), transparent: true, depthWrite: false, blending: AdditiveBlending });
        const beadGeo = new SphereGeometry(0.03, 12, 8);
        spin.add(
          new Mesh(band, body),
          new LineLoop(ellipse(r - RING_BAND / 2, r - RING_BAND / 2), edge),
          new LineLoop(ellipse(r + RING_BAND / 2, r + RING_BAND / 2), edge),
        );
        for (let b = 0; b < 3; b++) {
          const a = (b / 3) * Math.PI * 2 + k;
          const m = new Mesh(beadGeo, bead);
          m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
          spin.add(m);
        }
        g.add(spin);
        root.add(g);
        spinners.push(spin);
        beads.push(bead);
        ringO.push(0);
        items.push({
          object: g,
          look(o) {
            ringO[k] = o;
            g.visible = o > 0.005;
            body.opacity = o * 0.32;
            edge.opacity = o * 0.9;
          },
        });
      });

      /* Cúpula: el escudo de Enterprise. Vidrio muy fino, un ecuador y dos
         paralelos de cobre. */
      {
        const g = new Group();
        const geo = new SphereGeometry(1, 64, 40);
        geo.scale(SHELL.rx, SHELL.ry, SHELL.rx);
        const body = glass(tint.clone(), 1.2);
        const edge = lines(t.accent.clone());
        const faint = lines(t.accent.clone());
        const lat = (k: number) => ellipse(SHELL.rx * Math.sqrt(1 - k * k), SHELL.rx * Math.sqrt(1 - k * k), SHELL.ry * k);
        g.add(
          new Mesh(geo, body),
          new LineLoop(ellipse(SHELL.rx, SHELL.rx), edge),
          new LineLoop(lat(0.55), faint),
          new LineLoop(lat(0.86), faint),
          new LineLoop(lat(-0.55), faint),
        );
        root.add(g);
        items.push({
          object: g,
          look(o) {
            g.visible = o > 0.005;
            body.opacity = o * 0.12;
            edge.opacity = o * 0.75;
            faint.opacity = o * 0.32;
          },
        });
      }
      return items;
    },

    poses(index: number) {
      const s = mntShapes(index);
      return [s.block, ...s.rings, s.shell];
    },

    update(time: number, still: boolean) {
      const b = still ? BEAT_STILL : beat(time);
      if (core) core.material.opacity = blockO * (0.35 + 0.65 * b);
      if (core) core.scale.setScalar(1.1 + 0.5 * b);
      if (trace) trace.opacity = blockO * (0.45 + 0.55 * b);
      if (leds) leds.opacity = blockO * (0.5 + 0.5 * b);
      if (light) light.intensity = blockO * (1 + 4 * b);
      if (blockGroup) blockGroup.visible = blockO > 0.005;
      spinners.forEach((s, k) => {
        s.rotation.y = (still ? 0 : time * RING_SPIN[k]) + k * 0.7;
        beads[k].opacity = ringO[k] * (0.7 + 0.3 * b);
      });
    },
  };
}

export function mount(stage: HTMLElement) {
  return mountStage3D(stage, mntPlugin());
}
