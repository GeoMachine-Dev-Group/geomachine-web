---
title: "Cómo migrar tu web sin perder posiciones en Google: cuatro cambios reales"
description: "Qué hacer antes, durante y después de cambiar direcciones, dominio o servidor, con cuatro migraciones de nuestras propias webs en otoño de 2026 y lo que salió mal."
pubDate: 2026-08-12
updatedDate: 2026-11-01
pillar: "WEB"
relatedService: "WEB-05"
translationSlug: "kak-perenesti-sayt-bez-poteri-seo"
draft: false
---

El miedo a rediseñar una web es razonable: si el cambio se hace mal, las visitas que ya tenías se van. Pero se puede evitar, y la mejor forma de explicarlo es con cambios hechos de verdad. Entre septiembre y noviembre de 2026 hice cuatro en mis propias webs: cambié la dirección principal de esta, renombré un servicio en cuatro idiomas, quité ocho artículos del blog y moví un servidor entero. Te cuento cada uno y qué aprendí.

## Por qué se pierde posicionamiento

Google no recuerda tu web como marca: recuerda **direcciones concretas**. Si tu página de servicios estaba en `tuweb.com/servicios` y en la web nueva está en `tuweb.com/lo-que-ofrecemos`, para Google la antigua ha dejado de existir, y lo que había ganado se pierde si no se le dice adónde se ha ido. Eso se le dice con una **redirección 301**: «esta página se ha mudado aquí, para siempre».

## Caso 1: la misma web en dos direcciones

Hasta el 13 de septiembre de 2026, geomachine.es tenía la dirección principal con `www`, mientras el sitemap, las etiquetas canónicas, los datos para buscadores y Yandex decían la versión sin `www`. La web funcionaba en las dos, pero le daba a Google dos respuestas distintas a la pregunta de cuál es la buena.

Lo arreglamos eligiendo una, la de sin `www`, y haciendo que la otra redirija a ella. Hoy `www.geomachine.es` responde con una redirección permanente a `geomachine.es`. Siete semanas después, Search Console todavía enseña impresiones de artículos con la dirección con `www`. **Google tarda en olvidar**, y eso es normal: lo importante es que todo apunte al mismo sitio.

## Caso 2: cambiar el nombre de una página

El 18 de octubre la app que se llamaba NavCam pasó a llamarse Optimus, y con ella la dirección de su página en los cuatro idiomas: `/es/servicios/navcam-conductor/` pasó a `/es/servicios/optimus/`, y lo mismo en ruso, inglés y georgiano. Cada dirección vieja redirige a la nueva de su idioma, no todas a la española.

Un detalle que se olvida: en esta web las direcciones terminan en barra, y la vieja podía llegar con barra y sin ella. Hubo que poner las dos redirecciones en cada idioma, ocho en total. Si solo pones una, la mitad de los enlaces antiguos acaban en un error.

## Caso 3: quitar artículos que no aportaban

El 1 de noviembre retiré cuatro artículos del blog y fusioné otros cuatro con artículos parecidos. Antes de tocar nada miré en Search Console qué traía cada uno: **ninguno de los ocho tenía un solo clic en tres meses, y casi todos ni siquiera salían en los resultados**. Por eso se podían quitar sin perder nada.

Cada uno redirige a lo más útil para quien llegue por la dirección vieja: los fusionados, al artículo que ahora cubre su tema; los retirados, a la página de servicios o al índice del blog. Ojo con esto último: si redirige a una página genérica, Google puede tratarla como si la dirección ya no existiera. Con cero clics, no había nada que perder.

Después de publicar comprobé las 16 redirecciones una por una (ocho direcciones, con y sin barra). Las 16 llevaban a su destino.

## Caso 4: cambiar de servidor

El 27 de octubre el servidor del taxi que estoy montando dejó de responder. Lo monté en un servidor nuevo a partir de la copia del día anterior y cambié el DNS para que el dominio apuntara a la nueva máquina. Las direcciones de la web no cambiaron, así que para Google no hubo migración: solo un rato sin respuesta.

Esto es lo que más tranquiliza de un cambio de servidor bien hecho: si las direcciones se quedan igual, el posicionamiento no se toca. El riesgo está en el tiempo que el sitio esté caído, y eso depende de tener una copia que funcione.

## Lo que hago siempre, con lo aprendido

**Antes**
1. Lista de todas las direcciones que existen y cuáles traen visitas. Search Console te lo dice.
2. Para cada una que cambie, decide adónde va. Las que traen visitas no se borran: se reescriben o se redirigen a su equivalente.

**Durante**
- Una redirección 301 por cada dirección que cambie, con y sin barra final si tu web admite las dos.
- Cada idioma redirige a su propio idioma.
- Si puedes, cambia el diseño sin cambiar las direcciones. Cambiar las dos cosas a la vez multiplica el riesgo y, si algo falla, no sabes qué fue.

**Después**
1. Comprueba cada redirección de verdad, no te fíes de que «debería funcionar».
2. Vuelve a enviar el sitemap en Search Console.
3. Vigila unas semanas. Alguna fluctuación es normal; una caída grande y sostenida es que algo salió mal.

## El error más caro

Cambiar de plataforma, de dominio y de diseño a la vez. Cada cambio por separado tiene su riesgo; juntos hacen casi imposible saber qué falló. Hazlos por pasos: primero el diseño con las mismas direcciones, y después, si hace falta, lo demás.

## Cómo lo hago yo

Antes de tocar el rediseño hago el inventario de las direcciones actuales y decidimos juntos cuáles se quedan y cuáles se redirigen. La migración [se entrega en 2–4 días](/es/servicios/#web), con cada redirección comprobada antes de darla por terminada.

---

**¿Tienes una web que necesita cambio pero te da miedo perder lo que ya tienes?** Cuéntame cómo está montada ahora y te digo el plan concreto. [Mira el servicio de migración aquí](/es/servicios/#web).
