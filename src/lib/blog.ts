import type { CollectionEntry } from 'astro:content';
import { blogPath, type BlogLang } from '../i18n/ui';

/** Un draft es visible en `astro dev` (para revisarlo) pero nunca en build de
    producción — así nunca genera ruta ni aparece en el sitemap. */
export function isPublished(entry: Pick<CollectionEntry<'blog'>, 'data'>) {
  return import.meta.env.DEV || !entry.data.draft;
}

interface HreflangAlt {
  hreflang: string;
  href: string;
}

interface HreflangArgs {
  site: string;
  lang: BlogLang;
  slug: string; // sin prefijo de idioma
  counterpart?: CollectionEntry<'blog'>;
}

/**
 * hreflang de un artículo: siempre se referencia a sí mismo (obligatorio),
 * añade la pareja del otro idioma solo si se resolvió a un artículo
 * publicado, y x-default solo si hay versión en "es" (idioma por defecto
 * del sitio) — si un post en ru no tiene pareja en es, se omite x-default
 * en vez de apuntar a algo que no representa al artículo.
 */
export function buildHreflang({ site, lang, slug, counterpart }: HreflangArgs): HreflangAlt[] {
  const self: HreflangAlt = { hreflang: lang, href: `${site}${blogPath[lang]}${slug}/` };
  const alternates: HreflangAlt[] = [self];
  let esHref = lang === 'es' ? self.href : undefined;

  if (counterpart) {
    const counterpartLang: BlogLang = lang === 'es' ? 'ru' : 'es';
    const counterpartSlug = counterpart.slug.replace(new RegExp(`^${counterpartLang}/`), '');
    const href = `${site}${blogPath[counterpartLang]}${counterpartSlug}/`;
    alternates.push({ hreflang: counterpartLang, href });
    if (counterpartLang === 'es') esHref = href;
  }
  if (esHref) alternates.push({ hreflang: 'x-default', href: esHref });
  return alternates;
}

/**
 * Ancla de la sección del catálogo para un `relatedService` (p.ej. "WEB-01"
 * -> "web"). No se puede derivar del `pillar` del artículo: los paquetes
 * (`PACK-0N`) pertenecen al pilar APP/IA/etc. según el caso, pero viven en
 * su propia sección del catálogo (`id="paquetes"`), no en la del pilar.
 */
export function catalogAnchor(relatedService: string): string {
  const prefix = relatedService.split('-')[0];
  return prefix === 'PACK' ? 'paquetes' : prefix.toLowerCase();
}

export function blogIndexHreflang(site: string): HreflangAlt[] {
  return [
    { hreflang: 'es', href: `${site}${blogPath.es}` },
    { hreflang: 'ru', href: `${site}${blogPath.ru}` },
    { hreflang: 'x-default', href: `${site}${blogPath.es}` },
  ];
}

/**
 * Extracto de ~N palabras a partir del markdown crudo del artículo (sin
 * renderizar), para la tarjeta del índice del blog. Quita la sintaxis más
 * común (código, imágenes, enlaces, encabezados) en vez de cortar el
 * markdown a lo bruto, que dejaría "#" o "[" sueltos en medio del texto.
 */
export function excerpt(body: string, wordCount = 18): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = plain.split(' ');
  if (words.length <= wordCount) return plain;
  return `${words.slice(0, wordCount).join(' ')}…`;
}

/** Minutos de lectura estimados a 200 palabras/min, mínimo 1. */
export function readingTime(body: string, wordsPerMinute = 200): number {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Pilares afines por cercanía temática real (no alfabética), para
 * completar `relatedArticles` cuando el pilar del artículo no tiene
 * suficientes hermanos propios — nunca se mete un artículo de un pilar
 * sin relación solo por rellenar el mínimo.
 */
const PILLAR_FALLBACK: Record<string, string[]> = {
  WEB: ['SEO', 'SYS'],
  APP: ['WEB', 'IA'],
  IA: ['SYS', 'WEB'],
  SEO: ['WEB', 'MNT'],
  MNT: ['SYS', 'WEB'],
  SYS: ['IA', 'MNT'],
};

/**
 * Hasta `max` artículos para el cross-linking interno del blog: primero
 * los del mismo pilar (más relevantes), y si no hay suficientes, completa
 * con los pilares afines de PILLAR_FALLBACK, en orden. `entries` debe venir
 * ya filtrado al idioma del artículo actual — el cross-linking no cruza
 * idiomas, cruza pilares.
 */
export function relatedArticles<T extends CollectionEntry<'blog'>>(
  entries: T[],
  current: T,
  max = 3,
): T[] {
  const pool = entries.filter((e) => e.id !== current.id);
  const result = pool.filter((e) => e.data.pillar === current.data.pillar);
  for (const pillar of PILLAR_FALLBACK[current.data.pillar] ?? []) {
    if (result.length >= max) break;
    result.push(...pool.filter((e) => e.data.pillar === pillar && !result.includes(e)));
  }
  return result.slice(0, max);
}
