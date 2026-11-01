---
title: "Caso real: gagraservis.ru, el taxi ГаграЛЁТ en Gagra"
description: "La web del taxi ГаграЛЁТ en Gagra: precio antes de subir, una sola página, tres rediseños, lo que quité porque no estaba comprobado y la web que perdí por no tener copia."
pubDate: 2026-08-12
updatedDate: 2026-11-01
pillar: "WEB"
relatedService: "WEB-02"
translationSlug: "gagraservis-realnyy-keys"
featured: true
draft: false
---

[gagraservis.ru](https://gagraservis.ru) es la web de **ГаграЛЁТ**, un taxi de Gagra (Abjasia) que también hace excursiones. Fue mi primer cliente: la web salió a producción el 28 de julio de 2026 y la versión que se ve hoy es del 24 de octubre. Te cuento qué decidí, qué cambié por el camino y qué salió mal.

![Portada de gagraservis.ru en escritorio: el talón de embarque con el trayecto de Psou a Gagra y el precio, 1500 ₽](/images/casos/gagralet-desktop.webp)

## El problema

En esa zona el precio de un trayecto se negocia al subir al coche. Para el de allí es rutina; para el que llega de fuera es la parte incómoda del viaje, y ahí se pierden clientes: el que no sabe cuánto va a pagar, no llama.

Así que la web se construyó alrededor de una idea, que es la frase de su primera pantalla: **la cifra se sabe antes de subir y no cambia en el camino**. Si el precio es público, tiene que verse sin buscarlo; y si se ve sin buscarlo, la web entera cabe en una sola página.

## Cómo es hoy

La portada es un **talón de embarque**, porque el nombre juega con «лёт», vuelo: «Долетим от границы до Гагры», «Volamos de la frontera a Gagra». En el talón se elige el destino y aparece el precio: de Psou a Gagra, 1500 ₽; desde Adler, 4000 ₽. Debajo, cuatro botones: llamar, WhatsApp, Telegram y MAX. El de WhatsApp abre el chat con el mensaje ya escrito y la ruta elegida: el cliente solo tiene que enviarlo.

Más abajo:

- **Tablero de precios**: 17 destinos con su precio y un buscador. Al tocar uno, el talón de arriba se rellena solo.
- **Servicios** que no son un trayecto normal: recoger a alguien del tren con un cartel con su nombre, taxi para niños, mensajería y conductor sobrio, que lleva a casa al cliente *y a su coche*.
- **Excursiones** en coche, con el lago Ritsa en grande.
- **Reseñas** de pasajeros y un cierre: «¿Adónde volamos?».

![La misma portada en el móvil: el talón ocupa la pantalla y los botones de llamar y mensajería quedan a mano](/images/casos/gagralet-mobile.webp)

En el móvil, que es donde se usa, el talón ocupa la pantalla y los botones quedan bajo el pulgar. MAX no permite abrir un chat a partir de un número, como hace WhatsApp, así que su botón enseña el número para copiarlo.

## Tres rediseños para llegar aquí

En octubre rehíce el diseño, y la versión buena fue la tercera:

1. La primera limpiaba la web original, pero era **genérica**: una web de taxi como cualquier otra. La descarté.
2. La segunda tampoco: ni la portada, ni el estilo, ni la estructura tenían fuerza. La guardé aparte y no la publiqué.
3. Para la tercera preparé **tres portadas distintas** antes de tocar el resto: una foto grande, el talón de embarque y otra en amarillo taxi. Elegí el talón, y el resto de la web salió de ahí: el logo de la gaviota, el verde y el tablero de precios.

Lo que aprendí: cuando el diseño no convence, retocar no lo arregla. Lo que funcionó fue enseñar varias direcciones distintas y elegir una antes de hacer el resto.

## Lo que quité porque no estaba comprobado

La web original tenía una sección de **hoteles y restaurantes** recomendados, con estrellas y precios. Al rehacerla miré de dónde salían esos datos y no pude comprobarlos: había fichas con estrellas y precios que no se apoyaban en nada. **La quité entera.** Una recomendación que no puedes defender le resta confianza a todo lo demás, incluidas las tarifas, que eran lo importante.

Con ella se fueron también las animaciones decorativas (un avión, un coche echando humo, burbujas), las ventanas emergentes y una portada repetida.

## Una sola página, y cuánto pesa

La web es un único `index.html`, sin compilación, sin dependencias y sin servidor de aplicación. La original era un solo archivo de **1 MB**, con las fotos metidas dentro. Hoy el HTML pesa **52 KB** y las cinco fotos van aparte, en WebP, unos 0,5 MB en total.

**A favor:** se sirve desde cualquier sitio y no se cae por partes. Para quien la abre con mala cobertura, en la carretera, eso se nota más que cualquier optimización de milisegundos.

**En contra:** crecer en contenido no sale gratis. Un catálogo de cien excursiones no se hace así; uno de pocas, sí. La regla: esta forma de hacerla vale mientras el contenido quepa entero en la cabeza de una persona.

## La web que perdí por no tener copia

Al principio la web vivía **solo en un servidor** (un VPS), sin repositorio ni copia en ningún otro sitio. En agosto ese servidor dejó de responder y la web desapareció. La recuperé de un archivo HTML que había guardado suelto en Telegram, con fecha del 21 de agosto. La web se publicó el 28 de julio, así que no sé si en el servidor había cambios posteriores: se perdieron con él.

Desde entonces la web está en un repositorio con copia, y la sirvo yo desde mi propio servidor, detrás de Cloudflare. Es la lección más cara de este proyecto y la aplico ya a todo: **si una web solo existe en su servidor, no existe**.

## SEO técnico

La web declara con datos estructurados lo que el negocio es de verdad, un **servicio de taxi** (`TaxiService` de schema.org) en Gagra, y no una «empresa» genérica. Tiene sitemap, y el título dice lo que busca quien llega a la frontera: el trayecto de Psou a Gagra y su precio.

## Lo que este caso no demuestra, y lo que falta

No tengo cifras de tráfico, de llamadas ni de pedidos que enseñar. Este caso demuestra decisiones de diseño y de producto, no resultados. Cuando haya cifras, las añado con su fecha.

Y queda algo por arreglar: la foto de la portada es provisional. En el coche se lee un teléfono que no es el de la web. Hace falta una foto real del coche con el número bueno.

Si tienes un negocio en el que el cliente duda antes de llamar, cuéntamelo: casi siempre la duda es el precio, y casi siempre se puede contestar en la primera pantalla.
