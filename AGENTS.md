# geomachine.es — ficha del proyecto

## 0. Estado actual (2026-09-10)

**Producción está en `dad1208`** (feat(hero): copy nuevo en 4 idiomas),
desplegado el 2026-09-10. `main` y producción coinciden; no hay ramas de
trabajo vivas.

Dos tandas llegaron a producción ese día, las dos por fast-forward y con la
rama borrada después en local y en los dos remotos:

1. **`0709338`** — rama `fix/limpieza-catalogo` (10 commits, lista abajo).
   Verificado en producción: `/es/servicios` sin barra responde 308, no queda
   botón de cambiar tema, hay un solo contador de plazas (variante terminal
   `sys.slots --status`) y el WhatsApp apunta a `wa.me/34620811739`.
2. **`dad1208`** — rama `feat/hero-copy`. El hero pasa de eyebrow + título +
   dos párrafos a título + un solo párrafo, con copy nuevo en es/ru/en/ka.
   Fuera las claves `heroPlain` (4 idiomas) y `heroEyebrow` (ru/en/ka; `es`
   nunca la tuvo y venía pintando un `<p>` vacío). La clase CSS
   `.hero__eyebrow` SÍ se conserva: la usa `AppAccountsPage.astro` para el
   tagline, y lleva un comentario que lo advierte. **El georgiano del hero
   está traducido por IA y pendiente de revisión nativa**, marcado en
   `ui.ts` igual que el aviso de `priceFrom`.

Los 10 commits de `fix/limpieza-catalogo`, en orden:
1. `6200988` fix(catalogo): deja una sola variante del contador de plazas.
2. `da27df8` fix(tema): elimina el selector de 5 paletas de color.
3. `766f00b` fix(contacto): número de WhatsApp real en vez del placeholder.
4. `7296410` fix(seo): 301/308 entre `/ruta` y `/ruta/` para evitar contenido duplicado.
5. `2d74aaf` chore(i18n): elimina `stampStyles` huérfano (deuda previa).
6. `35504ea` feat(catalogo): jerarquía de precios — "desde X" grande + rango pequeño.
7. `c35077d` style(catalogo): saca el showcase del hero a su propia sección.
8. `34fd571` style(catalogo): más peso visual real a la tarjeta destacada (PACK-02).
9. `e54da47` fix(tokens): define `--heading` y unifica la escala de h2.
10. `0709338` docs(agents): añade la sección Estado actual.

**Pendientes:**
- Revisión nativa del georgiano del hero (`heroTitle`/`heroBody` en
  `src/i18n/ui.ts`): están traducidos por IA y son el primer texto que ve
  quien entra en `/ka/momsakhurebebi/`.
- Decidir espejo `www`: el servidor manda a `www.geomachine.es` pero el
  canonical dice sin `www` — hay que unificar en un sentido u otro.
- Falta foto del fundador en la sección `.close`.
- `AppAccountsPage.astro` tiene estilos inline sin `clamp()` (deuda de
  responsive, no bloqueante).
- Plausible caduca pronto y falta instalar `@vercel/analytics`.

**Estado SEO:** Yandex verificado como `https://geomachine.es`, `sitemap-index`
y `sitemap-0` enviados, 15 URLs rusas en cola de rastreo. Google indexa bien.

**Deuda de diseño detectada** (no bloqueante, para una pasada futura): no hay
escala de espaciado ni de radios en variables CSS, 5 breakpoints literales
sin convención compartida, tipografía ajustada "a ojo" sin type scale formal.

**Hook `post-commit` en esta máquina:** cada `git commit` limpio dispara push
automático a todos los remotos del repo (ver `.git/hooks/post-commit`,
symlink compartido en `~/.local/share/git-hooks/`). Si detecta un posible
secreto en el diff del commit, aborta el push automático y avisa — no hace
push silencioso de un commit con secretos.

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

Estado real a 2026-08-29 23:40 (pipeline ya cerrado y funcionando):
- **`git push` a `main` → deploy automático a producción.** Verificado con
  varios commits (`72ee624`, `16c5614`). Proyecto Vercel `geomachine-web-lista`
  (team `geo-machine`, `prj_Zz8Tx7iJaW7F3K1ICnmFzpZFUedt`).
- Repo conectado: **`GeoMachine-Dev-Group/geomachine-web` (GitHub, PÚBLICO)**.
  Es público a propósito: Vercel Hobby no conecta repos privados de
  organización, sí públicos. Es un sitio de marketing sin secretos en el
  código (todo por env vars).
- Dominio: `geomachine.es` **y** `www.geomachine.es` ya conectados a este
  proyecto (redirige a `www`). Ya NO sirve el ZIP del 19-ago.
- Framework: **Astro 5**, adaptador **`@astrojs/vercel` v8** (import de
  `'@astrojs/vercel'`, no `/serverless`). Se subió desde Astro 4 + v7 porque
  Node 20.x deja de compilar en Vercel el 2026-10-01 y v7 no soportaba Node 22.
- Node: **fijado a 22.x** vía `engines.node` en `package.json` (Vercel lo
  respeta en el build; el desplegable del panel es irrelevante). Resuelto el
  problema del EOL de Node 20 del 2026-10-01.
- Formulario de contacto: función Vercel `src/pages/api/contact.ts`
  (`prerender: false`), envía a Telegram (bot `@GMDevPBot`, chat `6266899873`).
  `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` **ya puestas** en las env vars del
  proyecto Vercel (3 entornos). No están en ningún `.env` del repo.
- Si el auto-deploy dejara de disparar tras mover/transferir el repo: Vercel →
  Settings → Git → Disconnect + Connect re-arma el webhook (ya pasó una vez).
- El `deploy.sh` + `deploy/nginx/` para VPS propio siguen ahí, sin usarse,
  a la espera de que se resuelva un ticket de OVH.

## 6. Convenciones

- Astro estático (`output: 'static'` en Astro 5; equivale al antiguo
  `'hybrid'`), solo `/api/contact` es on-demand (`prerender = false` en esa
  ruta).
- Rutas de servicios por idioma en `astro.config.mjs` (`SERVICES`) — deben
  mantenerse sincronizadas con `servicesPath` en `src/i18n/ui.ts`.
- Sitemap con hreflang inyectado a mano en `serialize()` porque los slugs de
  servicios difieren por idioma (el agrupado automático de
  `@astrojs/sitemap` no los empareja).

## 7. No tocar

- **Cambios de settings de `geomachine-web` (visibilidad, dueño), por
  API/CLI, no desde la web de GitHub.** El 2026-08-29 el repo rebotó varias
  veces entre org/personal y privado/público por ediciones manuales cruzadas
  entre dos sesiones. Estado final correcto: **org `GeoMachine-Dev-Group`,
  público**. No cambiar sin motivo — Vercel Hobby depende de que sea público.
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
