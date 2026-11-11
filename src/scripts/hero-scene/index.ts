import { rng } from './noise';
import { buildShape, SHAPE_ORDER, type ShapeId } from './shapes';

/* Escultura de partículas del hero. Decenas de miles de puntos de luz que
   forman, una tras otra, las seis líneas del catálogo (web, app, IA,
   mantenimiento, SEO, sistemas) y se deshacen en un remolino para pasar de una a
   otra. WebGL 2 a pelo, sin librerías: es un solo programa y una llamada de
   dibujo, así que el módulo entero pesa unos pocos KB.

   Todo el movimiento ocurre en el vertex shader. Cada figura es un búfer
   estático; transformarse es dibujar interpolando entre dos de ellos, sin tocar
   memoria por fotograma. La profundidad de campo es por partícula: cuanto más
   lejos del plano de foco, más grande y más tenue (misma energía, más área). */

const VERT = /* glsl */ `#version 300 es
layout(location = 0) in vec4 aFrom;
layout(location = 1) in vec4 aTo;
layout(location = 2) in vec4 aSeed;
uniform float uMix, uTime, uYaw, uPitch, uAspect, uHeight, uZoom, uPointerOn, uHalo;
uniform vec2 uPointer;
out vec3 vColor;
out float vAlpha;

const float DIST = 4.4;
const float F = 3.2; // 1 / tan(fov / 2)

vec3 tone(float t) {
  if (t < 0.5) return vec3(0.96, 0.92, 0.83);
  if (t < 1.5) return vec3(0.92, 0.55, 0.27);
  if (t < 2.5) return vec3(0.86, 0.22, 0.2);
  return vec3(0.42, 0.5, 0.42);
}

void main() {
  float isFloor = step(9.5, aFrom.w);
  // Cada partícula sale con su propio retraso: la figura no cambia de golpe,
  // se va deshaciendo y rehaciendo.
  float t = clamp(uMix * 1.7 - aSeed.x * 0.7, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(aFrom.xyz, aTo.xyz, t);
  float burst = sin(t * 3.14159) * (1.0 - isFloor);
  // En mitad del cambio, las partículas se abren en remolino alrededor del eje.
  float ang = burst * (aSeed.y - 0.5) * 3.2;
  p.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xz;
  p += burst * 0.27 * vec3(sin(aSeed.y * 40.0 + uTime * 0.7), cos(aSeed.z * 37.0 + uTime * 0.6), sin(aSeed.w * 31.0 + uTime * 0.5));
  // En reposo respiran un poco: nunca están quietas del todo.
  p += 0.007 * vec3(sin(uTime * 0.8 + aSeed.y * 50.0), cos(uTime * 0.7 + aSeed.z * 50.0), sin(uTime * 0.9 + aSeed.w * 50.0));

  float cy = cos(uYaw), sy = sin(uYaw), cp = cos(uPitch), sp = sin(uPitch);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  p = vec3(p.x, cp * p.y - sp * p.z, sp * p.y + cp * p.z);

  float depth = DIST - p.z;
  vec2 ndc = vec2(p.x * F / uAspect, p.y * F) * uZoom / depth + vec2(0.0, 0.07);
  // El cursor aparta las partículas que tiene cerca.
  vec2 away = ndc - uPointer;
  away.x *= uAspect;
  float near = exp(-dot(away, away) * 26.0) * uPointerOn * (1.0 - isFloor);
  ndc += normalize(away + 1e-5) * vec2(1.0 / uAspect, 1.0) * near * 0.09;
  gl_Position = vec4(ndc, 0.0, 1.0);

  // Profundidad de campo: círculo de confusión según la distancia al foco.
  float size = 0.0072 + 0.0062 * aSeed.w;
  float blur = abs(depth - DIST) * 0.034 + burst * 0.012;
  float px = uHeight * 0.5 * F * uZoom / depth;
  // Segunda pasada (uHalo = 1): la misma nube, mucho más gorda y muy tenue. Es el
  // resplandor: un bloom sin posprocesado.
  gl_PointSize = max(1.5, (size + blur) * px * mix(1.0, 5.5, uHalo));
  float focus = size / (size + blur) * mix(1.0, 0.16, uHalo);
  float fromTone = aFrom.w - isFloor * 10.0;
  float toTone = aTo.w - isFloor * 10.0;
  vColor = mix(tone(fromTone), tone(toTone), t);
  float dim = mix(1.0, 0.42, step(2.5, mix(fromTone, toTone, t)));
  vAlpha = focus * focus * dim * mix(1.0, 2.4, isFloor) * (0.72 + 0.28 * sin(uTime * (0.6 + aSeed.z) + aSeed.w * 30.0));
}`;

const FRAG = /* glsl */ `#version 300 es
precision mediump float;
in vec3 vColor;
in float vAlpha;
out vec4 outColor;
uniform float uGain;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.15, d) * vAlpha * uGain;
  outColor = vec4(vColor * a, a * 0.6);
}`;

interface LineInfo {
  id: ShapeId;
  name: string;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
  return shader;
}

export function mount(host: HTMLElement): void {
  const canvas = host.querySelector('canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
  if (!gl) throw new Error('webgl2');

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 700;
  let dpr = Math.min(devicePixelRatio || 1, coarse || small ? 1.5 : 2);
  const count = small ? 22000 : 46000;

  const lines: LineInfo[] = (JSON.parse(host.dataset.lines ?? '[]') as LineInfo[]).filter((l) => SHAPE_ORDER.includes(l.id));
  const order = lines.length ? lines.map((l) => l.id) : SHAPE_ORDER;

  // --- Programa y búferes. ---
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link');
  gl.useProgram(program);
  const U = Object.fromEntries(
    ['uMix', 'uTime', 'uYaw', 'uPitch', 'uAspect', 'uHeight', 'uZoom', 'uPointer', 'uPointerOn', 'uGain', 'uHalo'].map((n) => [n, gl.getUniformLocation(program, n)]),
  );

  const buffers = new Map<ShapeId, WebGLBuffer>();
  const load = (id: ShapeId) => {
    const b = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, buildShape(id, count), gl.STATIC_DRAW);
    buffers.set(id, b);
  };
  load(order[0]); // la primera, ya; las demás, de una en una y sin prisa (ver abajo)
  const r = rng(77);
  const seeds = new Float32Array(count * 4).map(() => r());
  const seedBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  gl.enableVertexAttribArray(1);
  const bind = (from: ShapeId, to: ShapeId) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.get(from)!);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.get(to)!);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
  };

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // luz que se suma
  gl.clearColor(0, 0, 0, 0);

  // --- Estado. ---
  const HOLD = 5.2; // segundos que se sostiene cada figura
  const MORPH = 1.8; // segundos que dura el cambio
  let current = 0;
  let next = 0;
  let mix = 1;
  let queued: number | null = null;
  let held = 0;
  let time = 0;
  let width = 0;
  let height = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, on: 0, son: 0, ndcX: 0, ndcY: 0 };
  const stats = { frames: 0, ms: 0, dpr, count };
  (window as unknown as { __heroScene?: typeof stats }).__heroScene = stats;

  const caption = host.querySelector<HTMLAnchorElement>('[data-hero-caption]');
  const label = (i: number) => {
    const line = lines[i];
    if (!caption || !line) return;
    caption.href = `#${line.id.toLowerCase()}`;
    caption.querySelector('[data-hero-index]')!.textContent = `${String(i + 1).padStart(2, '0')} / ${String(order.length).padStart(2, '0')}`;
    caption.querySelector('[data-hero-name]')!.textContent = line.name;
    caption.classList.remove('is-swapping');
    void caption.offsetWidth; // reinicia la animación del rótulo
    caption.classList.add('is-swapping');
  };

  const go = (i: number) => {
    if (i === next || i < 0) return;
    if (mix < 1 || !buffers.has(order[i])) {
      queued = i; // ya hay un cambio en marcha: este espera turno
      return;
    }
    current = next;
    next = i;
    mix = reducedMotion.matches ? 1 : 0;
    if (reducedMotion.matches) current = next;
    held = 0;
    bind(order[current], order[next]);
    label(next);
    if (!raf) draw(0);
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    width = w;
    height = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const draw = (dt: number) => {
    const still = reducedMotion.matches;
    if (!still) time += dt;
    if (mix < 1) {
      mix = Math.min(1, mix + dt / MORPH);
      if (mix >= 1) {
        current = next;
        if (queued !== null && buffers.has(order[queued])) {
          const q = queued;
          queued = null;
          go(q);
        }
      }
    } else if (!still && !pointer.on) {
      held += dt;
      if (queued !== null && buffers.has(order[queued])) {
        const q = queued;
        queued = null;
        go(q);
      } else if (held > HOLD) go((next + 1) % order.length);
    }
    const ease = 1 - Math.exp(-dt * 3);
    pointer.sx += (pointer.x - pointer.sx) * ease;
    pointer.sy += (pointer.y - pointer.sy) * ease;
    pointer.son += (pointer.on - pointer.son) * ease;

    const t0 = performance.now();
    const aspect = width / height;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.uMix, mix);
    gl.uniform1f(U.uTime, time);
    // Vaivén lento, más lo que empuje el cursor: lo justo para que se lea el volumen.
    gl.uniform1f(U.uYaw, (still ? -0.32 : Math.sin(time * 0.22) * 0.42) + pointer.sx * 0.22);
    gl.uniform1f(U.uPitch, 0.14 - pointer.sy * 0.1);
    gl.uniform1f(U.uAspect, aspect);
    gl.uniform1f(U.uHeight, canvas.height);
    // La escultura mide ±1,25 de ancho y ±1,1 de alto: se ajusta a lo que mande.
    gl.uniform1f(U.uZoom, Math.min(1, aspect / 1.12) * 1.0);
    gl.uniform2f(U.uPointer, pointer.ndcX, pointer.ndcY);
    gl.uniform1f(U.uPointerOn, pointer.son);
    gl.uniform1f(U.uGain, 0.42 * Math.sqrt(46000 / count) * Math.min(1.6, Math.max(0.8, 620 / height)));
    gl.uniform1f(U.uHalo, 1);
    gl.drawArrays(gl.POINTS, 0, count);
    gl.uniform1f(U.uHalo, 0);
    gl.drawArrays(gl.POINTS, 0, count);
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
    // Si el equipo no sostiene ~50 fps, se baja la resolución un escalón.
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
    if (!run && onScreen && !document.hidden) draw(0); // escena quieta: un fotograma
  };

  bind(order[0], order[0]);
  resize();
  draw(0);
  host.classList.add('is-live');

  new ResizeObserver(() => {
    if (canvas.clientWidth === width && canvas.clientHeight === height) return;
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
        const box = canvas.getBoundingClientRect();
        pointer.ndcX = ((e.clientX - box.left) / box.width) * 2 - 1;
        pointer.ndcY = -(((e.clientY - box.top) / box.height) * 2 - 1);
        pointer.on = Math.abs(pointer.ndcX) < 1.1 && Math.abs(pointer.ndcY) < 1.1 ? 1 : 0;
      },
      { passive: true },
    );
  }

  // Los tres precios del hero y los puntos del rótulo llevan a su figura.
  const section = host.closest('section');
  section?.querySelectorAll<HTMLAnchorElement>('a.hero__price[href^="#"]').forEach((a) => {
    const i = order.indexOf(a.hash.slice(1).toUpperCase() as ShapeId);
    if (i < 0) return;
    const show = () => go(i);
    a.addEventListener('pointerenter', show);
    a.addEventListener('focus', show);
  });
  host.querySelectorAll<HTMLButtonElement>('[data-hero-go]').forEach((b) => {
    b.addEventListener('click', () => go(order.indexOf(b.dataset.heroGo as ShapeId)));
  });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    dead = true;
    host.dispatchEvent(new Event('hero-scene:lost'));
  });

  // El resto de figuras se generan una por tarea, con la primera ya en pantalla.
  const rest = order.slice(1);
  const loadNext = () => {
    const id = rest.shift();
    if (!id) return;
    load(id);
    setTimeout(loadNext, 60);
  };
  setTimeout(loadNext, 200);

  if (import.meta.env.DEV) Object.assign(window, { __heroDebug: { go, draw, order } });
  sync();
}
