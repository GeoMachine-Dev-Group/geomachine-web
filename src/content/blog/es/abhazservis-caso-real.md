---
title: "Caso real: abhazservis.com, un directorio de 273 negocios en nueve días"
description: "Cómo construí abhazservis.com: directorio de negocios de Abjasia con Astro SSR, Express y PostgreSQL en servidor propio. Decisiones, cifras reales y errores."
pubDate: 2026-09-14
updatedDate: 2026-11-01
pillar: "SYS"
relatedService: "SYS-02"
translationSlug: "abhazservis-realnyy-keys"
draft: false
---

## Qué es

[abhazservis.com](https://abhazservis.com/) es un directorio de negocios de Abjasia: hoteles, restaurantes, transporte, farmacias, bancos, tiendas, puntos de telefonía. En ruso, el idioma del sitio, y pensado para quien vive allí, no solo para el turista de agosto.

No es un encargo de cliente. Es un proyecto propio de GeoMachine, y lo cuento por eso: es el sitio donde puedo enseñar las decisiones completas, incluidas las que salieron mal, sin pedirle permiso a nadie.

Cuando escribí este artículo, el 14 de septiembre de 2026, el sitio tenía **273 fichas publicadas**, 19 categorías y 8 localidades, y ningún dato de tráfico. Lo he actualizado el 1 de noviembre con lo que pasó en las siete semanas siguientes: cuántas visitas llegaron, qué dijeron Google y Yandex, y qué tuvimos que corregir. A esa fecha el catálogo tiene **291 fichas publicadas**, cero ingresos y ninguna ficha reclamada por su dueño: la parte comercial sigue sin empezar.

## De cero a panel de administración en nueve días

El primer commit es del 2 de septiembre de 2026. El panel de administración se cerró el 10. Nueve días naturales para: infraestructura, autenticación, modelo de datos, importación por lote, panel de cada negocio, buscador y ficha pública, auto-registro de negocios y panel de administración.

Eso no es velocidad de mecanografía. Es que cada bloque se diseñó por escrito antes de escribir código, y cada uno se cerró con tests contra una base de datos PostgreSQL real, sin simulaciones. Los seis primeros bloques estaban listos en los dos primeros días porque el trabajo difícil —decidir el esquema— ya estaba hecho.

## El stack, y por qué

- **Astro 7 en modo servidor** (adaptador Node, standalone) para el sitio público.
- **Express 5** como backend separado, en un monorepo con tres paquetes: `shared`, `backend`, `web`.
- **PostgreSQL 17**, 19 tablas, migraciones en SQL crudo con vuelta atrás obligatoria.
- **Node 24 y TypeScript** en tipos estrictos, **vitest** contra Postgres de verdad.
- Alojado en un **mini-PC propio** detrás de un túnel de Cloudflare. Postgres y el backend no publican ningún puerto; el sitio escucha solo en la interfaz local.

La decisión que más se discutió fue esta: un directorio se juega el negocio en dos cosas, aparecer en Google y cargar rápido. Astro manda cero JavaScript por defecto, y las páginas públicas se sirven sin una sola isla hidratada. El backend va aparte porque la importación por lote se llama desde un script con clave de API, no desde el navegador de nadie.

Y dos decisiones de no hacer: **sin PostGIS** (240 km de costa no necesitan geometría real, bastan dos columnas de latitud y longitud) y **sin capa de internacionalización** (el sitio es en ruso y no se planea otro idioma; montar i18n "por si acaso" es pagar complejidad por adelantado).

## La URL nunca lleva la categoría

La dirección de cada ficha es `/{localidad}/{nombre}`. La categoría no aparece.

El motivo es concreto: recategorizar un negocio no puede romper su dirección ni la autoridad que haya acumulado en el buscador. Y se recategoriza más de lo que uno cree — cuando el catálogo pasó de 8 a 19 categorías, 32 fichas cambiaron de sitio y **ninguna cambió de URL**. La categoría se muestra como miga de pan, calculada al dibujar la página.

Si tienes un catálogo de cualquier tipo, esta es la decisión que más agradecerás dentro de dos años.

## El error que rompía todos los formularios

Este merece su propio apartado, porque le puede pasar a cualquiera que ponga un sitio Astro detrás de un proxy con HTTPS — un túnel de Cloudflare, un Nginx con Let's Encrypt, cualquiera.

Astro trae una protección contra envíos de formulario desde otro sitio: compara la cabecera `Origin` del navegador con el origen de la propia página. El problema es cómo calcula ese origen el adaptador de Node: mira si el socket está cifrado. Y detrás de un proxy no lo está, porque el HTTPS termina en el proxy y hasta el servidor llega HTTP plano. La cabecera `X-Forwarded-Proto`, que existe justamente para decir "esto venía por HTTPS", no se consulta.

Resultado: el navegador manda `Origin: https://…`, el servidor cree que su origen es `http://…`, no coinciden y **todo POST devuelve 403**. El sitio se ve perfecto y ningún formulario funciona.

La prueba que lo dejó claro fue mandar la misma petición dos veces al mismo servidor cambiando solo esa cabecera: con `https` → 403, con `http` → 200. La solución fue desactivar la comprobación de Astro y reimplementarla en un middleware propio que sí lee `X-Forwarded-Proto`.

Lo cuento porque el síntoma engaña: parece un problema del túnel, y no lo es. Habría roto igual el diseño original con Nginx y certificados propios.

## El día que los tests borraron el catálogo

El mismo día que se importaron las primeras 168 fichas, desaparecieron. Dos veces.

La causa: la suite de tests vaciaba las tablas antes de cada prueba, como debe ser, pero leía la dirección de la base de datos de la misma variable de entorno que la aplicación real. Un `npm test` en la máquina equivocada y adiós catálogo.

El arreglo tiene dos capas, y esto es lo importante: **una sola no bastaba**. La primera, una variable de entorno separada para los tests. La segunda, una guarda que se niega a vaciar cualquier base de datos cuyo nombre no termine en `_test`, pase lo que pase con las variables. La primera capa se puede olvidar de configurar; la segunda no depende de que nadie se acuerde.

Se recuperó todo reimportando los lotes de origen, que seguían guardados fuera del repositorio. Esa es la tercera capa, la aburrida: el dato de origen se guarda aunque ya esté cargado.

## Lo que la verificación encontró y nadie había visto

Al construir el orden en que salen los negocios dentro de una categoría, la comprobación previa contra la base de datos real descubrió que **cuatro de los cinco criterios de ordenación no existían**: las columnas que consultaban no estaban en el esquema. El orden efectivo era alfabético puro, y llevaba semanas siéndolo sin que se notara.

Se sustituyó por una fórmula de "riqueza de ficha" —foto, descripción, verificación, web o redes, teléfono, con distinto peso— que se aplica **siempre dentro de la misma categoría**, nunca comparando una farmacia con un hotel.

## Un resultado negativo que también vale

Se probó a generar las descripciones de las fichas automáticamente a partir de los campos estructurados. Dos pasadas, la segunda con contraejemplos explícitos de lo que no se quería. Resultado: **2 aprobadas de 11**, y las dos salían del mismo molde con sinónimos cambiados.

Conclusión: no hay pipeline de contenido automático para las fichas. Saber eso antes de montarlo para dos mil fichas vale más que las descripciones que habría generado.

## Siete semanas después: lo que llegó de los buscadores

El catálogo no tiene publicidad: todo lo que llega viene de buscar. Esto es lo que se ha medido, cada cosa con su fuente:

- **Yandex**, a finales de septiembre: 359 páginas en su buscador y 9 visitas desde él. El 28 de septiembre metió por su cuenta la ficha de la tienda oficial de vino y agua de Abjasia en su lista de «páginas importantes», porque le estaba trayendo tráfico. Fue la primera confirmación de fuera, no medida por nosotros, de que el catálogo servía para algo.
- **Google**, del 13 de septiembre al 29 de octubre: 37 clics y 2.680 impresiones. A finales de octubre tenía 248 páginas indexadas y 203 sin indexar.
- **Nuestro propio contador de vistas de ficha**: 172 vistas en el primer mes. La mediana por ficha publicada es cero: la mayoría de las fichas no la ha abierto nadie todavía.

Son cifras pequeñas, y no las adorno. Pero ya permiten decidir con datos y no con intuición, que era el motivo de guardar estadísticas desde el primer día.

## Por qué Google no indexaba la mitad

Al mirar qué páginas no entraban en Google, la respuesta estaba en el propio catálogo. Medido el 23 de septiembre: de 273 fichas, 208 no tenían ni descripción ni foto, y 63 no tenían nada más que el nombre y la dirección. Una ficha así es, a ojos de Google, la misma página repetida con otro nombre.

La decisión, que se aplicó el 31 de octubre: las fichas sin descripción, sin foto, sin horario y sin ningún contacto siguen en el sitio y enlazadas, pero con `noindex` y fuera del sitemap. Son 65 de 291. En cuanto una gana un dato, vuelve sola al índice. Lo cuento con más detalle, junto con los datos de Search Console de esta misma web, en [por qué tu web no aparece en Google](/es/blog/por-que-mi-web-no-aparece-google/).

## De dónde sale cada dato

El 31 de octubre hicimos un inventario ficha por ficha: de dónde salía cada teléfono, cada coordenada, cada horario y cada valoración de las 291. La regla del proyecto ya era que todo dato tenga una fuente que se pueda citar; el inventario sirvió para comprobar si se cumplía, y no siempre se cumplía.

Lo que salió:
- **Valoraciones copiadas de otro servicio**, 16, que no son nuestras ni de nuestros usuarios. Decidimos quitarlas.
- **24 coordenadas** tomadas de otros servicios de mapas. Se recalculan con OpenStreetMap, y las que no se pueden situar bien se quedan vacías.
- **Un hotel con el horario, la foto y la posición de otro hotel.** Nadie lo había visto.
- **11 fichas** cuya fuente pasa a ser la web oficial del propio negocio.

Y una regla para lo que venga: las fichas nuevas solo con fuentes propias o permitidas. La página «О проекте» del sitio explica ahora qué significa el sello «Проверено» (que los datos salen de la web que la ficha da como suya, no que alguien haya ido en persona) y cómo pedir una corrección.

## Las copias de seguridad

Hasta el 14 de septiembre no había ninguna copia automática, con un catálogo que los tests ya habían vaciado dos veces. Hoy hay tres: una cada noche en el propio servidor, otra en un segundo equipo de casa, y desde el 1 de noviembre una tercera cifrada fuera de casa. La restauración se probó de verdad las dos veces. Cómo se montó, en [copias de seguridad: la regla 3-2-1](/es/blog/copias-de-seguridad-regla-3-2-1/).

## Qué falta

Lo comercial, sobre todo. Ningún dueño ha reclamado su ficha todavía, y la campaña para avisarles por WhatsApp está preparada pero sin mandar: el enlace de reclamar perdía la ficha por el camino si el dueño tenía que registrarse antes, y mandar 95 mensajes a un enlace que falla habría quemado la primera impresión. Primero se arregla el enlace.

Faltan también las reseñas propias, los favoritos y el seguimiento de contactos. Desde el 9 de octubre se cuentan los clics en teléfono, WhatsApp, Telegram y web de cada ficha, que es lo que habrá que enseñarle al dueño cuando llegue la ficha de pago. Si esa medición hubiera empezado el día de la venta, el primer trimestre se vendería sin nada que enseñar.

**Puedes ver el sitio en vivo:** [abhazservis.com](https://abhazservis.com/)
