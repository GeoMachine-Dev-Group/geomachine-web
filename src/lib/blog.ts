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

export function blogIndexHreflang(site: string): HreflangAlt[] {
  return [
    { hreflang: 'es', href: `${site}${blogPath.es}` },
    { hreflang: 'ru', href: `${site}${blogPath.ru}` },
    { hreflang: 'x-default', href: `${site}${blogPath.es}` },
  ];
}
