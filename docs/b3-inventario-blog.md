# B3 — Inventario y poda del blog (2026-11-01)

Rama `claude/b3-blog-inventario`. Bloque B3 del plan
`Proyectos/geomachine.es/Decisiones/plan-contenido-util-google-2026-10-31.md`.
**Nada borrado ni redirigido**: esto es una propuesta para que la decida Romeo.

## Resumen

- **48 artículos**: 22 en español, 23 en ruso y 3 en inglés.
- **27 salieron el 2026-08-12** (16 es y 11 ru), según `git log`: 18 entre las
  03:43 y las 04:30, y 9 más entre las 21:26 y las 21:41. Todos siguen la misma plantilla
  (problema → lista → «Cuándo NO compensa» → «Cómo lo hago yo» → CTA), y en
  ninguno hay un caso, una cifra ni un error que se pueda comprobar. Es
  justo el patrón que la guía de Google llama contenido hecho para buscadores.
- **Solo 5 artículos aportan experiencia propia comprobable**: los dos casos
  de gagraservis (es/ru), los dos de abhazservis (es/ru) y
  `en/astro-ssr-behind-a-proxy-403`. Hay otros cuatro con algo propio, pero
  poco: `cuanto-cuesta-app-como-uber` alude al taxi sin nombrarlo,
  `skolko-stoit-sayt-taksi-2026` enlaza el caso de gagraservis, y
  `como-elegir-desarrollador-freelance` y `kak-vybrat-razrabotchika` citan
  abhazservis como prueba.
- **El campo `keyword`** no lo usaba nada visible (ni plantillas, ni metas,
  ni JSON-LD, ni `llms.txt`; comprobado con `grep` en todo el repo). Lo he
  quitado del esquema y de los 48 frontmatter en `8043131`, con `npm run
  build` limpio (las mismas 51 páginas de blog: 48 artículos y 3 índices).

**Datos de tráfico: no hay ninguno accesible.** Search Console y Yandex
Webmaster piden iniciar sesión (y los datos de Yandex están congelados desde
el 08-oct por una avería suya, ver el plan). La API de Vercel Web Analytics
responde `404 Web Analytics not found` para `geomachine-web-lista`, aunque
AGENTS.md dice que se activó el 2026-09-11; habría que mirarlo en el panel.
**Antes de aplicar ningún 301**, Romeo debería abrir Search Console →
Rendimiento → Páginas (últimos 3 meses) y comprobar que ninguno de los
artículos marcados «retirar» o «fusionar» trae clics. Si alguno trae, se
reescribe en lugar de retirarlo.

## Tabla

Leyenda de **Exp.**: ✅ experiencia propia comprobable · 🟡 algo propio, poco o
sin concretar · ❌ genérico, podría haberlo escrito cualquiera.
Palabras: cuerpo sin frontmatter (`wc -w`). Fecha: `pubDate` (entre
paréntesis, cuándo se creó el fichero si no coincide).

### Español (22)

| Slug | Título | Pareja ru | Pal. | Fecha | Pilar · servicio | Exp. |
|---|---|---|---|---|---|---|
| `gagraservis-caso-real` ⭐ | Caso real: gagraservis.ru, taxi y excursiones en Gagra | `gagraservis-realnyy-keys` | 770 | 08-12 (act. 09-14) | WEB · WEB-02 | ✅ |
| `abhazservis-caso-real` | Caso real: abhazservis.com, un directorio de 273 negocios en nueve días | `abhazservis-realnyy-keys` | 1188 | 09-14 | SYS · SYS-02 | ✅ |
| `cuanto-cuesta-app-como-uber` | Cuánto cuesta y cuánto tarda montar una app como Uber | — | 626 | 08-12 | APP · PACK-04 | 🟡 |
| `como-elegir-desarrollador-freelance` | Cómo elegir un desarrollador freelance sin que te timen | — (hermano: `kak-vybrat-razrabotchika`) | 753 | 08-12 | WEB · — | 🟡 |
| `cuanto-cuesta-landing-page-2026` | Cuánto cuesta una landing page en 2026: precios reales | `skolko-stoit-lending-2026` | 846 | 08-12 | WEB · WEB-01 | ❌ |
| `app-nativa-o-pwa` | App nativa o PWA: qué necesita de verdad tu negocio | `prilozhenie-ili-pwa` | 677 | 09-14 | APP · APP-04 | ❌ |
| `5-tareas-automatizar-ia` | 5 tareas de tu negocio que ya puedes automatizar con IA | `5-zadach-biznesa-avtomatizirovat-ii` | 627 | 08-12 | IA · IA-03 | ❌ |
| `chatbot-ia-vs-contestar-tu-mismo` | Chatbot de IA vs contestar tú mismo: cuándo compensa | — (hermano: `ii-assistent-whatsapp-cena`) | 586 | 08-12 | IA · IA-02 | ❌ |
| `ia-privada-vs-chatgpt` | IA privada vs ChatGPT: cuándo proteger tus propios datos | — (hermano: `bezopasnost-dannyh-ii`) | 599 | 08-12 | IA · IA-04 | ❌ |
| `ia-empresas-datos-sensibles` | Por qué tu empresa no debe usar ChatGPT con datos sensibles | — (hermano: `chastnyy-server-dlya-biznesa`) | 512 | 08-12 | SYS · SYS-02 | ❌ |
| `hardware-para-ia-local` | Qué hardware necesitas de verdad para IA en tu servidor | `kakoe-zhelezo-nuzhno-dlya-ii` | 531 | 08-12 | SYS · SYS-03 | ❌ |
| `vps-vs-hosting-compartido` | VPS vs hosting compartido: cuándo merece la pena el salto | `vps-ili-obychnyy-hosting` | 546 | 08-12 | SYS · SYS-02 | ❌ |
| `por-que-mi-web-no-aparece-google` | Por qué tu web no aparece en Google aunque exista | — (hermano: `pochemu-sayt-ne-v-poiske`) | 556 | 08-12 | SEO · SEO-01 | ❌ |
| `como-aparecer-google-maps` | Cómo aparecer en Google Maps cuando buscan tu negocio | `kak-poyavitsya-na-google-kartah` | 588 | 08-12 | SEO · SEO-03 | ❌ |
| `seo-multiidioma-errores` | SEO en dos idiomas: errores que hacen que Google te penalice | `seo-na-dvuh-yazykah-oshibki` | 590 | 08-12 | SEO · SEO-04 | ❌ |
| `como-migrar-web-sin-perder-seo` | Cómo migrar tu web sin perder posiciones en Google | `kak-perenesti-sayt-bez-poteri-seo` | 601 | 08-12 | WEB · WEB-05 | ❌ |
| `que-es-un-mvp` | Qué es un MVP y por qué no necesitas gastar 20.000€ | — (hermano: `chto-takoe-mvp`) | 626 | 08-12 | APP · APP-01 | ❌ |
| `tienda-a-medida-vs-shopify-woocommerce` | Tienda a medida vs Shopify vs WooCommerce: comparativa | — (hermano: `internet-magazin-pod-klyuch-vs-platformy`) | 769 | 08-12 | WEB · WEB-03 | ❌ |
| `que-pasa-si-tu-web-se-cae-sin-mantenimiento` | Qué pasa si tu web se cae y nadie la mantiene | `obsluzhivanie-sayta-chto-teryaete` | 651 | 09-13 | MNT · MNT-01 | ❌ |
| `copias-de-seguridad-regla-3-2-1` | Copias de seguridad: la regla 3-2-1 explicada fácil | `rezervnye-kopii-pravilo-3-2-1` | 838 | 10-02 | MNT · MNT-01 | ❌ |
| `dominio-hosting-y-web-que-es-cada-cosa` | Dominio, hosting y web: qué es cada cosa y qué pagas | `domen-hosting-i-sayt-chto-eto` | 759 | 10-02 | WEB · WEB-01 | ❌ |
| `como-saber-si-una-tienda-online-es-fiable` | Cómo saber si una tienda online es fiable antes de pagar | `kak-proverit-internet-magazin-pered-oplatoy` | 827 | 10-02 | WEB · WEB-03 | ❌ |

### Ruso (23)

| Slug | Título | Pareja es | Pal. | Fecha | Pilar · servicio | Exp. |
|---|---|---|---|---|---|---|
| `gagraservis-realnyy-keys` ⭐ | Реальный кейс: gagraservis.ru — такси и экскурсии в Гагре | `gagraservis-caso-real` | 609 | 08-12 (act. 09-14) | WEB · WEB-02 | ✅ |
| `abhazservis-realnyy-keys` | Реальный кейс: abhazservis.com — каталог из 273 организаций за девять дней | `abhazservis-caso-real` | 964 | 09-14 | SYS · SYS-02 | ✅ |
| `skolko-stoit-sayt-taksi-2026` | Сколько стоит сайт для такси или экскурсий в Абхазии | — | 708 | 08-12 | WEB · WEB-02 | 🟡 |
| `kak-vybrat-razrabotchika` | Как выбрать разработчика сайта и не переплатить | — (hermano: `como-elegir-desarrollador-freelance`) | 608 | 08-12 | WEB · — | 🟡 |
| `skolko-stoit-lending-2026` | Сколько стоит лендинг в 2026 году: реальные цены | `cuanto-cuesta-landing-page-2026` | 715 | 09-30 | WEB · WEB-01 | ❌ |
| `prilozhenie-ili-pwa` | Нативное приложение или PWA… | `app-nativa-o-pwa` | 569 | 10-01 | APP · APP-04 | ❌ |
| `5-zadach-biznesa-avtomatizirovat-ii` | 5 задач вашего бизнеса, которые уже можно автоматизировать с ИИ | `5-tareas-automatizar-ia` | 570 | 09-30 | IA · IA-03 | ❌ |
| `ii-assistent-whatsapp-cena` | ИИ-ассистент в WhatsApp: сколько стоит и окупается ли | — (hermano: `chatbot-ia-vs-contestar-tu-mismo`) | 505 | 08-12 | IA · IA-02 | ❌ |
| `bezopasnost-dannyh-ii` | Что теряете, доверяя данные клиентов внешним ИИ-сервисам | — (hermano: `ia-privada-vs-chatgpt`) | 485 | 08-12 | IA · IA-04 | ❌ |
| `chastnyy-server-dlya-biznesa` | Частный сервер для бизнеса: когда данные не должны уходить | — (hermano: `ia-empresas-datos-sensibles`) | 422 | 08-12 | SYS · SYS-02 | ❌ |
| `kakoe-zhelezo-nuzhno-dlya-ii` | Какое железо на самом деле нужно для ИИ на вашем сервере | `hardware-para-ia-local` | 440 | 09-30 | SYS · SYS-03 | ❌ |
| `vps-ili-obychnyy-hosting` | VPS или обычный хостинг: когда пора переезжать | `vps-vs-hosting-compartido` | 480 | 10-01 | SYS · SYS-02 | ❌ |
| `pochemu-sayt-ne-v-poiske` | Почему сайт не появляется в поиске, хотя он есть | — (hermano: `por-que-mi-web-no-aparece-google`) | 470 | 08-12 | SEO · SEO-01 | ❌ |
| `kak-podnyat-sayt-v-yandekse` | Как поднять сайт в Яндексе, если у вас маленький бизнес | — | 579 | 08-12 | SEO · SEO-01 | ❌ |
| `kak-poyavitsya-na-google-kartah` | Как появиться на Google Картах… | `como-aparecer-google-maps` | 529 | 09-30 | SEO · SEO-03 | ❌ |
| `seo-na-dvuh-yazykah-oshibki` | SEO на двух языках: ошибки… | `seo-multiidioma-errores` | 524 | 10-01 | SEO · SEO-04 | ❌ |
| `kak-perenesti-sayt-bez-poteri-seo` | Как перенести сайт и не потерять позиции в Google | `como-migrar-web-sin-perder-seo` | 506 | 09-30 | WEB · WEB-05 | ❌ |
| `chto-takoe-mvp` | Что такое MVP и зачем он нужен малому бизнесу | — (hermano: `que-es-un-mvp`) | 534 | 08-12 | APP · APP-01 | ❌ |
| `internet-magazin-pod-klyuch-vs-platformy` | Интернет-магазин под ключ vs готовые платформы | — (hermano: `tienda-a-medida-vs-shopify-woocommerce`) | 572 | 08-12 | WEB · WEB-03 | ❌ |
| `obsluzhivanie-sayta-chto-teryaete` | Обслуживание сайта: что теряете, если его нет | `que-pasa-si-tu-web-se-cae-sin-mantenimiento` | 522 | 08-12 | MNT · MNT-01 | ❌ |
| `rezervnye-kopii-pravilo-3-2-1` | Резервные копии: правило 3-2-1 простыми словами | `copias-de-seguridad-regla-3-2-1` | 731 | 10-02 | MNT · MNT-01 | ❌ |
| `domen-hosting-i-sayt-chto-eto` | Домен, хостинг и сайт: что это и за что вы платите | `dominio-hosting-y-web-que-es-cada-cosa` | 637 | 10-02 | WEB · WEB-01 | ❌ |
| `kak-proverit-internet-magazin-pered-oplatoy` | Как проверить интернет-магазин перед оплатой | `como-saber-si-una-tienda-online-es-fiable` | 688 | 10-02 | WEB · WEB-03 | ❌ |

### Inglés (3, sin pareja: son originales)

| Slug | Título | Pal. | Fecha | Pilar · servicio | Exp. |
|---|---|---|---|---|---|
| `astro-ssr-behind-a-proxy-403` | Every form returns 403: Astro SSR behind an HTTPS proxy | 672 | 09-14 | SYS · SYS-02 | ✅ |
| `what-a-business-website-costs` ⭐ | What a business website actually costs in 2026 | 777 | 09-14 | WEB · WEB-02 | 🟡 |
| `private-ai-on-your-own-server` | Private AI: when your data cannot leave the building | 741 | 09-14 | IA · IA-04 | 🟡 |

⭐ = `featured: true`.

## Propuesta por artículo

Las parejas es/ru van juntas: se decide una vez para las dos. Cuando digo
«reescribir», se reescribe primero el español con lo que conteste Romeo y
después el ruso a partir de él.

### Mantener

| Artículo(s) | Por qué |
|---|---|
| `gagraservis-caso-real` / `gagraservis-realnyy-keys` | Caso de cliente real con lo que se hizo; es lo que pide la guía. |
| `abhazservis-caso-real` / `abhazservis-realnyy-keys` | Cifras propias y también lo que no salió (cero ingresos, cero fichas reclamadas). Las 273 fichas son las de aquel momento y el texto lo deja claro. |
| `en/astro-ssr-behind-a-proxy-403` | Fallo real en un proyecto propio, con el diagnóstico y el arreglo, y se puede reproducir. Es el mejor artículo del blog. |

### Reescribir con la experiencia de Romeo

Por orden de prioridad: primero donde ya hay material verificado en el repo
o en la bóveda y solo falta el permiso y algún dato.

| # | Artículo(s) | Material real que ya existe | Preguntas para Romeo |
|---|---|---|---|
| 1 | `seo-multiidioma-errores` / `seo-na-dvuh-yazykah-oshibki` | geomachine.es en 4 idiomas: hreflang inyectado a mano en el sitemap porque los slugs difieren, `x-default` que faltaba (auditoría del 14-sep) y el georgiano traducido por IA, sin revisar hasta el 31-oct, que es justo su «Error 2». | ¿Puedo contar que el georgiano estuvo un mes y medio sin revisar? ¿Notaste algún efecto en Search Console al arreglar el `x-default`? |
| 2 | `como-migrar-web-sin-perder-seo` / `kak-perenesti-sayt-bez-poteri-seo` | Migraciones de geomachine.es: Netlify → Vercel, el canónico `www` → sin `www` con 308 (13-sep), las 308 entre `/ruta` y `/ruta/`, y Astro 4 → 5. | ¿Perdiste posiciones o clics en alguno de esos cambios? ¿Tienes una captura de Search Console de antes y después del 13-sep? |
| 3 | `por-que-mi-web-no-aparece-google` / `pochemu-sayt-ne-v-poiske` + `kak-podnyat-sayt-v-yandekse` | `www` y sin `www` contradiciéndose en geomachine.es, que es su punto 6. En abhazservis, Yandex marcó páginas como «Малоценная или маловостребованная» y se respondió con noindex en las fichas vacías (B7). | ¿Puedo publicar las cifras de Yandex Webmaster de abhazservis (359 páginas, las URLs marcadas) y las de Search Console (30 clics en 28 días)? ¿Cuánto tardó Google en indexar geomachine.es desde el primer despliegue? |
| 4 | `vps-vs-hosting-compartido` / `vps-ili-obychnyy-hosting` | abhazservis sirve desde un NUC por Cloudflare Tunnel; pedido de VPS en Contabo el 27-oct; ticket de OVH sin resolver; geomachine.es estático y gratis en Vercel. | ¿Por qué pediste el VPS de Contabo? ¿Qué falló o qué te preocupa del NUC? ¿Cuánto pagas al mes por cada cosa? |
| 5 | `dominio-hosting-y-web-que-es-cada-cosa` / `domen-hosting-i-sayt-chto-eto` | DNS de geomachine.es en Strato apuntando a Vercel; una zona de Cloudflare que nunca se activó; abhazservis con tres dominios en Piensa (`.info` y `.online` sin redirigir hasta el 31-oct); renovación del hosting el 05/12; correo `info@` que rebotaba. | ¿Puedo contar el lío de los dominios de abhazservis como ejemplo de qué revisar? ¿Cuánto pagas por cada dominio y hosting? |
| 6 | `como-aparecer-google-maps` / `kak-poyavitsya-na-google-kartah` | Ficha de Google Business de GeoMachine (CID en la bóveda) y alta de abhazservis en Yandex Бизнес el 01-nov (moderación, «Мало фото», no deja escribir descripción libre). | ¿Cuánto tardó la verificación de la ficha de Google y cómo se hizo? ¿Te ha traído alguna visita o llamada? ¿Cómo acabó la moderación de Yandex? |
| 7 | `cuanto-cuesta-app-como-uber` | Hoy dice «estoy construyendo exactamente este tipo de sistema» sin nombrarlo. Es el taxi (taxi.abhazservis.com, uber-mvp), que según el plan entra como piloto. | ¿Cuánto tardaste en el piloto del taxi? ¿Cuántos conductores y viajes reales ha tenido? ¿Qué parte fue más difícil (asignación, bloqueos, pagos)? ¿Puedo enlazarlo? Se puede hacer junto con el caso de B4. |
| 8 | `que-es-un-mvp` / `chto-takoe-mvp` | El ejemplo es una app de yoga inventada. abhazservis («nueve días») y el taxi son MVP reales, y PACK-07 promete «MVP en 3 semanas». | ¿Qué dejaste fuera a propósito en abhazservis y en el taxi para salir antes? ¿Qué añadiste después porque lo pidieron los usuarios? |
| 9 | `que-pasa-si-tu-web-se-cae-sin-mantenimiento` / `obsluzhivanie-sayta-chto-teryaete` | gagraservis.ru dejó de resolver (decisión del 10-sep, no un fallo, pero es el ejemplo de una web que desaparece) y abhazservis depende de un NUC en casa. No hay ningún cliente de mantenimiento. | ¿Se te ha caído alguna vez abhazservis o el taxi? ¿Cuánto tiempo, y cómo te enteraste? ¿Qué vigilancia tienes hoy? |
| 10 | `cuanto-cuesta-landing-page-2026` / `skolko-stoit-lending-2026` + `ru/skolko-stoit-sayt-taksi-2026` | El de taxi ya se apoya en gagraservis, que es su mejor baza; el de landing no tiene nada propio. | ¿Cuánto cobraste y cuánto tardaste de verdad en gagraservis y en KADRI LAB? ¿Puedo dar las cifras, aunque sea en rango? |
| 11 | `5-tareas-automatizar-ia` / `5-zadach-biznesa-avtomatizirovat-ii` | Optimus (copiloto de voz para conductores, piloto con varios conductores), que Romeo ya cita en LinkedIn. | ¿Puedo usar Optimus como ejemplo en la web? ¿Qué tarea concreta les quita a los conductores y cuánto tiempo? ¿Hay alguna cifra del piloto que se pueda publicar? |
| 12 | `app-nativa-o-pwa` / `prilozhenie-ili-pwa` | Ninguno verificado. | ¿abhazservis, el taxi u Optimus son PWA o nativas? ¿Por qué lo decidiste así? ¿Has publicado algo en Play Store o App Store? |
| 13 | `como-elegir-desarrollador-freelance` / `kak-vybrat-razrabotchika` | Ya cita abhazservis como prueba, pero la cifra se ha quedado vieja: «273 fichas… Hoy el catálogo ya tiene 274» (son 291 tras B7). | ¿Has contratado tú alguna vez a un freelance? ¿Qué te pasó? Si no, basta con corregir la cifra (mejor sin número, o «más de 250») y emparejar los dos artículos. |
| 14 | `ia-privada-vs-chatgpt` / `bezopasnost-dannyh-ii` (son los destinos de las fusiones de abajo) | Ninguno verificado. Los dos repiten la lista genérica de clínicas, despachos y asesorías. | Las mismas preguntas de la fila 15. Si no hay experiencia propia, al menos fundir aquí lo mejor del artículo inglés (las tres opciones y sus costes). |
| 15 | `en/what-a-business-website-costs`, `en/private-ai-on-your-own-server` | Cito el problema de precios en «Hallazgos». El de IA privada da precios de GPU (600–900 € por 16 GB, 1.500–2.000 € por 24 GB) que nadie ha comprobado. | ¿Has montado algún modelo en local? ¿Con qué tarjeta, qué modelo y qué velocidad? ¿«Three things I keep seeing» lo has visto tú, y en qué proyectos? |

### Fusionar (301 de uno al otro)

| Retirar | → Destino | Por qué |
|---|---|---|
| `es/ia-empresas-datos-sensibles` | `es/ia-privada-vs-chatgpt` | Es el mismo artículo dos veces: la misma lista (clínicas, despachos, asesorías), los mismos argumentos, a 3 minutos de distancia en el mismo commit. Canibalizan la misma búsqueda. |
| `ru/chastnyy-server-dlya-biznesa` | `ru/bezopasnost-dannyh-ii` | Lo mismo en ruso. |
| `es/hardware-para-ia-local` / `ru/kakoe-zhelezo-nuzhno-dlya-ii` | `es/ia-privada-vs-chatgpt` / `ru/bezopasnost-dannyh-ii` | No da ni una cifra («la VRAM importa más») y cabe en una sección del de IA privada, como ya hace el inglés. **Salvo** que Romeo tenga datos de hardware propio (fila 15): entonces se reescribe y se queda. |
| `es/chatbot-ia-vs-contestar-tu-mismo` / `ru/ii-assistent-whatsapp-cena` | `es/5-tareas-automatizar-ia` / `ru/5-zadach-biznesa-avtomatizirovat-ii` | La tarea 1 de «5 tareas» es este artículo. **Salvo** que Romeo haya entregado algún asistente de WhatsApp (IA-02): entonces se reescribe con ese caso. |

Antes de fusionar, se pasa al destino lo que el origen tenga de valor (por
ejemplo, el desglose de precios del chatbot).

### Retirar

| Artículo(s) | Destino | Por qué |
|---|---|---|
| `es/como-saber-si-una-tienda-online-es-fiable` / `ru/kak-proverit-internet-magazin-pered-oplatoy` | 301 al índice del blog del idioma (`/es/blog/`, `/ru/blog/`) | Va dirigido a quien compra en una tienda, no a quien encarga una web; no tiene que ver con ningún servicio y no hay experiencia que lo sostenga. Un 301 a un tema distinto Google lo trata como soft 404, así que al índice o un 410. **Salvo** que Romeo lo escribiera a raíz de algo que le pasó. |
| `es/tienda-a-medida-vs-shopify-woocommerce` / `ru/internet-magazin-pod-klyuch-vs-platformy` | 301 a `/es/servicios/#web` y `/ru/uslugi/#web` | Compara costes a 3 años de tiendas sin haber entregado ninguna (no consta ninguna tienda en los trabajos). **Salvo** que Romeo haya hecho alguna tienda: entonces se reescribe con ella. |
| `es/copias-de-seguridad-regla-3-2-1` / `ru/rezervnye-kopii-pravilo-3-2-1` | — (decisión blanda) | Está bien escrito, pero es divulgación para particulares (las fotos del móvil): no es el público de MNT-01. Propongo **reescribirlo** con la rutina real de copias de abhazservis (hay un `pg_dump` previo a B7 en `~/Backups/abhazservis/`). Si Romeo no quiere contarla, retirarlo con 301 a `que-pasa-si-tu-web-se-cae-sin-mantenimiento`, que ya habla de copias. |

**Recuento si Romeo acepta todo tal cual y ninguna excepción («salvo…»)
aplica:** se quedan 5, se reescriben 33 (incluidas las copias), se fusionan
6 y se retiran 4 (las dos parejas de tiendas). Quedan 38 artículos.

## Hallazgos de paso (no tocados)

1. **Siete parejas es/ru sin `translationSlug`.** Son el mismo artículo en
   los dos idiomas (misma estructura, mismos apartados), pero no están
   enlazadas y por eso no llevan hreflang entre sí: freelance ↔
   kak-vybrat, por-que-no-aparece ↔ pochemu, que-es-un-mvp ↔ chto-takoe-mvp,
   chatbot ↔ ii-assistent, tienda ↔ internet-magazin, ia-privada ↔
   bezopasnost y ia-empresas ↔ chastnyy. Se emparejan al aplicar la
   decisión (las que sobrevivan).
2. **Precios escritos a mano en el texto.** 28 de los 48 artículos llevan
   cifras en € o ₽, casi siempre precios del catálogo. Cuando se llene `LAUNCH_SLOTS`, el
   catálogo pasa solo al estándar y los artículos no: dirán precios que ya
   no existen. Al reescribir, mejor «desde X» con enlace al catálogo, o
   asumir que hay que repasarlos al cerrar el lanzamiento.
3. **El inglés da precios de otra tarifa.** `what-a-business-website-costs`
   da los precios **estándar** (landing 500–900 €, mantenimiento 49 €/mes) y
   `private-ai` cobra «3,000 to 8,000 €», que es el estándar de IA-04. La web
   en inglés muestra el precio de lanzamiento (250–400 €, 25 €/mes,
   1.500–3.500 €) y los artículos en español también. Un lector inglés ve
   dos precios para lo mismo.
4. **`cuanto-cuesta-app-como-uber`** da PACK-04 como rango («entre 3.800 € y
   8.500 €, según el alcance»), pero en el catálogo es un precio fijo de
   3.800 € de lanzamiento y 8.500 € estándar. No es un rango.
5. **Cifra vieja**: `como-elegir-desarrollador-freelance` («Hoy el catálogo
   ya tiene 274 negocios») y `src/lib/llms.ts:163` («274 published
   listings today»). Tras B7 son 291.
6. **Vercel Web Analytics** no responde por API (404) aunque AGENTS.md lo da
   por activo desde el 11-sep. Conviene mirarlo en el panel: si está
   apagado, B6 no tiene datos propios.

## Siguiente paso

1. Romeo revisa Search Console (Páginas, 3 meses) para los 10 marcados
   «fusionar» o «retirar».
2. Romeo decide la tabla y contesta las preguntas que quiera, por orden de
   prioridad.
3. Una sesión aplica las fusiones y retiradas (redirecciones en
   `vercel.json` o `astro.config.mjs`, fuera del sitemap y de `llms.txt`) y
   empareja los `translationSlug`, y luego reescribe artículo a artículo.
   Cada reescritura, con la revisión de Romeo antes de publicarla.
