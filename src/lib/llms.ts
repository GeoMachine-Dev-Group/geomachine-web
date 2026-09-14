/**
 * Texto de llms.txt y llms-full.txt, generado desde el catálogo real.
 *
 * Antes eran dos archivos escritos a mano en public/ y se desviaron: anunciaban
 * tecnologías que no están en el catálogo, precios distintos a los de la web y
 * cuatro anclas inexistentes (#landings, #fullstack, #mobile, #ai). Eso es lo
 * que leen ChatGPT, Claude o Perplexity cuando alguien pregunta por ti, así que
 * ahora sale de src/data/catalog.ts y no puede volver a contradecir a la web.
 */
import type { CollectionEntry } from 'astro:content';
import { lines, bundles, type Currency, type Item, type Unit } from '../data/catalog';
import { servicesPath, blogPath } from '../i18n/ui';

const SITE = 'https://geomachine.es';
const CATALOG = `${SITE}${servicesPath.en}`;
const SYMBOL: Record<Currency, string> = { eur: '€', rub: '₽', gel: '₾' };

function money(range: readonly number[], c: Currency, unit: Unit) {
  const sep = c === 'eur' ? ',' : ' ';
  const nums = range.map((n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep)).join('–');
  const suffix = unit === 'month' ? '/month' : unit === 'hour' ? '/hour' : '';
  return `${nums} ${SYMBOL[c]}${suffix}`;
}

const anchor = (prefix: string) => `${CATALOG}#${prefix.toLowerCase()}`;

function itemLine(item: Item) {
  const parts = [
    `- ${item.code} · ${item.name.en} — ${item.spec.en}`,
    `  launch ${money(item.launch.eur, 'eur', item.unit)} · standard ${money(item.standard.eur, 'eur', item.unit)}`,
  ];
  if (item.time?.en) parts[1] += ` · delivery ${item.time.en}`;
  return parts.join('\n');
}

const HEAD = `# GeoMachine Developer Group
> Websites, applications and AI that runs on your own server, plus maintenance and SEO. Fixed price agreed from the first message, delivery in days.

This file is generated from the live service catalog, so prices, service codes and
links always match https://geomachine.es — nothing here is hand-written marketing.

## Business
- Website: ${SITE} — Spanish (${SITE}${servicesPath.es}), Russian (${SITE}${servicesPath.ru}), English (${CATALOG}), Georgian (${SITE}${servicesPath.ka})
- Email: hola@geomachine.es
- Telegram: https://t.me/geomachine
- WhatsApp: https://wa.me/34620811739
- Pricing: closed fixed price agreed before starting, in euros, Russian roubles or Georgian lari.
- Launch pricing: reduced rate for the first five clients, in exchange for publishing the result as a case study. After that, standard pricing.
- Typical response time: under 24 hours.
- You always talk to the engineer who writes the code; there are no sales intermediaries.
`;

function blogSection(posts: CollectionEntry<'blog'>[], full: boolean) {
  const byLang = (lang: 'es' | 'ru') =>
    posts
      .filter((p) => p.slug.startsWith(`${lang}/`))
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const list = (lang: 'es' | 'ru') =>
    byLang(lang)
      .map((p) => {
        const slug = p.slug.replace(`${lang}/`, '');
        const url = `${SITE}${blogPath[lang]}${slug}/`;
        const date = p.data.pubDate.toISOString().slice(0, 10);
        return full
          ? `- [${p.data.pillar}] ${p.data.title} (${date})\n  ${url}\n  ${p.data.description}`
          : `- ${p.data.title} — ${url}`;
      })
      .join('\n');
  return `## Blog
${posts.length} articles on web development, applied AI, SEO, systems and maintenance, written by the same engineer who builds the projects. Prices quoted in the articles are the catalog prices.

### Spanish — ${SITE}${blogPath.es}
${list('es')}

### Russian — ${SITE}${blogPath.ru}
${list('ru')}
`;
}

/** Índice corto: para que una IA sepa qué ofreces y dónde mirar. */
export function llmsTxt(posts: CollectionEntry<'blog'>[]): string {
  const services = lines
    .map((line) => {
      const from = Math.min(...line.items.map((i) => i.launch.eur[0]));
      const unit = line.items.every((i) => i.unit === 'month') ? '/month' : '';
      return `### ${line.title.en} — ${anchor(line.prefix)}
${line.note.en}
- ${line.items.length} services (${line.prefix}-01 … ${line.items[line.items.length - 1].code.split('-')[1]}), from ${from} €${unit} with launch pricing.
- ${line.items.map((i) => i.name.en).join(' · ')}`;
    })
    .join('\n\n');

  const packs = bundles
    .map((b) => `- ${b.code} · ${b.name.en} — ${money(b.launch.eur, 'eur', 'once')} (launch): ${b.includes.en.join(', ')}`)
    .join('\n');

  return `${HEAD}
## Services
${services}

## Packages — ${CATALOG}#paquetes
${packs}

${blogSection(posts, false)}
## Selected work
- abhazservis.com — https://abhazservis.com — business directory for Abkhazia (hotels, restaurants, pharmacies, markets and services), in Russian. Built and delivered by GeoMachine Developer Group.
- GeoMachine Accounts — free local inventory and net-profit desktop app: ${SITE}/en/services/app-accounts/

## Quotes
- Request a quote: ${CATALOG}#contacto
- Downloadable desktop app (free): ${SITE}/en/services/app-accounts/
`;
}

/** Versión detallada: cada servicio con su precio en las tres monedas. */
export function llmsFullTxt(posts: CollectionEntry<'blog'>[]): string {
  const services = lines
    .map((line) => {
      const items = line.items.map(itemLine).join('\n');
      const currencies = line.items
        .map((i) => `  ${i.code}: ${(['eur', 'rub', 'gel'] as Currency[]).map((c) => money(i.launch[c], c, i.unit)).join(' · ')} (launch)`)
        .join('\n');
      return `### ${line.title.en} — ${anchor(line.prefix)}
${line.note.en}
${items}

Launch pricing in all currencies:
${currencies}`;
    })
    .join('\n\n');

  const packs = bundles
    .map(
      (b) =>
        `- ${b.code} · ${b.name.en} — ${(['eur', 'rub', 'gel'] as Currency[]).map((c) => money(b.launch[c], c, 'once')).join(' · ')} (launch), standard ${money(b.standard.eur, 'eur', 'once')}
  Includes: ${b.includes.en.join(', ')}
  ${b.human.en}`
    )
    .join('\n\n');

  return `${HEAD}
## How the pricing works
Every service below has two prices. Launch pricing applies while there are free
slots among the first five clients, in exchange for publishing the result as a
case study; standard pricing applies afterwards. Maintenance clients keep the
price they signed up at. Ranges mean the final price depends on scope, agreed
before any work starts.

## Services in detail
${services}

## Packages — ${CATALOG}#paquetes
${packs}

${blogSection(posts, true)}
## Selected work
- abhazservis.com — https://abhazservis.com — business directory for Abkhazia (hotels, restaurants, pharmacies, markets and services, by city and category), in Russian. Built and delivered by GeoMachine Developer Group: Astro SSR front end, Express and PostgreSQL back end, business self-registration and per-business panel.
- Case study of an earlier delivered site: ${SITE}${blogPath.es}gagraservis-caso-real/ (Spanish) · ${SITE}${blogPath.ru}gagraservis-realnyy-keys/ (Russian)

## Desktop software
- GeoMachine Accounts — free local inventory and net-profit tracking app (Windows and Linux), SQLite database, no cloud and no subscription: ${SITE}/en/services/app-accounts/

## Contact
- Quote form: ${CATALOG}#contacto
- Telegram: https://t.me/geomachine · WhatsApp: https://wa.me/34620811739 · Email: hola@geomachine.es
`;
}
