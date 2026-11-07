---
title: "SEO en dos idiomas: errores que hacen que Google te penalice"
description: "Los errores más comunes en una web multiidioma, con los que cometimos en la nuestra, en cuatro idiomas, y cómo configurar bien el hreflang."
pubDate: 2026-08-12
updatedDate: 2026-11-01
pillar: "SEO"
relatedService: "SEO-04"
translationSlug: "seo-na-dvuh-yazykah-oshibki"
draft: false
---

Tener la web en varios idiomas debería sumar visitas, no restarlas. Pero es una de las áreas donde más fácil es equivocarse, y los errores no se ven: la web carga bien en todos los idiomas mientras Google no entiende qué página es la traducción de cuál.

Lo sabemos porque esta web está en cuatro idiomas (español, ruso, inglés y georgiano) y hemos cometido varios de estos errores. Te los contamos con lo que pasó y cómo lo arreglamos.

## Error 1: traducir las páginas, pero no decirle a Google que son la misma

Tener `tuweb.com/es/servicios` y `tuweb.com/en/services` está bien. Pero si no le dices a Google, con una etiqueta llamada **hreflang**, que son la misma página en dos idiomas, las trata como páginas independientes, y puede enseñarle la española a quien busca en inglés.

Hay dos detalles que se olvidan a menudo:
- **El hreflang tiene que ir en las dos direcciones.** Si la española apunta a la rusa pero la rusa no apunta a la española, Google no se fía.
- **Falta el `x-default`**, que le dice a Google qué versión enseñar a quien no encaja en ningún idioma. Nosotros no lo teníamos y lo añadimos en la revisión del 14 de septiembre de 2026.

En nuestro blog, cada artículo dice cuál es su traducción. El 1 de noviembre de 2026 encontramos siete parejas de artículos en español y ruso que eran el mismo tema y no estaban enlazadas entre sí: para Google eran artículos sueltos. Las que siguen publicadas ya están enlazadas en los dos sentidos.

## Error 2: publicar la traducción automática sin revisar

Una traducción automática que nadie revisa tiene dos problemas: suena rara a un hablante nativo, lo que espanta a los clientes, y a veces cambia el sentido de un precio o de una condición.

Este lo cometimos nosotros. El georgiano de esta web lo tradujo una IA y estuvo publicado sin que lo revisara nadie que hablara georgiano hasta el 31 de octubre de 2026, cuando se revisaron la interfaz y el catálogo de servicios. Desde entonces, cualquier texto nuevo en georgiano se marca en el código como pendiente hasta que alguien lo repasa, y algunas páginas secundarias siguen así.

Por la misma razón no abrimos el blog en georgiano: doce artículos largos traducidos por IA sin revisar habrían agrandado el problema en vez de resolverlo. Un idioma con pocas páginas bien escritas es mejor que uno con muchas páginas que suenan a máquina.

Si dudas entre poner un botón de traducción automática o hacer versiones reales de cada página, lo comparamos en [cómo traducir una página web](/es/blog/como-traducir-una-pagina-web/).

## Error 3: redirigir según el país del visitante

Detectar desde dónde entra alguien y mandarlo automáticamente a su idioma parece buena idea, pero confunde a Google, que rastrea desde lugares que no coinciden con tus clientes, y molesta a quien quiere ver otra versión. Nuestra portada lleva siempre a la versión en español, y en cada página hay un selector para cambiar de idioma. Que elija la persona.

## Error 4: que las versiones no digan lo mismo

Si en español tienes cinco servicios y en ruso solo tres porque olvidaste traducir dos, Google acaba notando la diferencia y puede tratar la versión incompleta como de menor calidad.

Esto puede pasar sin que nadie lo vea. Hasta el 1 de noviembre de 2026, el menú del blog en inglés salía con los tres enlaces vacíos: faltaban esos textos en la traducción inglesa y la página cargaba igual, sin ningún error. Lo descubrimos porque Search Console marcó la ruta de navegación de un artículo como no válida. Si tienes varios idiomas, revisa cada versión como lo haría un visitante, no solo la tuya.

Y no basta con traducir: hay que adaptar. En nuestra web, cada idioma enseña los precios en la moneda de quien lee (euros, rublos o lari) y escribe los números como se escriben en su idioma.

## Error 5: un sitemap que no dice qué es traducción de qué

El sitemap es el fichero que le dice a Google qué páginas existen. En una web multiidioma conviene que diga también qué página es la traducción de cuál. Nuestras direcciones cambian de un idioma a otro (`/es/servicios/`, `/ru/uslugi/`, `/en/services/`), y la herramienta que genera el sitemap no sabía emparejarlas sola, así que añadimos los hreflang al sitemap a mano.

## Cómo comprobarlo en tu web

Puedes hacerlo tú, gratis:

1. Abre el código fuente de una página (clic derecho → «Ver código fuente») y busca `hreflang`. ¿Aparece cada idioma? ¿Hay un `x-default`? Abre la otra versión y comprueba que apunta de vuelta.
2. Compara el número de páginas y de servicios en cada idioma. ¿Coinciden?
3. Recorre la web en cada idioma como lo haría un cliente: menú, botones, formulario. ¿Falta algún texto?
4. Pide a alguien que hable el idioma que lea un párrafo en voz alta. ¿Suena a persona o a máquina?

Si falla alguno, ya tienes trabajo concreto pendiente.

## Cómo lo hago yo

Configuro el hreflang desde el primer día de una web multiidioma, no como un parche posterior, y compruebo que cada idioma tenga el mismo contenido y que nadie publique una traducción sin revisar. Lo reviso dentro de [cualquier proyecto multiidioma](/es/servicios/web-multiidioma/), con una lista de comprobación antes de dar el trabajo por terminado.

---

**¿Tu web ya está en varios idiomas pero sospechas que algo no está bien configurado?** Dime cuáles y reviso los puntos técnicos de verdad. [Mira qué hago y cuánto cuesta](/es/servicios/web-multiidioma/).
