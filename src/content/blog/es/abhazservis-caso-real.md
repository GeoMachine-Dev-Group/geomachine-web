---
title: "Caso real: abhazservis.com, un directorio de 273 negocios en nueve días"
description: "Cómo construí abhazservis.com: directorio de negocios de Abjasia con Astro SSR, Express y PostgreSQL en servidor propio. Decisiones, cifras reales y errores."
pubDate: 2026-09-14
keyword: "desarrollo directorio de negocios a medida"
pillar: "SYS"
relatedService: "SYS-02"
translationSlug: "abhazservis-realnyy-keys"
draft: false
---

## Qué es

[abhazservis.com](https://abhazservis.com/) es un directorio de negocios de Abjasia: hoteles, restaurantes, transporte, farmacias, bancos, tiendas, puntos de telefonía. En ruso, el idioma del sitio, y pensado para quien vive allí, no solo para el turista de agosto.

No es un encargo de cliente. Es un proyecto propio de GeoMachine, y lo cuento por eso: es el sitio donde puedo enseñar las decisiones completas, incluidas las que salieron mal, sin pedirle permiso a nadie.

Las cifras de hoy: **273 fichas publicadas**, 19 categorías, 8 localidades, 44 fichas verificadas contra la web oficial del negocio. Cero ingresos, cero fichas reclamadas por sus dueños y cero datos de tráfico acumulados: el catálogo está construido, la parte comercial no ha empezado.

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

## Qué falta

Reseñas y favoritos, el bloque formal de SEO, y el formulario de contacto con seguimiento de contactos. La ficha premium de pago solo tiene sentido cuando haya datos reales de tráfico que enseñarle al dueño del negocio — por eso la tabla de estadísticas diarias existe desde el primer día, aunque la venta sea de una fase posterior. Si esa tabla nace cuando empieza la venta, el primer trimestre se vende sin nada que enseñar.

**Puedes ver el sitio en vivo:** [abhazservis.com](https://abhazservis.com/)
