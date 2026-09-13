# geomachine.es — ficha del proyecto

## 0. Estado actual (2026-09-13)

**Producción está en `92f2dd5`** (feat(catalogo): hero "atelier privado"),
desplegado el 2026-09-13 y verificado en vivo en los 4 idiomas. `main` y
producción coinciden en el código del sitio; no hay ramas de trabajo vivas (en
`backup` quedan `master` y `restaura-controles-interactivos`, antiguas, sin
tocar).

**Cómo se despliega ahora.** El modo automático de Claude Code bloquea el push
a `main`, porque es un despliegue a producción. Flujo que funciona: rama →
`npm run build` → commit → push de la rama (vista previa en Vercel) → el
usuario la revisa → el usuario ejecuta él mismo el merge `--ff-only` y el push
de `main` a `github` y `backup` → verificar producción con `curl`. Las vistas
previas piden SSO de Vercel (`curl` recibe un 302 al login): verificar sobre
`dist/` local y decirlo.

Historial reciente, todo por fast-forward y con la rama borrada después:
1. `0709338` (2026-09-10) — `fix/limpieza-catalogo`: un solo contador de
   plazas, fuera el selector de 5 paletas, WhatsApp real
   (`wa.me/34620811739`), 308 entre `/ruta` y `/ruta/`.
2. `dad1208` (2026-09-10) — `feat/hero-copy`: copy del hero en 4 idiomas.
3. `276d540` (2026-09-11) — Vercel Web Analytics en lugar de Plausible
   (activado en el panel y confirmado recogiendo datos) y placeholders del
   formulario traducidos (salían en español en los 4 idiomas).
4. `92f2dd5` (2026-09-13) — rama `feat/hero-precios`, varias tandas:
   - **Logo "Corchetes"**: `[▪]` en crema con bloque cobre, en cabecera,
     favicon e iconos PNG; colores del manifest a `#10160f`.
   - **Tarifa**: fuera el selector Lanzamiento/Estándar. `LAUNCH_OPEN`
     (`src/data/catalog.ts`) sale de `LAUNCH_SLOTS`: con plazas libres, cada
     tarjeta muestra el estándar tachado; al llenarse, la web pasa sola a
     precio estándar. Para actualizar las plazas, editar `LAUNCH_SLOTS`.
   - **Moneda** inicial por idioma (`LANG_CURRENCY`: ru → rublos, ka → lari,
     es/en → euros). El selector ya no es fijo al hacer scroll: va en
     `.catalog-bar`, encima del catálogo.
   - **Hero "atelier privado"** (`.hero--atelier`): marca animada
     `[GeoMachine▪]` con "Developer Group" debajo a la derecha, línea de
     plazas, botón "Solicitar plaza", tres precios de entrada y una franja
     fina de trabajos en lugar de las cuatro tarjetas grandes. Los precios de
     entrada son el PRIMER servicio de WEB, APP e IA, no el más barato: el
     mínimo sería un añadido ("Segundo idioma") y un "desde" con él
     engañaría. El diseño salió de un lienzo de Claude Design (artifact
     `befd8bb8-3ce1-4d70-98b2-011e57ef63a7`).
   - **Blog con diseño propio**: `BlogIndexView.astro` y `BlogPostView.astro`,
     compartidos por es y ru. Filtros por tema que responden al hash (`#web`,
     `#ia`…), artículo destacado con `featured: true` en el frontmatter, firma
     "GeoMachine Developer Group" y tarjeta del servicio relacionado.

**Trampas conocidas:**
- Las clases base `.hero`, `.hero__title`, `.hero__body` y `.hero__eyebrow`
  las comparte `AppAccountsPage.astro`. El estilo del catálogo va solo bajo
  `.hero--atelier`; no tocar las base sin revisar esa página.
- `Calculator.astro` no se renderiza en ninguna página: es código muerto, y su
  badge dice "-25%", que no es real.
- La página de GeoMachine Accounts en español es `/es/servicios/app-cuentas/`
  (slug traducido), no `app-accounts`.

**Pendientes:**
- Revisión nativa del georgiano: hero, placeholders del formulario, plazas,
  "Solicitar plaza" y franja de trabajos. Todo va traducido por IA y marcado
  en `src/i18n/ui.ts`.
- Decidir si se reinstala el hook `post-commit` de auto-push (ver más abajo).
- Exportar el histórico de Plausible antes de que caduque la cuenta: la serie
  se corta en `f39aabd`.
- Decidir espejo `www`: el servidor manda a `www.geomachine.es` pero el
  canonical dice sin `www` — hay que unificar en un sentido u otro.
- Falta foto del fundador en la sección `.close`.
- `AppAccountsPage.astro` tiene estilos inline sin `clamp()` (deuda de
  responsive, no bloqueante).
- En inglés los miles salen con punto ("from 1.800 €") en vez de coma. Ya
  estaba así antes de estas tandas.
- Blog: el artículo destacado (caso gagraservis) solo tiene 194 palabras, y en
  español no hay artículos de Mantenimiento. Las portadas por artículo se
  propusieron y no se hicieron.

**Estado SEO:** Yandex verificado como `https://geomachine.es`, `sitemap-index`
y `sitemap-0` enviados, 15 URLs rusas en cola de rastreo. Google indexa bien.

**Deuda de diseño detectada** (no bloqueante, para una pasada futura): no hay
escala de espaciado ni de radios en variables CSS, 5 breakpoints literales
sin convención compartida, tipografía ajustada "a ojo" sin type scale formal.

**El auto-push ya NO está activo (comprobado el 2026-09-11).** `git commit`
deja el commit solo en local: hay que hacer `git push` a mano, a `github` y a
`backup`. `.git/hooks/` está vacío —ni siquiera quedan los `.sample`—, el repo
no define `core.hooksPath`, y no hay cron ni timer de systemd que lo supla.

El script sigue instalable: `~/.local/share/git-hooks/post-commit-autopush.sh`
junto a su `install.sh`. Cuando estaba enlazado, cada commit limpio empujaba a
todos los remotos y abortaba el push si detectaba un posible secreto en el
diff. Se desenlazó a mitad de la sesión del 2026-09-10 (las fechas de
`.git/hooks/` son posteriores a los commits de esa noche, que sí se empujaron
solos, y anteriores a los del día siguiente, que no). No se sabe quién ni por
qué, así que no se ha reinstalado por iniciativa propia.

**Por qué importa:** una sesión que dé por hecho el auto-push dará por
publicado un commit que sigue en local, y por desplegado un cambio que Vercel
nunca ha visto. Verificar siempre con `git ls-remote github refs/heads/<rama>`
después de commitear.

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
