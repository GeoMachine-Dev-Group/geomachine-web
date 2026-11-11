import {
  ACESFilmicToneMapping,
  HemisphereLight,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  type Mesh,
  type Object3D,
} from 'three';
import { buildBeam, buildDust } from './atmosphere';
import { buildEnvironment } from './env';
import { clamp } from './noise';
import {
  buildBlueprint,
  buildCaliper,
  buildDesk,
  buildFoldedPlan,
  buildKeyboard,
  buildLamp,
  buildLetter,
  buildMaterials,
  buildStamp,
  type Quality,
} from './objects';

/* Escena 3D del hero "atelier privado": la mesa de un artesano, de noche.

   Cómo se encuadra. La cámara mira la mesa desde arriba y de frente, con un
   teleobjetivo, y la escala es fija en píxeles por metro: si el hero crece (otro
   idioma, otro ancho) se ve más mesa, no objetos más grandes. Los objetos no
   tienen coordenadas fijas: se colocan proyectando sobre el tablero puntos de la
   pantalla tomados del propio hero (el título, la marca, la columna de texto).
   Así la luz cae siempre detrás del titular y las piezas asoman por los márgenes,
   en cualquier idioma y a cualquier ancho.

   Dos modos, que elige el CSS con --hero-scene-mode:
   - wide: el lienzo ocupa todo el hero y los objetos rodean la columna de texto.
   - band: en pantallas estrechas no hay márgenes, así que la escena vive en una
     franja bajo el hero, con un encuadre más cerrado. */

const FOV = 28;
const BEAM_SPREAD = 0.82; // tangente del semiángulo visible del haz
const BEAM_LENGTH = 0.5;

type Mode = 'wide' | 'band';

interface Framing {
  /** Inclinación de la cámara sobre la horizontal, en radianes. */
  pitch: number;
  /** Píxeles CSS por metro en el punto al que mira la cámara. */
  scale: (w: number, h: number) => number;
  /** Factor sobre la intensidad de la lámpara: en la franja los papeles quedan mucho más cerca. */
  light: number;
}

const FRAMING: Record<Mode, Framing> = {
  wide: { pitch: 0.74, scale: () => 820, light: 1 },
  band: { pitch: 0.62, scale: (w) => w / 0.95, light: 0.52 },
};

const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export async function mount(host: HTMLElement): Promise<void> {
  const canvas = host.querySelector('canvas');
  const stage = host.parentElement;
  if (!canvas || !stage) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 700;
  const dprCap = coarse || small ? 1.5 : 2;
  let dpr = Math.min(devicePixelRatio || 1, dprCap);

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: dpr < 2,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // nada se mueve salvo la cámara: la sombra se calcula una vez

  const quality: Quality = {
    wood: small ? 1024 : 2048,
    anisotropy: Math.min(small ? 4 : 8, renderer.capabilities.getMaxAnisotropy()),
    shadow: small ? 1024 : 2048,
    dust: small ? 220 : 520,
  };

  // --- Construcción, repartida en varias tareas para no bloquear la página. ---
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 12);
  const materials = buildMaterials(quality);
  await pause();

  scene.add(buildDesk(materials));
  const lamp = buildLamp(materials, quality.shadow);
  const blueprint = buildBlueprint(quality.anisotropy);
  const folded = buildFoldedPlan(quality.anisotropy);
  const caliper = buildCaliper(materials, quality.anisotropy);
  await pause();
  const letter = buildLetter(materials, quality.anisotropy);
  const stamp = buildStamp(materials);
  const keyboard = buildKeyboard(materials);
  scene.add(lamp.group, blueprint, folded, caliper, letter, stamp, keyboard);

  const beam = buildBeam(BEAM_LENGTH, lamp.mouthRadius, BEAM_SPREAD);
  const dust = buildDust(quality.dust, BEAM_LENGTH, lamp.mouthRadius, BEAM_SPREAD);
  beam.mesh.position.y = dust.points.position.y = -lamp.mouth;
  lamp.head.add(beam.mesh, dust.points);

  // Relleno difuso, frío y muy bajo (la noche que entra por la ventana). Con él
  // la madera que queda fuera de la lámpara no es negro puro sino el verde casi
  // negro de la página, y los velos del texto, que son de ese color, se funden
  // con la mesa sin dejar borde. Es difuso puro: no añade brillos.
  scene.add(new HemisphereLight('#95cbbc', '#3a3020', 1));
  await pause();
  // El entorno se asigna material a material, no a scene.environment: con este
  // último Three.js ignora el envMapIntensity de cada material y aplica a todos
  // el de la escena, y aquí cada uno necesita el suyo (ver objects.ts).
  const environment = buildEnvironment(renderer);
  scene.traverse((o) => {
    const material = (o as Mesh).material;
    if (material instanceof MeshStandardMaterial) material.envMap = environment;
  });

  // --- Encuadre y composición. ---
  const target = new Vector3();
  let mode: Mode = 'wide';
  let width = 0;
  let height = 0;
  let distance = 2;
  const SPOT = 1.7;
  const ENAMEL = materials.enamel.emissiveIntensity;
  const BEAM = beam.material.uniforms.uStrength.value as number;

  const setCamera = (yaw: number, pitchOffset: number, dolly: number) => {
    const pitch = FRAMING[mode].pitch + pitchOffset;
    const d = distance * dolly;
    camera.position.set(Math.sin(yaw) * Math.cos(pitch) * d, Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d);
    camera.position.add(target);
    camera.lookAt(target);
  };

  const ray = new Vector3();
  /** Punto del mundo, a una altura dada, que se ve en el píxel (x, y) del lienzo. */
  const worldAt = (x: number, y: number, atHeight = 0): Vector3 => {
    ray.set((x / width) * 2 - 1, -((y / height) * 2 - 1), 0.5).unproject(camera).sub(camera.position);
    const t = (atHeight - camera.position.y) / ray.y;
    return camera.position.clone().addScaledVector(ray, t);
  };
  const put = (o: Object3D, p: Vector3, rotY: number) => {
    o.position.set(p.x, 0, p.z);
    o.rotation.y = rotY;
  };

  const rectIn = (selector: string) => {
    const el = stage.querySelector<HTMLElement>(selector);
    if (!el) return null;
    const a = el.getBoundingClientRect();
    const b = host.getBoundingClientRect();
    return { left: a.left - b.left, right: a.right - b.left, top: a.top - b.top, bottom: a.bottom - b.top, cx: (a.left + a.right) / 2 - b.left, cy: (a.top + a.bottom) / 2 - b.top };
  };

  const compose = () => {
    setCamera(0, 0, 1);
    camera.updateMatrixWorld(true);
    const W = width;
    const H = height;
    const S = FRAMING[mode].scale(W, H);
    // Dirección horizontal del pie a la cabeza de la lámpara: viene de la derecha y del fondo.
    const armDir = new Vector3(-0.58, 0, 0.81).normalize();
    const yaw = Math.atan2(-armDir.z, armDir.x);
    let headAt: Vector3;
    let pool: Vector3;

    if (mode === 'wide') {
      const fallback = { left: W * 0.2, right: W * 0.8, top: H * 0.3, bottom: H * 0.5, cx: W / 2, cy: H * 0.4 };
      const title = rectIn('.hero__title') ?? fallback;
      const body = rectIn('.hero__body') ?? title;
      const prices = rectIn('.hero__prices') ?? title;
      const veil = 72; // lo que sobresale el velo de cada bloque de texto
      pool = worldAt(W / 2 + 30, title.cy);
      headAt = worldAt(W / 2 + clamp(W * 0.235, 250, 380), title.top * 0.36, lamp.headHeight);
      // Margen izquierdo, de arriba abajo: teclado, plano abierto, plano doblado con el pie de rey.
      put(keyboard, worldAt(W / 2 - clamp(W * 0.27, 330, 520), title.top * 0.45), 0.2);
      put(blueprint, worldAt(body.left - veil - 0.19 * S, (title.cy + body.bottom) / 2 + 20), 0.25);
      const stack = worldAt(prices.left - 0.17 * S, prices.cy + 55);
      put(folded, stack, -0.35);
      put(caliper, stack, 0.5);
      caliper.position.y = 0.0048;
      // Margen derecho: la lámpara arriba, el cuño y la carta lacrada abajo.
      put(stamp, worldAt(body.right + veil + 34, body.cy + 34), 0);
      put(letter, worldAt(prices.right + 0.14 * S, prices.cy - 10), -0.4);
    } else {
      // Franja: todo junto y al alcance de la lámpara, con el charco de luz
      // sobre la madera, entre los papeles.
      pool = worldAt(W * 0.42, H * 0.78);
      headAt = worldAt(W * 0.7, H * 0.37, lamp.headHeight);
      put(keyboard, worldAt(W * 0.4, H * 0.5), 0.1);
      put(blueprint, worldAt(W * 0.05, H * 0.56), 0.45);
      const stack = worldAt(W * 0.27, H * 0.85);
      put(folded, stack, -0.2);
      put(caliper, stack, 0.35);
      caliper.position.y = 0.0048;
      put(letter, worldAt(W * 0.71, H * 0.87), -0.25);
      put(stamp, worldAt(W * 0.9, H * 0.72), 0);
    }
    const base = new Vector3(headAt.x, 0, headAt.z).addScaledVector(armDir, -lamp.reach);
    lamp.pose(base, yaw, pool);
    renderer.shadowMap.needsUpdate = true;
  };

  const readMode = (): Mode => (getComputedStyle(host).getPropertyValue('--hero-scene-mode').trim() === 'band' ? 'band' : 'wide');

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    width = w;
    height = h;
    mode = readMode();
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const focal = h / 2 / Math.tan((FOV * Math.PI) / 360); // px CSS por metro a 1 m
    distance = focal / FRAMING[mode].scale(w, h);
    dust.material.uniforms.uFocal.value = focal * dpr;
    compose();
  };

  // --- Movimiento. ---
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let time = 0;
  const stats = { frames: 0, ms: 0, dpr };
  (window as unknown as { __heroScene?: typeof stats }).__heroScene = stats;

  const draw = (dt: number) => {
    time += dt;
    const ease = 1 - Math.exp(-dt * 2.2);
    pointer.sx += (pointer.x - pointer.sx) * ease;
    pointer.sy += (pointer.y - pointer.sy) * ease;
    const still = reducedMotion.matches;
    const t = still ? 0 : time;
    // Deriva: tres ritmos lentos y desacompasados, para que nunca se repita a la vista.
    const yaw = Math.sin(t * 0.11) * 0.011 + Math.sin(t * 0.047 + 1.3) * 0.008 + pointer.sx * 0.03;
    const pitch = Math.sin(t * 0.083 + 0.5) * 0.005 - pointer.sy * 0.016;
    const dolly = 1 + Math.sin(t * 0.06 + 2) * 0.01;
    setCamera(yaw, pitch, dolly);
    // Parpadeo de filamento: un par de puntos porcentuales, sin patrón reconocible.
    const flicker = still ? 1 : 1 + 0.011 * Math.sin(t * 9.1) + 0.008 * Math.sin(t * 23.3 + 1.7) + 0.014 * Math.sin(t * 1.9 + Math.sin(t * 0.7) * 2);
    lamp.spot.intensity = SPOT * FRAMING[mode].light * flicker;
    materials.enamel.emissiveIntensity = ENAMEL * flicker;
    beam.material.uniforms.uStrength.value = BEAM * flicker;
    dust.material.uniforms.uTime.value = t;
    const t0 = performance.now();
    renderer.render(scene, camera);
    stats.ms += performance.now() - t0;
    stats.frames++;
  };

  let raf = 0;
  let last = 0;
  let onScreen = true;
  let dead = false;
  let slow = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    // Si el equipo no llega a ~50 fps de forma sostenida, se baja la resolución un escalón.
    slow = dt > 0.022 ? slow + 1 : Math.max(0, slow - 2);
    if (slow > 45 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.25);
      stats.dpr = dpr;
      slow = 0;
      resize();
    }
    draw(dt);
  };
  const sync = () => {
    if (dead) return;
    const run = onScreen && !document.hidden && !reducedMotion.matches;
    if (run && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (!run && onScreen && !document.hidden) draw(0); // escena quieta: un solo fotograma
  };

  new ResizeObserver(() => {
    resize();
    if (!raf) draw(0);
  }).observe(host);
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  }).observe(host);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);

  if (!coarse) {
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse') return;
        pointer.x = (e.clientX / innerWidth) * 2 - 1;
        pointer.y = (e.clientY / innerHeight) * 2 - 1;
      },
      { passive: true },
    );
  } else if ('DeviceOrientationEvent' in window && typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission !== 'function') {
    // Inclinación del móvil, solo donde no hay que pedir permiso (en iOS haría
    // falta un gesto y un diálogo: no compensa, se queda sin parallax).
    let zero: { b: number; g: number } | null = null;
    window.addEventListener(
      'deviceorientation',
      (e) => {
        if (e.beta == null || e.gamma == null) return;
        zero ??= { b: e.beta, g: e.gamma };
        pointer.x = clamp((e.gamma - zero.g) / 18, -1, 1);
        pointer.y = clamp((e.beta - zero.b) / 18, -1, 1);
      },
      { passive: true },
    );
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    dead = true;
    host.dispatchEvent(new Event('hero-scene:lost')); // el cargador pone el póster
  });

  if (import.meta.env.DEV) Object.assign(window, { __heroDebug: { scene, camera, renderer, lamp, materials, beam, dust, compose, draw } });

  resize();
  await pause();
  draw(0);
  host.classList.add('is-live');
  sync();
}
