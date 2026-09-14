/**
 * Portadas de artículo del blog (1200×630), usadas en el índice y como og:image.
 *
 * Satori dibuja el texto como trazados con las fuentes de marca (TTF en
 * src/assets/og-fonts, convertidas de los woff2 de public/fonts), así que la
 * imagen no depende de las fuentes instaladas en la máquina que compila, y
 * sharp pasa ese SVG a PNG. Se generan en el build desde
 * src/pages/og/blog/[lang]/[slug].png.ts: un artículo nuevo tiene portada sin
 * hacer nada.
 */
import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import path from 'node:path';

type Lang = 'es' | 'ru';

interface CoverInput {
  /** Ancho final en píxeles: 1200 para compartir (PNG), 600 para las tarjetas
      del índice (WebP, ~8 veces más ligero). El dibujo es el mismo. */
  width?: number;
  title: string;
  /** Código del pilar ("WEB", "MNT"…): va de marca de agua. */
  pillar: string;
  /** Nombre legible del pilar en el idioma del artículo. */
  pillarLabel: string;
  lang: Lang;
}

const FONT_DIR = path.join(process.cwd(), 'src/assets/og-fonts');
const font = (file: string) => readFileSync(path.join(FONT_DIR, file));

let fontsCache: Parameters<typeof satori>[1]['fonts'] | undefined;
function fonts() {
  // Un nombre por subconjunto: satori cae al siguiente de la lista de
  // fontFamily cuando a una fuente le falta un glifo (latín dentro de un
  // título ruso, cirílico en ninguno español).
  fontsCache ??= [
    { name: 'OutfitLatin', data: font('outfit-600-latin.ttf'), weight: 600, style: 'normal' },
    { name: 'OutfitLatinExt', data: font('outfit-600-latin-ext.ttf'), weight: 600, style: 'normal' },
    { name: 'GolosCyr', data: font('golos-text-600-cyrillic.ttf'), weight: 600, style: 'normal' },
    { name: 'GolosCyrExt', data: font('golos-text-600-cyrillic-ext.ttf'), weight: 600, style: 'normal' },
    { name: 'PlexLatin', data: font('ibm-plex-mono-500-latin.ttf'), weight: 500, style: 'normal' },
    { name: 'PlexCyr', data: font('ibm-plex-mono-500-cyrillic.ttf'), weight: 500, style: 'normal' },
  ];
  return fontsCache;
}

const INK = '#eee6d3';
const INK_SOFT = '#9c9a80';
const ACCENT = '#a97445';
const STAMP = '#6b1f1f';
const RULE = '#3a4030';
const MONO = 'PlexLatin, PlexCyr';

const LOGO = `data:image/svg+xml;base64,${Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">' +
    '<path d="M25 11 H15 V53 H25" fill="none" stroke="#eee6d3" stroke-width="6" stroke-linecap="square"/>' +
    '<path d="M39 11 H49 V53 H39" fill="none" stroke="#eee6d3" stroke-width="6" stroke-linecap="square"/>' +
    '<rect x="27" y="35" width="10" height="10" fill="#a97445"/></svg>'
).toString('base64')}`;

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

const corner = (pos: Record<string, number>, sides: string[]) =>
  h('div', {
    position: 'absolute', width: 34, height: 34, ...pos,
    ...Object.fromEntries(sides.map((side) => [`border${side}`, `1px solid ${ACCENT}`])),
  });

/** Tamaño del título según su longitud, para que quepa en tres líneas. */
function titleSize(title: string) {
  if (title.length <= 42) return 70;
  if (title.length <= 64) return 60;
  return 52;
}

export async function renderBlogCover({ title, pillar, pillarLabel, lang, width = 1200 }: CoverInput): Promise<Buffer> {
  const titleFont = lang === 'ru' ? 'GolosCyr, GolosCyrExt, OutfitLatin, OutfitLatinExt' : 'OutfitLatin, OutfitLatinExt, GolosCyr';

  const tree = h(
    'div',
    {
      position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      width: 1200, height: 630, padding: '58px 72px', color: INK,
      backgroundColor: '#10160f',
      backgroundImage: 'radial-gradient(circle at 80% 28%, rgba(169, 116, 69, 0.24), rgba(16, 22, 15, 0) 58%)',
    },
    [
      // Marca de agua: el código del pilar, enorme y casi transparente.
      h('div', {
        position: 'absolute', right: 40, bottom: 70, fontFamily: MONO, fontSize: 250,
        letterSpacing: -8, color: 'rgba(169, 116, 69, 0.08)',
      }, pillar),
      corner({ top: 24, left: 24 }, ['Top', 'Left']),
      corner({ top: 24, right: 24 }, ['Top', 'Right']),
      corner({ bottom: 24, left: 24 }, ['Bottom', 'Left']),
      corner({ bottom: 24, right: 24 }, ['Bottom', 'Right']),

      h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
        h('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
          h('img', { width: 40, height: 40 }, undefined, { src: LOGO, width: 40, height: 40 }),
          h('div', { display: 'flex', fontFamily: MONO, fontSize: 22, letterSpacing: 5, color: INK }, [
            h('span', {}, 'GEO'),
            h('span', { color: STAMP }, '·'),
            h('span', {}, 'MACHINE'),
          ]),
        ]),
        h('div', { display: 'flex', fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: INK_SOFT }, 'BLOG'),
      ]),

      h('div', { display: 'flex', flexDirection: 'column', gap: 22 }, [
        h('div', { display: 'flex', fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: ACCENT }, pillarLabel.toUpperCase()),
        h('div', {
          display: 'flex', fontFamily: titleFont, fontSize: titleSize(title), lineHeight: 1.08,
          letterSpacing: -1, color: INK, maxWidth: 1010,
        }, title),
      ]),

      h('div', {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 22, borderTop: `1px solid ${RULE}`, fontFamily: MONO, fontSize: 20, letterSpacing: 2,
      }, [
        h('span', { color: INK_SOFT }, 'GeoMachine Developer Group'),
        h('span', { color: ACCENT }, 'geomachine.es'),
      ]),
    ]
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: fonts() });
  const image = sharp(Buffer.from(svg));
  if (width !== 1200) {
    return image.resize(width, Math.round((width * 630) / 1200)).webp({ quality: 78 }).toBuffer();
  }
  return image.png({ compressionLevel: 9 }).toBuffer();
}
