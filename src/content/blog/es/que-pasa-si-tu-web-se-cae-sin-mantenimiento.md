---
title: "Qué pasa si tu web se cae y nadie la mantiene"
description: "Qué le pasa de verdad a una web sin mantenimiento: caídas que nadie ve, certificados caducados y copias que no existen. Y cuánto cuesta evitarlo."
pubDate: 2026-09-13
updatedDate: 2026-11-01
pillar: "MNT"
relatedService: "MNT-01"
translationSlug: "obsluzhivanie-sayta-chto-teryaete"
draft: false
---

Una web recién entregada funciona. Eso nadie lo discute. El problema es que «funciona hoy» y «seguirá funcionando dentro de seis meses sin que nadie la mire» son dos cosas distintas, y la diferencia entre las dos suele salir más cara que el mantenimiento.

Esto es lo que le pasa a una web cuando nadie se ocupa de ella.

## 1. Se cae y te enteras el último

Los servidores se actualizan, se reinician y, de vez en cuando, fallan. Sin vigilancia, tu web puede dejar de abrir un sábado por la noche y no lo sabrás hasta que un cliente te escriba «oye, tu web no va». O peor: hasta que no te escriba nadie, porque se ha ido directamente a la competencia.

Con mantenimiento, hay un sistema comprobando que la web responde y que avisa en cuanto deja de hacerlo. La caída se arregla antes de que la note un cliente.

## 2. El certificado caduca sin avisar

El candado del navegador depende de un certificado que hay que renovar. Si caduca, quien entra ve un aviso a pantalla completa de «la conexión no es privada». Casi nadie sigue adelante después de eso: cierra la pestaña pensando que tu web es peligrosa, cuando lo único que ha pasado es que nadie renovó un certificado.

## 3. Las copias de seguridad no están cuando las necesitas

Un ataque, una actualización que sale mal, un archivo borrado por error. Sin copias automáticas, recuperar la web puede no ser caro: puede ser imposible, y toca rehacerla desde cero. Con copias hechas de forma regular, volver a un estado que funcionaba es cuestión de minutos.

## 4. Pierdes posiciones en Google poco a poco

Google tiene en cuenta la velocidad, los enlaces rotos y que la parte técnica esté al día. Una web abandonada va acumulando pequeños problemas que, uno a uno, no se notan. Juntos, la van empujando hacia abajo en los resultados, sin un momento concreto en el que puedas decir «aquí se rompió».

## 5. Cada cambio pequeño se convierte en un proyecto

Cambiar una foto, actualizar un precio, añadir un servicio. Sin plan de mantenimiento, cada vez hay que buscar a alguien, explicarle cómo está hecha la web y negociar un presupuesto para diez minutos de trabajo. Con un plan, son horas incluidas que se usan cuando hacen falta.

## Lo que me ha pasado en mis propias webs

Nada de lo anterior es teoría. Esto es lo que me pasó en dos meses:

- **Una caída que no vi yo, sino Yandex.** [abhazservis.com](/es/blog/abhazservis-caso-real/) funciona en un pequeño servidor en casa. El 22 de septiembre el robot de Yandex se encontró la web sin responder. La primera explicación que dimos, que cada actualización dejaba el sitio caído, era falsa: la dimos sin medir. Midiendo, la causa era otra: se caía el internet de casa. Hubo días malos el 23 de agosto y el 19, el 21 y el 22 de septiembre. Desde entonces el fichero que los buscadores piden primero, `robots.txt`, se sirve desde la red de Cloudflare y responde aunque el servidor esté caído. La solución de verdad, sacar la web de casa, sigue pendiente.
- **Las actualizaciones también cortaban, aunque poco.** Al publicar un cambio, el servidor tardaba unos segundos en volver y en ese rato daba errores. Cambiamos cómo se apaga y pusimos delante un intermediario que reintenta. En la publicación siguiente lanzamos 153 peticiones de prueba mientras se actualizaba: todas respondieron bien.
- **Un servidor que desapareció.** El 27 de octubre el servidor del taxi que estoy montando dejó de responder. Lo recuperé en otro gracias a una copia del día anterior, y desde ese día hay copia diaria cifrada. En abhazservis, hasta el 14 de septiembre no había ninguna copia automática. Lo cuento con detalle en [copias de seguridad: la regla 3-2-1](/es/blog/copias-de-seguridad-regla-3-2-1/).

## Lo que cuesta el riesgo frente a lo que cuesta evitarlo

El mantenimiento básico —alojamiento, copias, certificado y vigilancia de caídas— empieza en **25 € al mes** con la tarifa de lanzamiento. Compáralo con un solo día de web caída en temporada alta, o con pagar otra vez una web entera porque no había copia. La cuenta casi nunca sale a favor de «ahorrarse» el mantenimiento.

## Qué nivel necesitas

- **Que no se caiga y esté segura**, sin cambios: plan **Basic**, 25 € al mes.
- **Además, retoques de vez en cuando** (fotos, textos, precios): plan **Pro**, con dos horas de cambios al mes e informe mensual, 55 € al mes.
- **La web es parte central del negocio** y cada hora caída cuesta dinero: plan **Business**, con respuesta en menos de 24 horas, 110 € al mes; o **Enterprise**, con acuerdo de servicio por escrito y respuesta el mismo día, 190 € al mes.

Son precios de lanzamiento, y el precio de tu plan no sube mientras sigas de alta.

## Cómo lo planteo

No hay un paquete que sirva igual para todo el mundo. Miramos cuánto depende tu negocio de la web y elegimos el nivel que le corresponde, no el más caro: una web que es tu tarjeta de visita no necesita lo mismo que una tienda que factura todos los días.

---

**¿Tu web lleva meses sin que nadie la mire?** Escríbeme qué tipo de negocio tienes y cuánto depende de ella, y te digo qué plan tiene sentido. [Mira los planes de mantenimiento aquí](/es/servicios/#mnt).
