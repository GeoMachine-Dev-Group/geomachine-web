# geomachine.es — ficha del proyecto

## 0. Estado actual (2026-09-14)

**Producción está en `86af113`** (feat(blog): blog en inglés — infraestructura
y tres artículos), desplegado el 2026-09-14 y
verificado en vivo. `main` y
producción coinciden en el código del sitio; no hay ramas de trabajo vivas (en
`backup` quedan `master` y `restaura-controles-interactivos`, antiguas, sin
tocar).

**Cómo se despliega ahora.** El modo automático de Claude Code puede bloquear
el push a `main`, porque es un despliegue a producción: lo bloqueó con un merge
de código y dejó pasar un push de solo documentación. Si lo bloquea, el flujo que funciona es: rama →
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
5. `224723f` (2026-09-14) — rama `feat/portadas-y-limpieza`:
   - **Portadas del blog**: un PNG de 1200×630 por artículo, generado en el
     build, que sale en las tarjetas del índice, como `og:image` y como
     `image` del BlogPosting.
   - **Artículo de Mantenimiento en español**
     (`que-pasa-si-tu-web-se-cae-sin-mantenimiento`), emparejado por
     `translationSlug` con el ruso en los dos sentidos. Hasta ahora ese pilar
     no tenía artículos en español.
   - **Un solo botón flotante de contacto** (`FloatingChat.astro`, clase
     `.contact-fab`) con presupuesto, Telegram y WhatsApp, en lugar de dos. El
     de presupuesto apunta a `servicesPath#contacto` con ruta completa: el
     anterior `#contacto` no hacía nada en el blog.
   - Fuera `Calculator.astro` (no se usaba en ninguna página), su CSS y la
     variable `--heading`, que solo usaba ella.

6. `d072612` (2026-09-14) — artículo "App nativa o PWA: qué necesita de
   verdad tu negocio" (pilar APP, en español).
7. `dac54ab` (2026-09-14) — arreglos de la auditoría SEO del 2026-09-14:
   - `llms.txt` y `llms-full.txt` **generados desde el catálogo**
     (`src/lib/llms.ts` + dos endpoints). Los de `public/` estaban escritos a
     mano y contradecían a la web (servicios y precios inventados). Si se
     tocan servicios o precios, esos ficheros se actualizan solos.
   - `vercel.json` nuevo, con las cabeceras de seguridad que `public/_headers`
     nunca aplicó (ese formato es de Netlify; Vercel solo lo copiaba) y caché
     inmutable de un año para `/_astro` y `/fonts`.
   - Títulos y descripciones dentro de longitud en las 4 páginas de Accounts y
     los dos índices del blog; `x-default` que faltaba.
8. `a0254e4` (2026-09-14) — **abhazservis.com** citado como trabajo entregado,
   en la franja del hero (etiqueta "Entregado" en los 4 idiomas) y en
   `llms.ts` como "Selected work", para que las IA puedan citarlo.
9. `919d3c4` (2026-09-14) — **Romeo Mikava como fundador** en el JSON-LD
   (`src/data/organization.ts`). Es lo que separa a esta empresa de las otras
   dos que usan el nombre GeoMachine ante Google y ante las IA.

10. `1000784` (2026-09-14) — rama `refactor/sistema-visual`:
   - **Sistema visual**: las tres escalas de `:root` descritas más abajo. 70
     valores de espaciado mapeados exactos y el resto redondeado al escalón más
     cercano (ningún cambio pasa de 3 px); once tamaños de letra por debajo de
     0,8 rem reducidos a tres.
   - **AppAccountsPage.astro** deja de llevar estilos inline: clases `.app-*`,
     las cuatro tarjetas salen de un array y la URL de la release se declara
     una vez en lugar de tres.
   - **Caso de abhazservis.com** en español y ruso, con las cifras del propio
     proyecto (273 fichas, 19 categorías, 8 localidades, nueve días) y lo que
     no hay: cero ingresos, cero fichas reclamadas, cero tráfico.
   - **Caso de gagraservis ampliado** de 194 a 761 palabras, y fuera los
     enlaces a `gagraservis.ru`, que salían en siete páginas —entre ellas la
     franja de trabajos de la portada en los cuatro idiomas— apuntando a un
     dominio que no resuelve.

11. `86af113` (2026-09-14) — rama `feat/blog-en`: **blog en inglés**. Inglés y
   georgiano tenían 2 páginas cada uno frente a 30 y 19. Se abre `/en/blog/`
   con tres artículos propios (no traducciones); en georgiano **no**, y es
   deliberado: todo el `ka` va traducido por IA sin revisar, y doce artículos
   largos así agrandan el problema en vez de arreglarlo. La infraestructura
   pasa de dos idiomas a N — `hasBlog()` estrecha el tipo, `buildHreflang`
   deduce el idioma de la pareja de su slug (por descarte ya no vale con
   tres), y `blogIndexHreflang` y `llms.txt` se generan desde `blogPath`.
   Para añadir `ka` cuando haya revisor: `BlogLang`, `blogPath` y las dos
   rutas de `src/pages/ka/blog/`. Nada más.

**Trampas conocidas:**
- Las clases base `.hero`, `.hero__title`, `.hero__body` y `.hero__eyebrow`
  las comparte `AppAccountsPage.astro`. El estilo del catálogo va solo bajo
  `.hero--atelier`; no tocar las base sin revisar esa página.
- **Portadas del blog**: `src/pages/og/blog/[lang]/[slug].png.ts` +
  `src/lib/og-cover.ts`, con satori (texto como trazados) y sharp. Las fuentes
  de `src/assets/og-fonts/` son TTF **estáticas** instanciadas con fontTools
  (`varLib.instancer`) desde los woff2 variables de `public/fonts`: satori
  falla con fuentes variables (`parseFvarAxis`). Si se cambia de fuente,
  repetir esa conversión.
- La página de GeoMachine Accounts en español es `/es/servicios/app-cuentas/`
  (slug traducido), no `app-accounts`.
- El separador de miles va por idioma de quien lee (`THOUSANDS` en
  `Catalog.astro`), no por moneda: "1.800 €" en es, "1,800 €" en en y
  espacio duro en ru y ka.
- **Dominio canónico: `geomachine.es`, sin `www`.** Desde el 2026-09-13
  `www.geomachine.es` redirige con 308 a `geomachine.es` (antes era al revés y
  contradecía canonical, hreflang, sitemap, robots, JSON-LD y Yandex). Es un
  ajuste de dominios del proyecto en Vercel (Settings → Domains), cambiado por
  API; no está en el código, y un `vercel.json` para esto haría bucle.
- **Cloudflare no controla este dominio.** El DNS real está en Strato
  (`docks20`/`shades08.rzone.de`) y apunta directo a Vercel. La zona
  `geomachine.es` que había en la cuenta de Cloudflare nunca llegó a activarse
  y se borró el 2026-09-13. En la cuenta sigue el túnel `geomachine` (activo
  en la máquina local), ya sin zona asociada.

**Pendientes:**
- Revisión nativa del georgiano: hero, placeholders del formulario, plazas,
  "Solicitar plaza", franja de trabajos, botón de contacto y texto de
  WhatsApp. Todo va traducido por IA y marcado
  en `src/i18n/ui.ts`.
- Decidir si se reinstala el hook `post-commit` de auto-push (ver más abajo).
- Falta foto del fundador en la sección `.close`.
- `gagraservis.ru` sigue sin publicar (decisión del 2026-09-10, no un fallo).
  Mientras siga así, nada del sitio debe enlazar a ese dominio: la franja de
  trabajos y los artículos que lo citaban apuntan ya al caso del blog. Los
  pasos para volver a publicarlo están en el `AGENTS.md` de ese repo.
- Del caso de gagraservis se quitó la afirmación de que el sitio era bilingüe
  con hreflang: la única copia que se conserva (2026-08-21) es monolingüe rusa
  y no hay forma de comprobarlo. Si aparece el original del VPS, se revisa.

**Estado SEO:** Yandex verificado como `https://geomachine.es`, `sitemap-index`
y `sitemap-0` enviados, 15 URLs rusas en cola de rastreo. Google indexa bien.

**Sistema visual (desde el 2026-09-14).** `src/styles/global.css` tiene ya sus
escalas en `:root`, y lo nuevo debe salir de ahí en vez de inventar valores:
- `--space-1` … `--space-16`: el número es el múltiplo de 0,25 rem
  (`--space-4` = 1 rem), como en Tailwind. Por debajo de 0,4 rem se siguen
  usando literales a propósito: son ajustes ópticos, no espaciado de layout.
- `--radius-xs|sm|md|lg|xl|pill`.
- `--fs-3xs` … `--fs-4xl`. Los títulos que escalan con el ancho siguen con su
  `clamp()`: son tipografía fluida, no escalones de la escala.
- Puntos de corte: solo existen 480, 720 y 860 px, y 860 es el único que se usa
  también en `min-width`. CSS no admite `var()` en `@media`, así que van
  literales y la convención está escrita en la cabecera de la hoja.

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
