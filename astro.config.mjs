import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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

const alternates = [
  ...Object.entries(SERVICES).map(([lang, path]) => ({
    lang: HREFLANG[lang],
    url: SITE + path,
  })),
  { lang: 'x-default', url: SITE + SERVICES[DEFAULT_LOCALE] },
];

export default defineConfig({
  site: SITE,
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
