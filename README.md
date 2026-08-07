# GeoMachine — sitio

Astro estático, bilingüe (ES / RU), sin dependencias de más.

## Arrancar

    npm install
    npm run dev      # http://localhost:4321/es/servicios/

## Publicar

    npm run build    # genera dist/

Sube `dist/` a Cloudflare Pages, Netlify o Vercel. En Cloudflare Pages:
build command `npm run build`, output directory `dist`.

## Dónde se tocan las cosas

| Quiero cambiar… | Archivo |
|---|---|
| Precios, servicios, textos de cada fila | `src/data/catalog.ts` |
| Pasar de tarifa de lanzamiento a estándar | `DEFAULT_TIER` en `src/data/catalog.ts` |
| Moneda que se ve al entrar | `DEFAULT_CURRENCY` en el mismo archivo |
| Títulos, meta, condiciones, botones | `src/i18n/ui.ts` |
| Colores y tipografía | `src/styles/global.css` (bloque `:root`) |
| Correo y Telegram de contacto | `src/components/Catalog.astro`, sección `.close` |
| Dominio para canonical y hreflang | `site` en `astro.config.mjs` |

## Añadir un tercer idioma (inglés)

1. Añade `en` a `locales` en `astro.config.mjs`.
2. Añade la clave `en` en `src/i18n/ui.ts` y en `servicesPath`.
3. Añade `en` a cada campo bilingüe de `src/data/catalog.ts`.
4. Crea `src/pages/en/services.astro` copiando la página española.

El `hreflang` del layout se genera solo a partir de `servicesPath`.

## Antes de publicar

- [ ] Cambiar `site` en `astro.config.mjs` al dominio real.
- [ ] Sustituir `hola@geomachine.dev` y `t.me/geomachine`.
- [ ] Dar de alta el sitio en Google Search Console y Yandex Webmaster.
