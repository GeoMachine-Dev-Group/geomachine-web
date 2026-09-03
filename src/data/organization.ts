/**
 * Nodo JSON-LD de la organización — fuente única. Antes existían tres
 * versiones distintas del mismo @id ("https://geomachine.es/#organization"):
 * un bloque estático sin @id repetido en cada página (Base.astro), un
 * ProfessionalService rico solo en las páginas de servicio (Schema.astro),
 * y un Organization mínimo de 4 propiedades solo en el blog
 * (ArticleSchema.astro). Para Google eran tres descripciones distintas de
 * la misma entidad real. Este módulo es el único sitio donde se construye,
 * y Base.astro lo emite una vez por página; el resto de plantillas solo
 * referencian `{ '@id': orgId(site) }`.
 */
import { lines, bundles, DEFAULT_TIER, DEFAULT_CURRENCY } from './catalog';
import { ui, servicesPath, languages, type Lang } from '../i18n/ui';

export function orgId(site: string): string {
  return `${site}/#organization`;
}

const KNOWS_ABOUT = [
  'Web Development',
  'Mobile App Development',
  'Local Private AI',
  'Search Engine Optimization',
  'Cloud Infrastructure',
  'Astro',
  'React',
  'Flutter',
];

/**
 * Referencias (@id) a las Offer/AggregateOffer que ya define Schema.astro
 * en la página de servicios de cada idioma — no reconstruye precios aquí,
 * solo enlaza por @id para que `makesOffer` no quede vacío fuera de esa
 * página. Debe coincidir con el `@id` que genera `offerForItem`/
 * `offerForBundle` en Schema.astro (`${pageUrl}#${code.toLowerCase()}`).
 */
function makesOfferRefs(site: string, lang: Lang) {
  const base = `${site}${servicesPath[lang]}`;
  const codes = [...lines.flatMap((l) => l.items.map((i) => i.code)), ...bundles.map((b) => b.code)];
  return codes.map((code) => ({ '@id': `${base}#${code.toLowerCase()}` }));
}

export function buildOrganization(site: string, lang: Lang) {
  const t = ui[lang];
  const allEur = lines.flatMap((l) => l.items.flatMap((i) => i[DEFAULT_TIER][DEFAULT_CURRENCY]));
  const priceRange = `${Math.min(...allEur)}–${Math.max(...allEur)} €`;

  return {
    '@type': 'ProfessionalService',
    '@id': orgId(site),
    name: t.company,
    url: site,
    logo: `${site}/favicon.png`,
    description: t.metaDescription,
    priceRange,
    areaServed: [
      { '@type': 'Country', name: 'Georgia' },
      { '@type': 'Country', name: 'Spain' },
      { '@type': 'Country', name: 'Russia' },
    ],
    availableLanguage: Object.entries(languages).map(([code, name]) => ({
      '@type': 'Language',
      alternateName: code,
      name,
    })),
    email: 'hola@geomachine.es',
    sameAs: ['https://t.me/geomachine'],
    knowsAbout: KNOWS_ABOUT,
    makesOffer: makesOfferRefs(site, lang),
  };
}
