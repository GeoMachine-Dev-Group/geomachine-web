# geomachine.es — ficha del proyecto

## 1. Qué es

Sitio web + blog de GeoMachine Developer Group (desarrollo web, apps, IA,
mantenimiento y SEO), estático en Astro, 4 idiomas (es/ru/en/ka — en/ka
parciales, ver §8). Incluye una app de escritorio descargable
("GeoMachine Accounts") y un formulario de contacto.

## 2. Estado y copia canónica

**Esta carpeta (`~/Documentos/WorkSpace/geomachine-astro`) es la canónica.**
Movida aquí desde `~/Descargas/geomachine-astro` el 2026-08-29 (era la ruta
de trabajo original, ya resuelta y confirmada por hash de assets contra
producción).

Otras copias, todas resueltas — **no quedan divergentes**:
- `~/Documentos/Antugravity/geomachine-astro-antigravity` — archivada
  (`Antugravity/backups/archived/geomachine-astro-antigravity-2026-08-29`).
  Su único cambio de valor (`fix(contact)`) ya está en la canónica.
- `~/Documentos/Antugravity/geomachine-redesign` — **no es una copia**, es un
  experimento Next.js 16 aparte, sin relación con este proyecto.

## 3. Arrancar

```bash
npm install
npm run dev       # astro dev
npm run build      # astro build -> dist/ (~1,5 MB, estático)
npm run preview
```

## 4. Verificar

Sin suite de tests automatizada. Verificación real: `npm run build` sin
errores + repasar visualmente las rutas tocadas en `npm run preview`. Para
la ruta de API (`/api/contact`, ver §5), probar en dev que responde
`200`/`400`/`405` según el caso, no solo que compila.

## 5. Publicar

**`DEPLOY.md` está obsoleto — no seguirlo sin verificar primero.** Dice
"el flujo activo es Netlify" (nota fechada 2026-08-12); ya no es así.

Estado real a 2026-08-29:
- Producción actual (`geomachine.es`) sigue sirviendo un **deploy manual por
  ZIP** del 2026-08-19, en el proyecto Vercel `geomachine-web-lista`
  (team `geo-machine`).
- Repo conectado: **`GeoMachine-Dev-Group/geomachine-web`** (GitHub, privado).
  El pipeline Git→Vercel ya funciona y construye en verde (adaptador
  `@astrojs/vercel/serverless`, Node 20.x — la versión 18.x que usaba antes
  daba `ERROR` de runtime inválido, ya corregido).
- **Falta conectar el dominio `geomachine.es` a ese proyecto** (hoy el
  proyecto solo tiene subdominios `*.vercel.app`, `live: false`). Sin eso,
  ningún commit nuevo llega a producción real. Acción del usuario, panel de
  Vercel → Settings → Domains.
- El formulario de contacto usa una función serverless de Vercel
  (`src/pages/api/contact.ts`, `prerender: false`) — necesita
  `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` puestas en las env vars del
  proyecto Vercel; no están en ningún `.env` del repo.
- El `deploy.sh` + `deploy/nginx/` para VPS propio siguen ahí, sin usarse,
  a la espera de que se resuelva un ticket de OVH.

## 6. Convenciones

- Astro estático (`output: 'hybrid'`), solo `/api/contact` es on-demand.
- Rutas de servicios por idioma en `astro.config.mjs` (`SERVICES`) — deben
  mantenerse sincronizadas con `servicesPath` en `src/i18n/ui.ts`.
- Sitemap con hreflang inyectado a mano en `serialize()` porque los slugs de
  servicios difieren por idioma (el agrupado automático de
  `@astrojs/sitemap` no los empareja).

## 7. No tocar

- **`geomachine-web` no se toca desde la interfaz web de GitHub** — se
  transfirió a la org y se puso en privado por API el 2026-08-29
  precisamente porque tocarlo a mano en la web lo devolvió antes a la
  cuenta personal y público. Cualquier cambio de settings del repo, por
  API/CLI.
- No versionar binarios grandes en `public/downloads/` — ya pasó una vez
  (`GeoMachineAccounts.exe`/`.tar.gz`, 90 MB juntos) y se purgó del
  historial con `filter-branch`. Van como assets de GitHub Release
  (`accounts-app-v1`), enlazados desde el sitio, no commiteados.
- No leer ni imprimir contenido de ningún `.env*` real.
- El tag `pre-formulario-2026-08-12` es solo un marcador histórico
  (commit ya integrado en `main`) — no es una rama de trabajo.

## 8. Contexto vivo

- `sincro/REGISTRO.md` (fila `geomachine.es`) y `sincro/buzon/de-claude.md`
  — ahí está la crónica completa del 2026-08-29 (purga de binarios, reversión
  del pago, portado del formulario, transferencia del repo).
- **i18n pendiente (en/ka + lari) archivado, no descartado:**
  `sincro/pendientes/geomachine-i18n-en-ka-lari/` — `catalog-i18n.ts` y
  `ui-i18n.ts` sustituirían a `src/data/catalog.ts` y `src/i18n/ui.ts` con
  contenido más avanzado (4 idiomas, lari como tercera moneda, copy nuevo).
  Nunca se integró. `INSTRUCCIONES-i18n.md` ahí mismo lista los pasos que
  faltan (rutas `/en/`, `/ka/`, tocar `Catalog.astro`, revisión de georgiano
  nativo). Retomar solo si el usuario lo pide explícitamente — no es trabajo
  huérfano para completar por iniciativa propia.
- Bóveda Obsidian: `Proyectos/geomachine.es/`.
