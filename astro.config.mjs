import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { readdirSync, readFileSync } from 'node:fs';

const SITE = 'https://geomachine.es';

/**
 * Rutas de servicios por idioma. Los slugs son distintos en cada idioma, así
 * que el agrupado i18n automático de @astrojs/sitemap no los empareja: las
 * alternativas hreflang se inyectan a mano en serialize().
 * Debe mantenerse sincronizado con servicesPath en src/i18n/ui.ts.
 */
const SERVICES = {
  es: '/es/servicios/',
  ru: '/ru/uslugi/',
  en: '/en/services/',
  ka: '/ka/momsakhurebebi/',
};

const DEFAULT_LOCALE = 'es';
const HREFLANG = { es: 'es', ru: 'ru', en: 'en', ka: 'ka' };

const serviceUrls = Object.values(SERVICES).map((p) => SITE + p);

/**
 * Fecha de última modificación por URL del blog, leída del frontmatter de los
 * artículos. Sin lastmod, Google y Yandex no saben qué ha cambiado desde el
 * último rastreo y tratan todas las URLs por igual. Se lee del disco porque
 * astro.config no puede usar las colecciones de contenido.
 */
const BLOG_PATHS = { es: '/es/blog/', ru: '/ru/blog/', en: '/en/blog/' };

function blogLastmod() {
  const map = {};
  for (const [lang, base] of Object.entries(BLOG_PATHS)) {
    const dir = new URL(`./src/content/blog/${lang}/`, import.meta.url);
    let files = [];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    let newest = null;
    for (const file of files) {
      const raw = readFileSync(new URL(file, dir), 'utf8');
      if (/^draft:\s*true/m.test(raw)) continue;
      const date = (raw.match(/^updatedDate:\s*(\S+)/m) ?? raw.match(/^pubDate:\s*(\S+)/m))?.[1];
      if (!date) continue;
      const iso = new Date(date).toISOString();
      map[`${SITE}${base}${file.replace(/\.md$/, '')}/`] = iso;
      if (!newest || iso > newest) newest = iso;
    }
    if (newest) map[`${SITE}${base}`] = newest;
  }
  return map;
}

const lastmod = blogLastmod();

const alternates = [
  ...Object.entries(SERVICES).map(([lang, path]) => ({
    lang: HREFLANG[lang],
    url: SITE + path,
  })),
  { lang: 'x-default', url: SITE + SERVICES[DEFAULT_LOCALE] },
];

export default defineConfig({
  site: SITE,
  // El sitio se prerenderiza entero salvo la ruta on-demand /api/contact
  // (prerender = false en ese endpoint), que el adaptador de Vercel despliega
  // como función. En Astro 5 'static' + prerender=false por ruta sustituye al
  // antiguo 'hybrid'.
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'always',
  redirects: {
    '/': '/es/servicios/',
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'ru', 'en', 'ka'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    sitemap({
      // La raíz solo es un redirect a /es/servicios/: no debe indexarse.
      filter: (page) => page !== `${SITE}/`,
      serialize(item) {
        if (lastmod[item.url]) item.lastmod = lastmod[item.url];
        if (serviceUrls.includes(item.url)) {
          item.links = alternates;
          item.changefreq = 'monthly';
          item.priority = 1.0;
        }
        return item;
      },
    }),
  ],
});
