---
title: "Cuánto cuesta y cuánto tarda una app como Uber: lo que me ha llevado la mía"
seoTitle: "Cuánto cuesta una app como Uber: lo que me ha llevado la mía"
description: "Tiempo y coste reales de una app de taxi tipo Uber, con el caso de la que estoy montando en Abjasia: qué salió en tres semanas y qué lleva otras nueve."
pubDate: 2026-08-12
updatedDate: 2026-11-01
pillar: "APP"
relatedService: "PACK-04"
translationSlug: "skolko-stoit-prilozhenie-kak-uber"
draft: false
---

«Quiero una app como Uber, pero para [tu idea]» es de las frases que más oigo, y de las peor presupuestadas en internet. Así que en vez de darte una cifra sin contexto te cuento lo que me está costando a mí: desde el 9 de agosto de 2026 estoy construyendo una app de taxi para Abjasia, **Абхаз Сервис Такси**, que ya funciona en [taxi.abhazservis.com](https://taxi.abhazservis.com/).

Empiezo por lo incómodo, porque es lo que más te sirve: a 1 de noviembre la app está en producción, el pasajero puede pedir un coche y el conductor recibirlo, pero **todavía no hay ningún viaje completado por un pasajero real** y la app del conductor no se ha repartido. Lo técnico básico salió rápido. Llegar a la calle es otra cosa.

## Qué piezas tiene de verdad

«Una app como Uber» no es una app. En la mía son estas piezas, y cada una ha dado su trabajo:

- **El servidor** con la base de datos, que sabe dónde está cada conductor y en qué estado va cada viaje.
- **La asignación**: el pedido va pasando de conductor en conductor por cercanía, y si nadie lo coge sale en un tablón.
- **La app del conductor**, para Android, que tiene que mandar su posición aunque el móvil esté en el bolsillo con la pantalla apagada.
- **La del pasajero**, que no es una app de tienda sino una web que se instala en el móvil. Me ahorró publicar dos apps desde el principio.
- **El precio**: se calcula con la ruta real por las calles, no en línea recta.
- **La comisión**: cada viaje terminado suma lo que el conductor debe, y si pasa de un límite deja de recibir pedidos.
- **El panel de administración**: el mapa con los coches en vivo, los pedidos sin atender y los avisos.
- **Las copias de seguridad**, cifradas, cada noche.

## Cuánto tardó: tres semanas para lo técnico, nueve más para lo demás

El código actual empieza el 9 de agosto. Antes hubo un primer intento que se perdió entero en un cambio de sistema operativo: el código estaba en un repositorio al que no pude volver a entrar y no había otra copia. Empecé de cero, pero con el diseño ya pensado, y por eso el principio fue rápido. El 30 de agosto ya estaban el servidor, la asignación, el ciclo completo del viaje, la comisión con su bloqueo, las notificaciones y el panel de administración. **Tres semanas.** Por eso en mi catálogo el MVP de transporte pone de 3 a 5 semanas: es lo que tardé en tenerlo yo.

Lo que no cabe en esas tres semanas son las nueve siguientes, y es lo que casi ningún presupuesto cuenta:

**El GPS en segundo plano.** Un conductor no tiene la app abierta: la tiene detrás, con el móvil bloqueado. Android, y sobre todo los Xiaomi, que es lo que se usa allí, cierran lo que corre en segundo plano para ahorrar batería. Entre finales de septiembre y el 4 de octubre preparé ocho versiones de la app del conductor, de la 1.1.2 a la 1.1.9, para que la posición siguiera llegando. Con la 1.1.6, tras unos once minutos en segundo plano, el móvil dejó de mandar la posición y el sistema no dejaba volver a arrancar el servicio. Nada de esto se ve en un emulador: se ve con un Xiaomi real en la mano. Cada una de esas versiones es un APK nuevo, y por eso [acabé compilándolo en mi propio PC](/es/blog/apk-en-local-sin-cola-expo/) en vez de esperar la cola de la nube.

**Los fallos que solo salen con el móvil quieto.** Cuando el sistema relanzaba el servicio de ubicación sin pantalla, la app renovaba la sesión unas 11 veces por minuto. Arreglado aquello, apareció otro: cerrar sesión justo mientras se renovaba podía dejarla viva hasta 30 días. Cada arreglo de este tipo destapó otro debajo.

**Una versión que habría bloqueado a todos los conductores.** El 26 de octubre preparé una versión nueva que, por un número de versión mal puesto, se habría anunciado como antigua: la propia app habría obligado a cada conductor a «actualizar» a sí misma, sin salida. Estuvo enlazada en la página de descarga alrededor de un minuto hasta que lo vi y la quité. Como aún no había conductores con la app, no afectó a nadie; el día del lanzamiento no habría trabajado ninguno.

**El servidor que desapareció.** El 27 de octubre el servidor de producción dejó de responder, probablemente porque caducó la suscripción. Un día antes había hecho una copia completa, y con ella monté todo en un servidor nuevo, sin pérdida de datos conocida: el último viaje de la base era del 24 de octubre. Ese mismo día dejé puesta la copia diaria cifrada que debería haber existido desde el principio.

**Lo que no es código.** Un decreto del 26 de octubre cambia quién puede tener tarjeta de conductor en Abjasia y qué documentos hay que presentar de cada coche y cada conductor; el alta de conductores tiene que recogerlos. Y la marca lleva «Такси» mientras los textos legales dicen que la app es un intermediario, no un servicio de taxi: eso lo tiene que mirar un jurista antes de abrir.

**El precio de verdad.** La tarifa con la que funciona hoy es provisional. La definitiva sale de medir cómo cobran los taxis que ya trabajan allí: precio distinto en ciudad y en carretera, recargos de noche, precio fijo a la frontera y al aeropuerto. Eso es investigación de mercado, no programación, y también lleva semanas.

## Cuánto cuesta

Lo que yo vendo como **MVP de app de transporte** es lo de las tres primeras semanas: servidor a medida y base de datos, pedidos en tiempo real, asignación de conductores por cercanía, la comisión bien bloqueada y el panel de administración. Sus precios están en el [catálogo](/es/servicios/#paquetes), sin letra pequeña.

Lo de las nueve semanas siguientes no te lo puedo dar como precio cerrado, y desconfía de quien lo haga: depende del país, de los móviles de tus conductores, de lo que diga la ley y de cuánto tardes en tener a los primeros conductores en la calle. Lo que sí te puedo dar es la lista, para que no te pille por sorpresa.

## Lo que casi ningún presupuesto barato incluye

- **Dos pedidos al mismo conductor a la vez.** Si el sistema no lo bloquea, asigna el mismo coche dos veces. En la mía, cerrar un viaje bloquea al conductor mientras se hacen las cuentas.
- **La comisión que se cobra dos veces.** Con dinero de por medio, dos operaciones que se pisan generan números falsos. Las cuentas se hacen en la propia base de datos, dentro de la misma operación.
- **El GPS con el móvil bloqueado**, probado en los móviles que usan tus conductores.
- **Copias de seguridad que se han restaurado al menos una vez.** La mía se restauró de verdad, el día que hizo falta.

## Cómo lo abordo yo

No empiezo por «cuántas pantallas quieres». Empiezo por qué pasa en los casos límite: dos peticiones a la vez, un conductor que se queda sin cobertura a mitad de viaje, un móvil que mata la app. Eso es lo que decide si tu app aguanta el día que tiene éxito.

---

**¿Tienes una idea de app de transporte o de reservas en tiempo real?** Cuéntame el caso concreto y te digo qué entra en las tres primeras semanas y qué viene después. [Mira qué incluye y cuánto cuesta](/es/servicios/app-taxi/).
