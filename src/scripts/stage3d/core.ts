/**
 * Núcleo de las piezas 3D del configurador (ServiceStage.astro).
 *
 * Solo se carga con import() dinámico cuando un escenario con data-visual se
 * acerca a la pantalla, así que three.js no entra en el JS inicial.
 *
 * Cada línea aporta un "juego de formas" (ShapePlugin): construye un conjunto
 * fijo de piezas y dice la pose de cada una para cada servicio. El núcleo se
 * encarga de lo demás, igual para todas las líneas:
 * - un renderer y un lienzo por escenario, colocado sobre el hueco
 *   .stage__visual-box del panel activo (nunca encima de texto);
 * - la entrada la primera vez que se ve (900 ms, las piezas se montan desde
 *   posiciones algo dispersas) y el cambio de forma al recibir `stage:change`
 *   (700 ms, se puede cortar);
 * - reposo, inclinación hacia el puntero con paralaje entre capas, arrastre
 *   táctil con muelle y una sombra de contacto de cobre;
 * - parar el bucle fuera de pantalla o con la pestaña oculta;
 * - movimiento reducido: un fotograma quieto por servicio, sin bucle;
 * - liberar todo en pagehide.
 */
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  Color,
  DirectionalLight,
  Euler,
  Group,
  HemisphereLight,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
  type BufferGeometry,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Pose, Vec3 } from './web-shapes';

export interface Tokens {
  accent: Color;
  panel: Color;
  panel2: Color;
  ink: Color;
  inkSoft: Color;
  /** El valor CSS tal cual, para pintar en un <canvas> 2D. */
  accentCss: string;
}

export interface PieceItem {
  object: Object3D;
  /** Aplica opacidad y "desgaste" (0 nítida, 1 vieja) a sus materiales. */
  look(o: number, dim: number): void;
}

export interface ShapePlugin {
  pieceRotation: Vec3;
  camera: { fov: number; target: Vec3; eye(aspect: number): Vec3 };
  /** Sombra de contacto bajo la pieza (plano horizontal). */
  shadow?: { y: number; z: number; w: number; d: number };
  /** Construye las piezas; todo lo que cree debe colgar de `root`. */
  build(root: Group, tokens: Tokens): PieceItem[];
  /** Una pose por pieza, en el mismo orden que build(). */
  poses(index: number): Pose[];
  /** Pose "desmontada" de la que parte la entrada. */
  scattered?(pose: Pose, n: number): Pose;
}

const MORPH_MS = 700;
const ENTER_MS = 900;
const DPR_MAX = 1.75;

function readTokens(): Tokens {
  const css = getComputedStyle(document.documentElement);
  const raw = (name: string) => css.getPropertyValue(name).trim();
  const c = (name: string) => new Color(raw(name));
  return {
    accent: c('--accent'), panel: c('--panel'), panel2: c('--panel-2'), ink: c('--ink'), inkSoft: c('--ink-soft'),
    accentCss: raw('--accent'),
  };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Degradado radial de cobre para la sombra de contacto. */
function glowTexture(color: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'transparent');
  g.globalAlpha = 1;
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** Monta la pieza en un escenario. Devuelve la función que lo libera todo, o
    null si no hay WebGL (se queda el SVG estático). */
export function mountStage3D(stage: HTMLElement, plugin: ShapePlugin): (() => void) | null {
  const viewport = stage.querySelector<HTMLElement>('.stage__viewport');
  if (!viewport) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'stage__canvas';
  canvas.setAttribute('aria-hidden', 'true');

  // Se pide el contexto antes que three.js: sin WebGL se vuelve sin error en
  // consola y se queda la ilustración SVG.
  const attrs = { antialias: true, alpha: true, powerPreference: 'low-power' } as const;
  const gl = canvas.getContext('webgl2', attrs);
  if (!gl) return null;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, context: gl, ...attrs });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_MAX));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const tokens = readTokens();
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();

  const camera = new PerspectiveCamera(plugin.camera.fov, 1, 0.1, 60);

  // Luz suave de frente y un contraluz de cobre que dibuja los cantos.
  scene.add(new HemisphereLight(tokens.ink, tokens.panel, 0.3));
  const key = new DirectionalLight(tokens.ink, 0.9);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new DirectionalLight(tokens.accent, 3.6);
  rim.position.set(4, 1.5, -4);
  scene.add(rim);

  // Sombra de contacto: un resplandor de cobre muy suave en el "suelo".
  let shadow: Mesh<PlaneGeometry, MeshBasicMaterial> | null = null;
  if (plugin.shadow) {
    const { y, z, w, d } = plugin.shadow;
    shadow = new Mesh(
      new PlaneGeometry(w, d),
      new MeshBasicMaterial({ map: glowTexture(tokens.accentCss), transparent: true, opacity: 0.22, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, y, z);
    scene.add(shadow);
  }

  const piece = new Group();
  const baseRot = new Euler(...plugin.pieceRotation);
  piece.rotation.copy(baseRot);
  scene.add(piece);
  const items = plugin.build(piece, tokens);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --- Poses y cambio de forma ------------------------------------------ */
  type State = { p: Vec3; r: Vec3; s: number; o: number; dim: number };
  const clone = (q: Pose): State => ({ p: [...q.p] as Vec3, r: [...q.r] as Vec3, s: q.s, o: q.o, dim: q.dim });
  const tabs = [...stage.querySelectorAll('[role="tab"]')];
  let index = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  let to: State[] = plugin.poses(index).map(clone);
  // Con movimiento permitido se parte "desmontado" y la entrada lo monta.
  let entered = reduce.matches || !plugin.scattered;
  let current: State[] = entered ? to.map(clone) : to.map((q, n) => clone(plugin.scattered!(q, n)));
  let from: State[] = current.map(clone);
  let morphStart = -1;
  let morphMs = MORPH_MS;
  let morphEase = ease;

  // Paralaje: con el puntero, las capas de delante se mueven más que las de atrás.
  let parX = 0, parY = 0;
  function apply(states: State[]) {
    items.forEach((it, i) => {
      const q = states[i];
      const depth = q.p[2] + 0.6;
      it.object.position.set(q.p[0] + parX * depth, q.p[1] + parY * depth, q.p[2]);
      it.object.rotation.set(...q.r);
      it.object.scale.setScalar(q.s);
      it.look(q.o, q.dim);
    });
  }
  apply(current);

  function stepMorph(now: number) {
    if (morphStart < 0) return;
    const t = Math.min(1, (now - morphStart) / morphMs);
    const k = morphEase(t);
    current = from.map((a, i) => {
      const b = to[i];
      return {
        p: [lerp(a.p[0], b.p[0], k), lerp(a.p[1], b.p[1], k), lerp(a.p[2], b.p[2], k)],
        r: [lerp(a.r[0], b.r[0], k), lerp(a.r[1], b.r[1], k), lerp(a.r[2], b.r[2], k)],
        s: lerp(a.s, b.s, k),
        o: lerp(a.o, b.o, k),
        dim: lerp(a.dim, b.dim, k),
      };
    });
    if (t >= 1) morphStart = -1;
  }

  function startMorph(ms: number, curve: (t: number) => number) {
    // Arranca desde donde esté ahora: un cambio rápido corta el anterior.
    from = current.map(clone);
    morphStart = performance.now();
    morphMs = ms;
    morphEase = curve;
  }

  function onChange(e: Event) {
    const next = (e as CustomEvent<{ index: number }>).detail?.index ?? 0;
    if (next === index) return;
    index = next;
    to = plugin.poses(index).map(clone);
    if (reduce.matches || !running || !entered) {
      morphStart = -1;
      current = to.map(clone);
      entered = true;
      apply(current);
      render();
    } else {
      startMorph(MORPH_MS, ease);
    }
    requestAnimationFrame(place);
  }
  stage.addEventListener('stage:change', onChange);

  /* --- Tamaño y sitio del lienzo ------------------------------------------ */
  viewport.appendChild(canvas);
  let w = 0, h = 0;
  function place() {
    const panel = [...viewport!.querySelectorAll<HTMLElement>('.stage__panel')].find((p) => !p.hidden && !p.classList.contains('is-leaving'));
    const box = panel?.querySelector<HTMLElement>('.stage__visual-box');
    if (!panel || !box) return;
    const x = panel.offsetLeft + box.offsetLeft;
    const y = panel.offsetTop + box.offsetTop;
    canvas.style.transform = `translate(${x}px, ${y}px)`;
    if (box.clientWidth !== w || box.clientHeight !== h) {
      w = box.clientWidth;
      h = box.clientHeight;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.position.set(...plugin.camera.eye(camera.aspect));
      camera.lookAt(...plugin.camera.target);
      camera.updateProjectionMatrix();
      render();
    }
  }
  const ro = new ResizeObserver(() => place());
  ro.observe(viewport);

  /* --- Puntero: inclinación (ratón) y arrastre con muelle (táctil) -------- */
  const fine = window.matchMedia('(pointer: fine)');
  let tiltX = 0, tiltY = 0, tiltTX = 0, tiltTY = 0;
  let drag = 0, dragV = 0, dragTarget = 0, dragging = false, dragX0 = 0;

  function onMove(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || !fine.matches) return;
    const r = canvas.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2 + 200)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2 + 200)));
    tiltTY = nx * 0.2;
    tiltTX = ny * 0.12;
  }
  function onLeave() { tiltTX = 0; tiltTY = 0; }
  function onDown(e: PointerEvent) {
    if (e.pointerType === 'mouse') return;
    // Que el gesto de deslizar del escenario no cambie de servicio.
    e.stopPropagation();
    dragging = true;
    dragX0 = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  }
  function onDrag(e: PointerEvent) {
    if (!dragging) return;
    dragTarget = Math.max(-0.6, Math.min(0.6, (e.clientX - dragX0) * 0.008));
  }
  function onUp(e: PointerEvent) {
    if (!dragging) return;
    e.stopPropagation();
    dragging = false;
    dragTarget = 0;
  }
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onDrag);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  /* --- Bucle ---------------------------------------------------------------- */
  let raf = 0;
  let running = false;
  let onScreen = false;
  let idle = 0;
  let last = performance.now();

  function render() {
    renderer.render(scene, camera);
  }

  function frame(now: number) {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    idle += dt;
    stepMorph(now);
    // Muelle del arrastre: vuelve solo al soltar.
    if (dragging) drag = lerp(drag, dragTarget, 0.35);
    else {
      dragV = dragV * 0.82 + (dragTarget - drag) * 0.12;
      drag += dragV;
    }
    tiltX = lerp(tiltX, tiltTX, 0.06);
    tiltY = lerp(tiltY, tiltTY, 0.06);
    parX = tiltY * 0.35;
    parY = -tiltX * 0.35;
    apply(current);
    piece.rotation.set(
      baseRot.x + tiltX + Math.sin(idle * 0.5) * 0.02,
      baseRot.y + tiltY + drag + Math.sin(idle * 0.31) * 0.05,
      baseRot.z,
    );
    const float = Math.sin(idle * 0.7) * 0.05;
    piece.position.y = float;
    // La sombra se abre y se apaga un poco cuando la pieza sube.
    if (shadow) shadow.material.opacity = 0.22 - float * 0.6;
    render();
    raf = requestAnimationFrame(frame);
  }

  function sync() {
    const should = onScreen && !document.hidden && !reduce.matches;
    if (should === running) return;
    running = should;
    if (running) {
      last = performance.now();
      // Primera vez a la vista: las piezas se montan.
      if (!entered) {
        entered = true;
        startMorph(ENTER_MS, easeOut);
      }
      raf ||= requestAnimationFrame(frame);
    } else {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      // Al parar a medio cambio, se termina en seco.
      if (morphStart >= 0) {
        morphStart = -1;
        current = to.map(clone);
      }
      if (reduce.matches) {
        entered = true;
        current = to.map(clone);
        parX = parY = 0;
        piece.rotation.copy(baseRot);
        piece.position.y = 0;
      }
      apply(current);
      render();
    }
  }
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  io.observe(canvas);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);

  place();
  render();
  // Primer fotograma pintado: el lienzo aparece y el SVG se funde.
  requestAnimationFrame(() => {
    canvas.classList.add('is-live');
    stage.classList.add('has-3d');
  });

  return function dispose() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    stage.removeEventListener('stage:change', onChange);
    stage.removeEventListener('pointermove', onMove);
    stage.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', sync);
    reduce.removeEventListener('change', sync);
    const geos = new Set<BufferGeometry>();
    const mats = new Set<Material>();
    scene.traverse((o) => {
      const m = o as Mesh;
      if (m.geometry) geos.add(m.geometry);
      if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => mats.add(x));
    });
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => {
      (m as MeshBasicMaterial).map?.dispose();
      m.dispose();
    });
    envTarget.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    stage.classList.remove('has-3d');
  };
}
