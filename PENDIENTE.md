# Pendiente

## 1. Merge i18n (en / ka / GEL) — BLOQUEANTE para publicar en 4 idiomas

Ficheros entregados, sin aplicar todavía:
`~/Documentos/WorkSpace/geomachine-astro/files/{catalog-i18n.ts, ui-i18n.ts, INSTRUCCIONES-i18n.md}`

**No es un reemplazo de dos ficheros.** `catalog-i18n.ts` y `ui-i18n.ts` cambian
`Bilingual` → `Localized` (es/ru/en/ka) y `Currency` → `'eur'|'rub'|'gel'`, lo que
obliga a tocar además:

- `src/components/Catalog.astro`
  - `money()` y `priceData()` tienen las 2 monedas escritas a mano → añadir GEL (₾).
  - El conmutador de moneda tiene 2 botones → hace falta un tercero.
  - Campo `human` nuevo en cada `Item`/`Bundle`: hay que renderizarlo en hover/focus.
- `src/layouts/Base.astro`
  - `ogLocale` y `preloadFont` son `Record<Lang, string>`: al ampliar `Lang`,
    TypeScript obliga a añadir las entradas de `en` y `ka` (deseado).
  - `preloadFont.ka` NO debe apuntar a Unbounded: el georgiano va en
    `/fonts/noto-sans-georgian-700-georgian.woff2`.
  - El `hreflang` y el conmutador de idioma ya son data-driven: se amplían solos
    al añadir claves a `servicesPath`.
- `src/astro.config.mjs`
  - `i18n.locales` es `['es','ru']` → añadir `'en','ka'`.
  - `SERVICES` y `HREFLANG` (para el sitemap) deben ampliarse en paralelo a
    `servicesPath` de `src/i18n/ui.ts`. Hoy están duplicados: mantenerlos en sync.
- Páginas nuevas: `src/pages/en/services.astro` y `src/pages/ka/momsakhurebebi.astro`
  (copian la estructura de `es/servicios.astro`, 8 líneas cada una).
- `src/components/Schema.astro` no necesita cambios: ya recorre `languages`.

**Ojo:** `INSTRUCCIONES-i18n.md` pide "actualizar sitemap.xml". Ese fichero no
existía; ahora lo genera `@astrojs/sitemap` y se actualiza solo.

**Revisión humana del georgiano pendiente** — lo tradujo un modelo. Repasar sobre
todo precios y condiciones antes de publicar.

## 2. Tipografía georgiana — ya resuelta, comprobar al activar `ka`

`Noto Sans Georgian` (400/500/600/700) está autoalojada y añadida como fallback en
`--display`, `--body` y `--data`. Su `unicode-range` la limita a los bloques
georgianos, así que es/ru/en no la descargan. El texto latino de la página `ka`
(códigos `WEB-01`, monedas, logotipo) seguirá en Unbounded / IBM Plex Mono —
decisión deliberada; cambiar a override por idioma si se quiere lo contrario.

## 3. Antes de subir a VPS

Ver `DEPLOY.md`.
