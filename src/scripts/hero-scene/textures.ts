import { CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';
import { clamp, lerp, makeNoise, rng, smoothstep } from './noise';

/* Todas las texturas de la escena se pintan aquí, en canvas 2D, al arrancar.
   No se descarga ninguna imagen: madera, papel, metal cepillado y las escalas
   del pie de rey son procedurales y salen iguales en cada carga (semillas fijas). */

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function asTexture(c: HTMLCanvasElement, srgb: boolean, anisotropy: number): CanvasTexture {
  const t = new CanvasTexture(c);
  t.colorSpace = srgb ? SRGBColorSpace : NoColorSpace;
  t.anisotropy = anisotropy;
  return t;
}

/** Mapa de normales a partir de un campo de alturas (0..1), por diferencias centrales. */
function normalsFromHeight(height: Float32Array, w: number, h: number, strength: number, wrapX = true) {
  const c = canvas(w, h);
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - 1);
    const y1 = Math.min(h - 1, y + 1);
    for (let x = 0; x < w; x++) {
      const x0 = wrapX ? (x - 1 + w) % w : Math.max(0, x - 1);
      const x1 = wrapX ? (x + 1) % w : Math.min(w - 1, x + 1);
      const dx = (height[y * w + x1] - height[y * w + x0]) * strength;
      const dy = (height[y1 * w + x] - height[y0 * w + x]) * strength;
      const inv = 1 / Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      d[i] = (-dx * inv * 0.5 + 0.5) * 255;
      d[i + 1] = (dy * inv * 0.5 + 0.5) * 255;
      d[i + 2] = (inv * 0.5 + 0.5) * 255;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export interface SurfaceMaps {
  map: Texture;
  normalMap: Texture;
  roughnessMap: Texture;
}

/** Roble oscuro ahumado: una tabla larga (veta a lo largo de U). Cada tabla del
    tablero usa esta misma textura con otro desplazamiento, así que la resolución
    se gasta en detalle y no en superficie. */
export function oakMaps(w: number, h: number, anisotropy: number): SurfaceMaps {
  const { noise, fbm } = makeNoise(7);
  const r = rng(11);
  const albedo = canvas(w, h);
  const actx = albedo.getContext('2d')!;
  const img = actx.createImageData(w, h);
  const d = img.data;
  const height = new Float32Array(w * h);
  const k = w / 2048; // el dibujo se define a 2048 px y escala con la resolución

  // Los campos de ruido se evalúan en X y en X - periodo y se funden: así la
  // tabla enlaza consigo misma al repetirse y no se ve dónde acaba la textura.
  const PERIOD = 2048;
  const wearField = new Float32Array(w * h);
  const field = (X: number, Y: number) => ({
    // Fibra fina, muy estirada a lo largo de la tabla.
    fibre: 0.6 * fbm(X / 260, Y / 4.5, 4) + 0.4 * fbm(X / 700, Y / 16, 3),
    // Lo que serpentean los anillos de crecimiento, y lo desiguales que son de ancho.
    warp: fbm(X / 1400, Y / 60, 3),
    // Desgaste de la cera, para el mapa de rugosidad.
    wear: fbm(X / 330 + 8, Y / 150 + 2, 3),
    // Manchas grandes de tono: ninguna tabla es uniforme.
    blotch: fbm(X / 900 + 3.1, Y / 240 + 1.7, 2),
    // Rayos medulares del roble: destellos cortos y claros, cruzados a la veta.
    ray: smoothstep(0.74, 0.9, noise(X / 22, Y / 9 + 40)) * smoothstep(0.5, 0.8, fbm(X / 400, Y / 120 + 9, 2)),
  });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const X = x / k;
      const Y = y / k;
      const m = X / PERIOD;
      const a = field(X, Y);
      const b = field(X - PERIOD, Y);
      const fibre = lerp(a.fibre, b.fibre, m);
      // Anillo de crecimiento: sube despacio (madera de primavera) y cae de golpe
      // en una línea oscura y fina (madera de verano). Nunca dos del mismo ancho.
      const phase = Y / 10 + lerp(a.warp, b.warp, m) * 9;
      const r01 = phase - Math.floor(phase);
      const ringSharp = smoothstep(0, 0.7, r01) * (1 - smoothstep(0.88, 1, r01));
      const blotch = lerp(a.blotch, b.blotch, m);
      const ray = lerp(a.ray, b.ray, m);

      let tone = 0.48 * fibre + 0.15 * ringSharp + 0.37 * blotch;
      tone = clamp(tone + ray * 0.2, 0, 1);

      // Rampa de color: de casi negro tostado a miel oscura.
      const t = smoothstep(0.24, 0.82, tone);
      const i = (y * w + x) * 4;
      d[i] = lerp(24, 80, t) + ray * 14;
      d[i + 1] = lerp(15, 50, t) + ray * 9;
      d[i + 2] = lerp(9, 27, t) + ray * 4;
      d[i + 3] = 255;
      height[y * w + x] = 0.55 + 0.14 * fibre + 0.04 * ringSharp;
      wearField[y * w + x] = lerp(a.wear, b.wear, m);
    }
  }
  actx.putImageData(img, 0, 0);

  // Poros abiertos (el roble es de poro grueso): trazos cortos, oscuros, a favor de veta.
  const pores = canvas(w, h);
  const pctx = pores.getContext('2d')!;
  pctx.fillStyle = '#000';
  pctx.fillRect(0, 0, w, h);
  pctx.strokeStyle = '#fff';
  pctx.lineCap = 'round';
  const poreCount = Math.round(7000 * k * k * (h / (256 * k)));
  for (let i = 0; i < poreCount; i++) {
    const x = r() * w;
    const y = r() * h;
    const len = (3 + r() * r() * 22) * k;
    pctx.globalAlpha = 0.2 + r() * 0.5;
    pctx.lineWidth = (0.5 + r() * 0.5) * k;
    pctx.beginPath();
    pctx.moveTo(x, y);
    pctx.lineTo(x + len, y + (r() - 0.5) * 1.6 * k);
    pctx.stroke();
  }
  const poreData = pctx.getImageData(0, 0, w, h).data;
  actx.globalCompositeOperation = 'multiply';
  actx.globalAlpha = 0.38;
  // Los poros oscurecen la madera: se multiplica el negativo.
  const neg = canvas(w, h);
  const nctx = neg.getContext('2d')!;
  nctx.fillStyle = '#fff';
  nctx.fillRect(0, 0, w, h);
  nctx.globalCompositeOperation = 'difference';
  nctx.drawImage(pores, 0, 0);
  actx.drawImage(neg, 0, 0);
  actx.globalCompositeOperation = 'source-over';
  actx.globalAlpha = 1;

  const rough = canvas(w, h);
  const rctx = rough.getContext('2d')!;
  const rimg = rctx.createImageData(w, h);
  const rd = rimg.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pore = poreData[idx * 4] / 255;
      height[idx] -= pore * 0.22;
      // Madera encerada, no barnizada: brillo apagado y desigual; el poro no brilla.
      const wear = wearField[idx];
      const v = clamp(0.56 + wear * 0.26 + pore * 0.18, 0, 1) * 255;
      const i = idx * 4;
      rd[i] = rd[i + 1] = rd[i + 2] = v;
      rd[i + 3] = 255;
    }
  }
  rctx.putImageData(rimg, 0, 0);

  const maps: SurfaceMaps = {
    map: asTexture(albedo, true, anisotropy),
    normalMap: asTexture(normalsFromHeight(height, w, h, 2.4), false, anisotropy),
    roughnessMap: asTexture(rough, false, anisotropy),
  };
  for (const t of Object.values(maps)) {
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
  }
  return maps;
}

/** Metal cepillado: rugosidad a rayas finas en una dirección. Sirve para cobre,
    latón y el aluminio del teclado cambiando solo el color del material. */
export function brushedMaps(size: number, anisotropy: number): { roughnessMap: Texture; normalMap: Texture } {
  const { noise, fbm } = makeNoise(23);
  const rough = canvas(size, size);
  const ctx = rough.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const d = img.data;
  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const streak = noise(x / 90, y / 1.1) * 0.6 + noise(x / 30, y / 0.7 + 50) * 0.4;
      const cloud = fbm(x / 70, y / 70, 3);
      const v = clamp(0.38 + streak * 0.34 + cloud * 0.22, 0, 1);
      const i = (y * size + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = v * 255;
      d[i + 3] = 255;
      height[y * size + x] = streak;
    }
  }
  ctx.putImageData(img, 0, 0);
  const roughnessMap = asTexture(rough, false, anisotropy);
  const normalMap = asTexture(normalsFromHeight(height, size, size, 0.9), false, anisotropy);
  for (const t of [roughnessMap, normalMap]) {
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
  }
  return { roughnessMap, normalMap };
}

const INK = 'rgba(58, 36, 22, 0.92)';
const INK_SOFT = 'rgba(58, 36, 22, 0.5)';
const INK_RED = 'rgba(107, 31, 31, 0.85)';

function paperGround(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, base: string) {
  const r = rng(seed);
  const { fbm } = makeNoise(seed + 1);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  // Nubes de tono: el papel viejo amarillea de forma desigual.
  const cloud = canvas(w / 8, h / 8);
  const cctx = cloud.getContext('2d')!;
  const img = cctx.createImageData(cloud.width, cloud.height);
  for (let y = 0; y < cloud.height; y++) {
    for (let x = 0; x < cloud.width; x++) {
      const v = fbm(x / 18, y / 18, 4);
      const i = (y * cloud.width + x) * 4;
      img.data[i] = 120;
      img.data[i + 1] = 84;
      img.data[i + 2] = 40;
      img.data[i + 3] = smoothstep(0.45, 0.9, v) * 34;
    }
  }
  cctx.putImageData(img, 0, 0);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cloud, 0, 0, w, h);
  // Fibras del papel.
  for (let i = 0; i < 2600; i++) {
    const x = r() * w;
    const y = r() * h;
    const a = r() * Math.PI;
    const len = 2 + r() * 7;
    ctx.strokeStyle = r() > 0.5 ? 'rgba(255,250,235,0.16)' : 'rgba(96,70,40,0.1)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
}

/** Sombra suave a lo largo de los pliegues: el papel se gasta y se ensucia ahí. */
function creaseWear(ctx: CanvasRenderingContext2D, w: number, h: number, cols: number, rows: number) {
  const band = (x0: number, y0: number, x1: number, y1: number, vertical: boolean) => {
    const g = vertical ? ctx.createLinearGradient(x0 - 9, 0, x0 + 9, 0) : ctx.createLinearGradient(0, y0 - 9, 0, y0 + 9);
    g.addColorStop(0, 'rgba(90,64,36,0)');
    g.addColorStop(0.5, 'rgba(90,64,36,0.2)');
    g.addColorStop(1, 'rgba(90,64,36,0)');
    ctx.fillStyle = g;
    ctx.fillRect(vertical ? x0 - 9 : x0, vertical ? y0 : y0 - 9, vertical ? 18 : x1 - x0, vertical ? y1 - y0 : 18);
  };
  for (let c = 1; c < cols; c++) band((w * c) / cols, 0, 0, h, true);
  for (let q = 1; q < rows; q++) band(0, (h * q) / rows, w, 0, false);
}

function dashed(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, pattern: number[]) {
  ctx.save();
  ctx.setLineDash(pattern);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

/** Cota: línea con flechas y líneas de referencia. Sin cifra (la escena no lleva texto). */
function dimension(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  for (const [x, y, dir] of [[x0, y0, 1], [x1, y1, -1]] as const) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a + 0.32) * 11 * dir, y + Math.sin(a + 0.32) * 11 * dir);
    ctx.lineTo(x + Math.cos(a - 0.32) * 11 * dir, y + Math.sin(a - 0.32) * 11 * dir);
    ctx.closePath();
    ctx.fill();
  }
}

/** Plano técnico: alzado de una pieza torneada con su corte, cotas y cajetín vacío. */
export function blueprintTexture(anisotropy: number, cols: number, rows: number): Texture {
  const w = 1536;
  const h = 1024;
  const c = canvas(w, h);
  const ctx = c.getContext('2d')!;
  paperGround(ctx, w, h, 31, '#e6dcc4');
  creaseWear(ctx, w, h, cols, rows);

  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.strokeRect(46, 46, w - 92, h - 92);
  ctx.lineWidth = 1;
  ctx.strokeRect(56, 56, w - 112, h - 112);

  // Vista frontal: brida circular con su círculo de taladros.
  const cx = 470;
  const cy = 470;
  ctx.lineWidth = 2.4;
  for (const rad of [250, 96]) {
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(cx, cy, 128, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.setLineDash([22, 7, 4, 7]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 190, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = cx + Math.cos(a) * 190;
    const y = cy + Math.sin(a) * 190;
    ctx.beginPath();
    ctx.arc(x, y, 21, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 0.9;
    dashed(ctx, x - 32, y, x + 32, y, [10, 4, 2, 4]);
    dashed(ctx, x, y - 32, x, y + 32, [10, 4, 2, 4]);
    ctx.lineWidth = 2;
  }
  // Chavetero y ejes.
  ctx.strokeRect(cx - 20, cy - 112, 40, 30);
  ctx.lineWidth = 1;
  dashed(ctx, cx - 300, cy, cx + 300, cy, [26, 7, 4, 7]);
  dashed(ctx, cx, cy - 300, cx, cy + 300, [26, 7, 4, 7]);

  // Corte lateral, proyectado desde la vista frontal.
  const sx = 930;
  ctx.lineWidth = 2.4;
  const profile: Array<[number, number]> = [
    [0, -250], [70, -250], [70, -128], [210, -128], [210, -96], [300, -96],
    [300, 96], [210, 96], [210, 128], [70, 128], [70, 250], [0, 250],
  ];
  ctx.beginPath();
  profile.forEach(([px, py], i) => (i ? ctx.lineTo(sx + px, cy + py) : ctx.moveTo(sx + px, cy + py)));
  ctx.closePath();
  ctx.stroke();
  // Rayado del corte, recortado a la silueta.
  ctx.save();
  ctx.clip();
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = INK_SOFT;
  for (let i = -700; i < 700; i += 13) {
    ctx.beginPath();
    ctx.moveTo(sx + i, cy - 300);
    ctx.lineTo(sx + i + 600, cy + 300);
    ctx.stroke();
  }
  ctx.restore();
  // Taladro central, visto en el corte.
  ctx.fillStyle = '#e6dcc4';
  ctx.fillRect(sx - 2, cy - 62, 304, 124);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 2;
  ctx.strokeRect(sx, cy - 62, 300, 124);
  ctx.lineWidth = 1;
  dashed(ctx, sx - 40, cy, sx + 350, cy, [26, 7, 4, 7]);
  ctx.strokeStyle = INK_SOFT;
  for (const py of [-250, -96, 96, 250]) dashed(ctx, cx + 40, cy + py, sx - 12, cy + py, [5, 6]);

  // Cotas.
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  for (const [x0, y0, x1, y1] of [
    [sx, cy + 300, sx + 300, cy + 300], [sx, cy - 296, sx + 70, cy - 296], [sx + 360, cy - 96, sx + 360, cy + 96],
    [cx - 250, cy + 316, cx + 250, cy + 316], [sx + 410, cy - 250, sx + 410, cy + 250],
  ]) {
    dimension(ctx, x0, y0, x1, y1);
  }
  ctx.strokeStyle = INK_SOFT;
  for (const [x0, y0, x1, y1] of [
    [sx, cy + 256, sx, cy + 312], [sx + 300, cy + 102, sx + 300, cy + 312], [sx + 306, cy - 96, sx + 372, cy - 96],
    [sx + 306, cy + 96, sx + 372, cy + 96], [cx - 250, cy + 40, cx - 250, cy + 328], [cx + 250, cy + 40, cx + 250, cy + 328],
    [sx + 76, cy - 250, sx + 422, cy - 250], [sx + 76, cy + 250, sx + 422, cy + 250],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  // Correcciones a tinta granate: un círculo de revisión y una flecha.
  ctx.strokeStyle = INK_RED;
  ctx.fillStyle = INK_RED;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(sx + 255, cy - 112, 62, 40, -0.2, 0.2, Math.PI * 2 + 0.5);
  ctx.stroke();
  ctx.lineWidth = 2;
  dimension(ctx, sx + 320, cy - 190, sx + 296, cy - 148);

  // Cajetín: celdas vacías, sin rótulos.
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  const bx = w - 56 - 400;
  const by = h - 56 - 150;
  ctx.strokeRect(bx, by, 400, 150);
  ctx.lineWidth = 1;
  for (const yy of [50, 100]) {
    ctx.beginPath();
    ctx.moveTo(bx, by + yy);
    ctx.lineTo(bx + 400, by + yy);
    ctx.stroke();
  }
  for (const [xx, y0, y1] of [[150, 0, 150], [280, 50, 150]]) {
    ctx.beginPath();
    ctx.moveTo(bx + xx, by + y0);
    ctx.lineTo(bx + xx, by + y1);
    ctx.stroke();
  }
  // Renglones de caligrafía simulada: rayas, no letras.
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 3;
  for (const [x0, y0, len] of [[14, 26, 96], [166, 26, 180], [14, 76, 70], [166, 76, 84], [296, 76, 76], [14, 126, 110], [296, 126, 58]]) {
    dashed(ctx, bx + x0, by + y0, bx + x0 + len, by + y0, [9, 4, 15, 5, 5, 4]);
  }

  return asTexture(c, true, anisotropy);
}

/** Papel liso (carta, plano doblado visto por el dorso). */
export function plainPaperTexture(anisotropy: number, seed: number, base: string, ruled = false): Texture {
  const w = 512;
  const h = 512;
  const c = canvas(w, h);
  const ctx = c.getContext('2d')!;
  paperGround(ctx, w, h, seed, base);
  if (ruled) {
    // Trasluce el dibujo del otro lado: unas líneas muy tenues.
    ctx.strokeStyle = 'rgba(74,50,32,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(180, 300, 150, 0, Math.PI * 2);
    ctx.moveTo(300, 60);
    ctx.lineTo(300, 480);
    ctx.moveTo(40, 300);
    ctx.lineTo(480, 300);
    ctx.stroke();
  }
  return asTexture(c, true, anisotropy);
}

/** Escala grabada del pie de rey: milímetros, medios centímetros y centímetros.
    Solo trazos; las cifras se omiten a propósito. */
export function scaleTexture(anisotropy: number, mm: number, vernier = false): Texture {
  const pxPerMm = 8;
  const w = Math.round(mm * pxPerMm);
  const h = 64;
  const c = canvas(w, h);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(38,24,8,0.92)';
  const step = vernier ? 0.9 : 1; // el nonio va a 9/10: por eso mide décimas
  const count = Math.floor(mm / step);
  for (let i = 0; i <= count; i++) {
    const x = Math.round(i * step * pxPerMm);
    const len = i % 10 === 0 ? 44 : i % 5 === 0 ? 33 : 22;
    ctx.fillRect(x, vernier ? 0 : h - len, 1.6, len);
  }
  return asTexture(c, true, anisotropy);
}

/** Sombra de contacto: una mancha suave (disco o rectángulo redondeado) que se
    pone bajo cada objeto. La lámpara alumbra desde arriba y casi no proyecta
    sombra bajo las piezas; sin esto parecen flotar sobre la mesa. */
export function contactTexture(shape: 'disc' | 'box'): Texture {
  const n = 96;
  const c = canvas(n, n);
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const px = Math.abs((x + 0.5) / n - 0.5) * 2;
      const py = Math.abs((y + 0.5) / n - 0.5) * 2;
      // Distancia al borde de la forma, que ocupa el 62 % central del cuadro.
      const dist = shape === 'disc' ? Math.hypot(px, py) - 0.62 : Math.hypot(Math.max(px - 0.56, 0), Math.max(py - 0.56, 0)) + Math.min(Math.max(px, py) - 0.56, 0) - 0.06;
      const a = 1 - smoothstep(-0.12, 0.36, dist);
      const i = (y * n + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 0;
      img.data[i + 3] = a * a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return asTexture(c, true, 1);
}
