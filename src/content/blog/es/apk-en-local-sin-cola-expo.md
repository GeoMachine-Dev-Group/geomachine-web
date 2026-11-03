---
title: "Dos horas en cola o tres minutos en casa: por qué compilo en local el APK de mi app de taxi"
description: "El APK del conductor llevaba casi dos horas en la cola gratuita de Expo sin empezar. En mi PC tardó 187 segundos. Qué hizo falta, cuánto ocupa y qué pasa con la firma."
pubDate: 2026-11-03
pillar: "APP"
relatedService: "PACK-04"
translationSlug: "sborka-apk-lokalno-bez-ocheredi-expo"
draft: false
---

La app del conductor de mi [app de taxi en Abjasia](/es/blog/cuanto-cuesta-app-como-uber/) está hecha con Expo y React Native, y hasta hoy el APK lo construía el servicio en la nube de Expo, EAS, en su plan gratuito. Hoy he dejado de hacerlo así. Te cuento por qué, con las horas y los segundos medidos, porque es una decisión que tarde o temprano le toca a cualquiera que publique una app Android con Expo.

## El problema, con la hora

El 3 de noviembre, a las 15:27 (hora UTC), encargué a EAS el APK de la versión 1.7.0 del conductor. A las 17:20 seguía en la cola, **sin haber empezado**. Más de una hora y cincuenta minutos esperando turno. Lo cancelé.

No es un fallo de Expo: el plan gratuito usa la cola de prioridad baja, y su propia página de precios avisa de que en horas punta la espera puede pasar de 90 minutos. Es lo que pagas por no pagar.

## Por qué en un piloto eso duele

En esta fase cada arreglo de la app del conductor es un APK nuevo. Ya me pasó con el GPS en segundo plano: entre finales de septiembre y el 4 de octubre saqué ocho versiones seguidas, de la 1.1.2 a la 1.1.9, porque cada prueba en un Xiaomi real destapaba otro problema. Con dos horas de cola por versión, eso no es un día de trabajo, es una semana.

## Las dos salidas

**Pagar a Expo.** Los precios que publica Expo, consultados el 3 de noviembre de 2026:

- **Free**: 0 $, cola de prioridad baja.
- **Starter**: 19 $ al mes más lo que consumas, cola de prioridad alta.
- **Production**: 199 $ al mes más lo que consumas, cola de prioridad alta.

La prioridad alta intenta empezar sin espera, pero no lo garantiza. Para un solo desarrollador, 19 $ al mes no es mucho dinero. Pero había otra opción.

**Compilar en mi propio PC.** La misma herramienta de Expo tiene un modo local (`eas build --local`) que hace el build entero en tu máquina, con la misma configuración que en la nube. Sin cola. A cambio, necesitas tener montado lo que necesita Android para compilar.

## Lo que hubo que montar

Aquí tuve suerte, y lo digo porque cambia mucho los números: en este PC ya estaban el JDK 17, el SDK de Android con el NDK, CMake y Gradle, de haber trabajado antes en la app con el emulador. Solo faltaban dos cosas:

- **La herramienta de Expo** (eas-cli): 10 segundos de instalación y 168 MB.
- **Las dependencias del proyecto**: 6 segundos y 650 MB.

Si partes de cero, súmale la instalación del SDK de Android, que en mi máquina ocupa unos 8 GB, y la primera descarga de Gradle. Eso no lo he medido en limpio, así que no te doy una cifra.

## Cuánto tarda

El primer build local completo: **187 segundos**, de los que dos minutos y medio son Gradle compilando. Salió un APK de 70,4 MB.

Frente a casi dos horas de cola sin empezar, no hay mucho que comparar. Un matiz honesto: la caché de Gradle de este PC ya estaba caliente de builds anteriores. En un ordenador sin esa caché, el primero tardará bastante más.

## La firma: lo que no se puede romper

Esto es lo importante de verdad. Android solo deja instalar una versión nueva encima de la anterior si las dos están firmadas con la misma clave. Si el APK local saliera con otra firma, los conductores tendrían que desinstalar la app para poner la nueva, y eso en la calle no pasa.

El modo local de Expo usa la misma clave que guarda EAS: la descarga para el build, firma el APK y la borra al terminar. Lo comprobé con dos herramientas distintas: la huella del certificado del APK local **coincide** con la de los APK hechos en la nube, y después del build no quedó ninguna copia de la clave en el disco. Que la clave pase unos minutos por mi PC es inevitable si quiero firmar en él; lo valoré y lo acepté.

Lo que **no** sale de la máquina: el código y el APK. No se sube ningún build a Expo. Lo que sí viaja es poco: la descarga de la clave y de la configuración del proyecto, la consulta del número de versión y la telemetría normal de la herramienta.

Un detalle que no esperaba: aunque el build sea local, el contador de versión que guarda Expo sube igual. Si haces un build de prueba y no lo publicas, ese número queda como un hueco. No pasa nada, pero conviene saberlo para no volverse loco buscando la versión 25.

Lo que me queda por hacer: comparar este APK permiso a permiso con uno hecho en la nube del mismo código. Por ahora coinciden el paquete, la versión, la firma y las arquitecturas; la comparación completa la haré en cuanto tenga un APK de la nube con el que compararlo.

## Cuándo sí pagaría

- **Si necesito builds de iOS.** Las apps de iPhone solo se compilan en un Mac. Mi app del pasajero es una web que se instala en el móvil, [justo para evitar esto](/es/blog/app-nativa-o-pwa/), así que de momento no me afecta.
- **Si trabajara en equipo**, para que todos construyan igual sin depender del ordenador de nadie.
- **Si no pudiera dejar el PC ocupado** unos minutos con cada build.

Para una sola persona sacando versiones de Android a menudo, el build local gana.

## Qué cambia

Ahora un arreglo en la app del conductor tarda en llegar a un APK lo que tarda el build: unos tres minutos, no lo que tarde la cola. Publicar sigue siendo a mano, con las mismas comprobaciones de antes (firma, versión, permisos), pero ya no espero a nadie.

---

**¿Estás montando una app de transporte o de reparto con conductores en Android?** Esto es parte de lo que hay detrás de una que funcione en la calle. [Mira qué incluye y cuánto cuesta](/es/servicios/app-taxi/).
