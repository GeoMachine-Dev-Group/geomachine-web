/**
 * Pieza 3D de la línea IA: nodos de vidrio ahumado unidos por hilos de cobre,
 * con pulsos de luz que viajan por los hilos (ver ia-shapes.ts). Se importa
 * con import() desde ServiceStage.astro; three.js viaja en el trozo común.
 */
import {
  AdditiveBlending,
  Vector3,
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
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  type BufferAttribute,
  type Object3D,
} from 'three';
import { glowTexture, mountStage3D, type PieceItem, type ShapePlugin, type Tokens } from './core';
import { CAMERA, PIECE_ROT, SHADOW, cameraEye, cameraTarget } from './web-shapes';
import { CASE, EDGES, NODE_COUNT, NODE_R, PULSE_SPEED, edgePhase, iaScattered, iaShapes, stillT } from './ia-shapes';

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

function circle(r: number, segments = 48) {
  const g = new BufferGeometry();
  const pts: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * r, Math.sin(a) * r, 0);
  }
  g.setAttribute('position', new Float32BufferAttribute(pts, 3));
  return g;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function iaPlugin(): ShapePlugin {
  // Estado que comparten build() y update(), uno por escenario montado.
  let nodeObjs: Object3D[] = [];
  let edgeObjs: Array<{ g: Group; pos: BufferAttribute; pulse: Sprite; o: () => number; rev: () => boolean }> = [];
  let hot: Array<{ halo: Sprite; core: MeshBasicMaterial; level: () => number; o: () => number }> = [];
  // Los aros de los nodos miran siempre a la cámara (aprox. la del lienzo
  // vertical): así son el contorno de la esfera y no una órbita torcida.
  const rings: LineLoop[] = [];
  const eye = new Vector3(...cameraEye(0.8));

  return {
    pieceRotation: PIECE_ROT,
    camera: { fov: CAMERA.fov, target: cameraTarget, eye: cameraEye },
    shadow: SHADOW,
    scattered: iaScattered,

    build(root: Group, t: Tokens): PieceItem[] {
      const tint = t.panel2.clone().offsetHSL(0.01, 0.1, 0.03);
      const glowMap = glowTexture(t.accentCss);
      const items: PieceItem[] = [];
      nodeObjs = [];
      edgeObjs = [];
      hot = [];

      /* Nodos: esfera de vidrio, aro de cobre y núcleo que se enciende. */
      const sphere = new SphereGeometry(NODE_R, 32, 20);
      const ring = circle(NODE_R * 1.02);
      const coreGeo = new SphereGeometry(NODE_R * 0.32, 16, 10);
      for (let n = 0; n < NODE_COUNT; n++) {
        const g = new Group();
        const body = glass(tint.clone(), 0.8);
        const edge = lines(t.accent.clone());
        const core = new MeshBasicMaterial({ color: t.accent.clone(), transparent: true, depthWrite: false, blending: AdditiveBlending });
        const halo = new Sprite(new SpriteMaterial({ map: glowMap, color: t.accent.clone(), transparent: true, depthWrite: false, blending: AdditiveBlending }));
        halo.scale.setScalar(NODE_R * 7);
        const loop = new LineLoop(ring, edge);
        rings.push(loop);
        g.add(new Mesh(sphere, body), loop, new Mesh(coreGeo, core), halo);
        root.add(g);
        nodeObjs.push(g);
        let level = 0, op = 0;
        hot.push({ halo, core, level: () => level, o: () => op });
        items.push({
          object: g,
          look(o, dim) {
            op = o;
            level = dim;
            g.visible = o > 0.005;
            body.opacity = o * lerp(0.55, 0.62, dim);
            edge.opacity = o * lerp(0.75, 1, dim);
          },
        });
      }

      /* Caja de vidrio de «IA privada»: el servidor que encierra la red. */
      {
        const g = new Group();
        const geo = new BoxGeometry(CASE.w, CASE.h, CASE.d);
        const body = glass(tint.clone(), 0.6);
        const edge = lines(t.accent.clone());
        // Un zócalo fino al pie de la cara frontal: lo justo para leerlo como
        // un equipo y no como una vitrina.
        const z = CASE.d / 2 + 0.004, x = CASE.w / 2 - 0.16, y = -CASE.h / 2 + 0.16;
        const plinth = new BufferGeometry();
        plinth.setAttribute('position', new Float32BufferAttribute([
          -x, y, z, x, y, z,
          x - 0.42, y - 0.07, z, x - 0.3, y - 0.07, z,
          x - 0.2, y - 0.07, z, x - 0.08, y - 0.07, z,
        ], 3));
        const detail = lines(t.accent.clone());
        g.add(new Mesh(geo, body), new LineSegments(new EdgesGeometry(geo), edge), new LineSegments(plinth, detail));
        root.add(g);
        items.push({
          object: g,
          look(o) {
            g.visible = o > 0.005;
            body.opacity = o * 0.2;
            edge.opacity = o * 0.95;
            detail.opacity = o * 0.5;
          },
        });
      }

      /* Hilos y pulsos: uno por pareja de EDGES. Se tienden en update(). */
      EDGES.forEach(() => {
        const g = new Group();
        const geo = new BufferGeometry();
        const pos = new Float32BufferAttribute(new Float32Array(6), 3);
        geo.setAttribute('position', pos);
        const line = lines(t.accent.clone());
        // Pulso: un resplandor de cobre con un punto caliente, más claro, dentro.
        const pulse = new Sprite(new SpriteMaterial({ map: glowMap, color: t.accent.clone(), transparent: true, depthWrite: false, blending: AdditiveBlending }));
        pulse.scale.setScalar(0.5);
        const spark = new Sprite(new SpriteMaterial({ map: glowMap, color: t.accent.clone().lerp(t.ink, 0.7), transparent: true, depthWrite: false, blending: AdditiveBlending }));
        spark.scale.setScalar(0.32);
        pulse.add(spark);
        const seg = new LineSegments(geo, line);
        seg.frustumCulled = false;
        g.add(seg, pulse);
        root.add(g);
        let op = 0, rev = false;
        edgeObjs.push({ g, pos, pulse, o: () => op, rev: () => rev });
        items.push({
          object: g,
          look(o, dim) {
            op = o;
            rev = dim > 0.5;
            g.visible = o > 0.005;
            line.opacity = o * 0.55;
          },
        });
      });
      return items;
    },

    poses(index: number) {
      const s = iaShapes(index);
      return [...s.nodes, s.box, ...s.edges];
    },

    update(time: number, still: boolean) {
      rings.forEach((r) => r.lookAt(eye));
      // Nodos destacados: núcleo encendido y un halo que respira despacio.
      hot.forEach((h, n) => {
        const breathe = still ? 0.8 : 0.8 + 0.2 * Math.sin(time * 1.6 + n);
        h.core.opacity = h.o() * lerp(0.35, 1, h.level());
        h.halo.material.opacity = h.o() * h.level() * 0.55 * breathe;
        h.halo.visible = h.level() > 0.02;
      });
      // Hilos: de nodo a nodo, en el sistema del grupo del hilo.
      edgeObjs.forEach((e, k) => {
        if (!e.g.visible) return;
        const [ia, ib] = EDGES[k];
        const a = nodeObjs[ia].position, b = nodeObjs[ib].position, c = e.g.position;
        const arr = e.pos.array as Float32Array;
        arr[0] = a.x - c.x; arr[1] = a.y - c.y; arr[2] = a.z - c.z;
        arr[3] = b.x - c.x; arr[4] = b.y - c.y; arr[5] = b.z - c.z;
        e.pos.needsUpdate = true;
        const len = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) || 1;
        let u = still ? stillT(k) : (time * PULSE_SPEED) / len + edgePhase(k);
        u -= Math.floor(u);
        if (e.rev()) u = 1 - u;
        e.pulse.position.set(lerp(arr[0], arr[3], u), lerp(arr[1], arr[4], u), lerp(arr[2], arr[5], u));
        // Se enciende al salir de un nodo y se apaga al llegar al otro.
        const env = e.o() * Math.pow(Math.sin(Math.PI * u), 1.2);
        e.pulse.material.opacity = env * 0.9;
        (e.pulse.children[0] as Sprite).material.opacity = env;
      });
    },
  };
}

export function mount(stage: HTMLElement) {
  return mountStage3D(stage, iaPlugin());
}
