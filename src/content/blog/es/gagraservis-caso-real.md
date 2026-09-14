---
title: "Caso real: gagraservis.ru, taxi y excursiones en Gagra"
description: "Cómo diseñé gagraservis.ru: tarifas cerradas antes de subir al coche, excursiones con detalle y una sola página que carga entera. Decisiones y cifras reales."
pubDate: 2026-08-12
updatedDate: 2026-09-14
keyword: "taxi y excursiones gagra sitio web"
pillar: "WEB"
relatedService: "WEB-02"
translationSlug: "gagraservis-realnyy-keys"
featured: true
draft: false
---

## El problema

Un negocio de taxi, excursiones, hoteles y restaurantes en Gagra necesitaba presencia online real — no una tarjeta de visita digital, sino un sitio capaz de mostrar tarifas, catálogo de excursiones con fotos y detalle, y servicios adicionales, encontrable tanto en Yandex como en Google.

Y había un problema de negocio debajo del problema técnico. En esa zona el precio de un trayecto se negocia al subir al coche. Para el cliente local eso es rutina; para quien llega de fuera es la parte incómoda del viaje, y es exactamente donde se pierden reservas: el que no sabe cuánto va a pagar, no llama.

## La decisión que ordenó todo lo demás

El sitio se construyó alrededor de una sola idea, que es el titular de su primera pantalla: **el precio se sabe antes de subir**. Tarifas por zona, escritas, sin regateo.

Eso no es una frase de marketing, es una decisión de producto que condiciona el resto. Si el precio es público, tiene que estar visible sin navegar; si tiene que estar visible sin navegar, la tarifa no puede vivir en una página aparte; y si nada vive en una página aparte, el sitio entero cabe en una sola.

## Qué se construyó

Siete bloques, en un orden pensado para quien llega con una duda concreta:

- **Tarifas** por zona, el bloque que justifica todo el sitio.
- **Excursiones**, con su propia ficha de detalle: el lago Ritsa y el resto del catálogo de un día.
- **Lugares de interés** cerca de Gagra, para el que todavía no sabe qué quiere ver.
- **Hoteles y restaurantes** verificados, la parte de recomendación.
- **Servicios adicionales**: traslado al puesto fronterizo de Psou, taxi desde Adler, mensajería, transporte de niños con silla, y conductor sobrio — llevar a casa al cliente *y a su coche*.
- **Reseñas** de pasajeros.
- **Contacto directo** por WhatsApp y Telegram, sin formulario de por medio: en ese mercado nadie rellena un formulario, se escribe por mensajería.

Los servicios que necesitan explicación —los cinco de arriba— se abren en una ficha de detalle sobre la misma página, sin recargar. La duda se resuelve donde aparece.

## Una sola página, y por qué

El sitio es un único archivo HTML autocontenido: las imágenes van embebidas dentro del propio archivo, el CSS va dentro, y no hay ni compilación, ni dependencias, ni backend. Lo único que se pide fuera son las tipografías y dos vídeos.

Es una decisión poco habitual y no vale para cualquier proyecto, así que conviene decir para qué sirve y para qué no.

**A favor:** se sirve desde cualquier sitio y no se cae por partes. No hay una segunda petición que pueda fallar, ni una imagen que tarde en llegar después del texto: cuando la página aparece, aparece entera. Para un visitante con cobertura móvil irregular —que es el visitante real de esta web, muchas veces en la carretera— eso se nota más que cualquier optimización de milisegundos.

**En contra:** la primera carga trae el peso completo de una vez, no hay carga diferida posible, y crecer en contenido no sale gratis. Un catálogo de cien excursiones no se construye así. Uno de seis, sí.

La regla que lo resume: esta arquitectura vale mientras el contenido quepa entero en la cabeza de una persona. En cuanto haga falta una base de datos para saber qué hay publicado, hay que cambiar de modelo.

## SEO técnico desde el primer día, no después

Datos estructurados de `schema.org` declarando lo que el negocio es de verdad —un servicio de taxi, en una ciudad concreta, con su dirección—, no un genérico "empresa". Sitemap enviado a Google Search Console y a Yandex Webmaster desde el principio: en esta zona Yandex no es opcional, es el buscador que usa el cliente.

Esto se hace el primer día porque es el trabajo que no se ve y que nadie encarga después. Cuando un cliente pregunta "por qué no salgo en Google" seis meses más tarde, la respuesta casi siempre es que estas tres cosas no se hicieron cuando costaban una hora.

## Lo que este caso no demuestra

El sitio salió a producción el 28 de julio de 2026. Como cualquier sitio nuevo, posicionar lleva su tiempo natural, y aquí no voy a inventar cifras: no hay datos de posicionamiento ni de tráfico que enseñar, y mientras no los haya, este caso demuestra decisiones de diseño y de arquitectura, no resultados de buscador.

Es la misma regla que aplico a todo lo que publico: si la cifra no existe, no aparece. Cuando exista, se añade con su fecha.
