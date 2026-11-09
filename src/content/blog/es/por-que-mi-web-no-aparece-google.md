---
title: "Por qué tu web no aparece en Google: los datos de nuestras dos webs"
seoTitle: "Por qué tu web no aparece en Google: datos de dos webs"
description: "Qué significan «Descubierta» y «Rastreada: sin indexar», con los datos reales de Search Console de nuestras dos webs y lo que hicimos en cada caso."
pubDate: 2026-08-12
updatedDate: 2026-11-01
pillar: "SEO"
relatedService: "SEO-01"
translationSlug: "pochemu-sayt-ne-v-poiske"
draft: false
---

«Mi web lleva meses funcionando y no aparece en Google» es una de las quejas que más oigo. La reacción típica es pensar que hay que «hacer más SEO», como si fuera magia. Casi nunca es eso: suele haber una o dos causas concretas, y Google te dice cuáles si sabes dónde mirar.

Te lo enseño con nuestras dos webs: [geomachine.es](https://geomachine.es/), esta misma, y [abhazservis.com](https://abhazservis.com/), un directorio de negocios de Abjasia que mantenemos. Las dos tienen páginas que Google no indexa, por motivos distintos.

## Dónde mirar: el informe «Páginas» de Search Console

Google Search Console es gratis y es la única fuente fiable: te dice qué páginas tiene Google en su índice y, de las que no, por qué. Así estaban nuestras dos webs a finales de octubre de 2026:

| | geomachine.es | abhazservis.com |
|---|---|---|
| Páginas indexadas | 50 | 248 |
| Páginas sin indexar | 40 | 203 |
| …de ellas, «Descubierta: actualmente sin indexar» | 27 | 151 |
| …«Rastreada: actualmente sin indexar» | 1 | 13 |
| …excluidas a propósito con `noindex` | 1 | 29 |

Las dos webs tienen el mismo problema principal, la fila de «Descubierta». Vamos por partes, de lo más simple a lo que más cuesta arreglar.

## 1. Google no sabe que tu web existe

Que una web esté en internet no significa que Google la haya encontrado. Hay que darla de alta en Search Console y enviarle el sitemap, el fichero que lista todas tus páginas.

Compruébalo ahora: busca `site:tudominio.com` en Google, con tu dominio. Si no sale nada, Google no tiene ni una página tuya.

## 2. «Descubierta: actualmente sin indexar»

Significa que Google conoce la dirección de la página, normalmente por el sitemap, pero todavía no ha ido a leerla. No es un error técnico: Google decide cuánto rastrear de cada web según lo que la valora, y a una web nueva y pequeña le dedica poco.

Es lo que más tenemos:
- En **abhazservis**, 151 páginas. Es un dominio nuevo, de septiembre de 2026, con cientos de fichas de negocios, y muchas tienen muy pocos datos.
- En **geomachine.es**, 27. El 1 de noviembre comprobamos cuatro artículos que acabábamos de reescribir: tres estaban así. Tenían un mes.

No hay un botón que lo arregle. Lo que ayuda:
- **Tiempo.** Un mes es poco.
- **Menos páginas y mejores.** Si la mitad de tus páginas no aportan nada, Google rastrea menos todas.
- **Enlaces** desde tus propias páginas y desde otras webs.
- **«Solicitar indexación»** en Search Console, para las pocas páginas que más te importan. Sirve para unas pocas al día, no para cientos.

## 3. «Rastreada: actualmente sin indexar»

Aquí Google sí leyó la página y decidió no guardarla. Casi siempre es un problema de contenido: la página dice poco, o dice lo mismo que otras. En abhazservis son 13. Yandex nos dio el mismo aviso con otras palabras: marcó varias fichas, como la de una casa de huéspedes en Gagra, como «Малоценная или маловостребованная», es decir, de poco valor o poco buscada.

## 4. Las páginas que tú no quieres en Google

No todas las páginas deberían indexarse. En abhazservis decidimos marcar con `noindex` las fichas de negocios casi vacías, las que no tienen ni teléfono ni web, y sacarlas del sitemap. Siguen existiendo y se puede llegar a ellas, pero no le pedimos a Google que las indexe. Cuando una gana datos, vuelve a ser indexable sola. Search Console ya cuenta 29 páginas excluidas por `noindex`, entre ellas esas fichas y el buscador interno de la web.

Es contraintuitivo: quitar páginas del índice para que el resto salga mejor. Pero una web con muchas páginas flojas le dice a Google que no merece la pena rastrearla a fondo.

## 5. La misma web en dos direcciones

Si tu web se abre en `tudominio.com` y en `www.tudominio.com`, una tiene que redirigir a la otra, y todo lo demás tiene que señalar a la misma. Nosotros lo tuvimos mal en geomachine.es hasta septiembre de 2026: la dirección principal era la de `www`, mientras el sitemap, las etiquetas canónicas y los datos para Google decían la versión sin `www`. Lo cambiamos el 13 de septiembre, y en Search Console todavía aparecen impresiones de artículos con la dirección con `www`. Google tarda en olvidar.

## 6. Lo técnico de siempre

- **El fichero `robots.txt` bloquea a Google.** Entra en `tudominio.com/robots.txt` y mira si hay una línea `Disallow: /`. A veces se queda puesta desde el desarrollo.
- **Hay poco texto.** Si tu web es casi todo imágenes, como una carta de restaurante en foto, Google no tiene nada que leer.
- **La web es muy lenta en el móvil.** No impide que te indexen, pero te baja frente a competidores más rápidos.

## Lo que puedes comprobar tú, gratis, hoy

1. Busca `site:tudominio.com` en Google: ¿sale algo?
2. Da de alta la web en Search Console, envía el sitemap y, a los pocos días, abre el informe «Páginas». Mira cuántas están sin indexar y por qué.
3. Abre `tudominio.com/robots.txt`: ¿hay algún `Disallow` sospechoso?
4. Abre `www.tudominio.com` y `tudominio.com`: ¿uno lleva al otro, o los dos cargan por separado?

Si falla alguno, ya tienes una pista real y no una suposición.

## Cuándo necesitas ayuda

Si lo de arriba está bien y sigues sin salir, ahí tiene sentido una auditoría técnica: no para «hacer más SEO» en general, sino para encontrar el motivo concreto de tu web. La entrego como un [informe ordenado por prioridad](/es/servicios/#seo), en 2 o 3 días.

---

**¿Ya comprobaste los cuatro puntos y sigues sin salir en Google?** Escríbeme y reviso tu caso. [Mira el servicio de auditoría aquí](/es/servicios/#seo).
