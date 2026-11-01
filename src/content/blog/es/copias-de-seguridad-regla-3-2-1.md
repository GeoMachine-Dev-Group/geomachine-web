---
title: "Copias de seguridad: la regla 3-2-1 y cómo la aplico yo"
description: "La regla 3-2-1 explicada con un caso real: las copias nocturnas de abhazservis.com, la copia cifrada fuera de casa y la prueba de restaurarlas."
pubDate: 2026-10-02
updatedDate: 2026-11-01
pillar: "MNT"
relatedService: "MNT-01"
translationSlug: "rezervnye-kopii-pravilo-3-2-1"
draft: false
---

Todo el mundo sabe que hay que hacer copias de seguridad. Lo difícil es saber si las que tienes te sacarían de un apuro. Aquí te explico la regla que uso para comprobarlo y te la enseño aplicada a un proyecto mío en producción, [abhazservis.com](https://abhazservis.com/), con lo que tenía y con lo que le faltaba hasta hace poco.

## La regla 3-2-1, en tres líneas

- **3 copias** de tus datos: el original y dos copias.
- **2 soportes distintos**: si falla un disco o una máquina, la otra copia sigue ahí.
- **1 copia fuera** del sitio donde están las demás: si hay un robo, un incendio o una inundación, se pierde todo lo que estaba en el mismo lugar.

## Qué hay que copiar en abhazservis

abhazservis es un directorio de negocios de Abjasia. Lo que no se puede volver a hacer si se pierde son dos cosas:

- **La base de datos**: las fichas de los negocios, con sus datos, horarios, categorías y localidades.
- **Las fotos** que se han subido a la web.

El código no entra aquí: está en git, en mi ordenador, en un repositorio de copia aparte y en GitHub. Si se pierde la máquina, el código se recupera en minutos. Los datos no.

## Cómo está montado

La web funciona en un miniordenador (un NUC) que tengo en casa. Las copias van así:

1. **Cada noche, a las 03:30 (hora UTC)**, el NUC vuelca la base de datos entera a un fichero y empaqueta las fotos. Guarda las de los últimos 14 días.
2. **Cada mañana, a las 09:00**, mi ordenador de trabajo se trae esas copias y guarda las de los últimos 60 días. Si a esa hora el ordenador está apagado, la copia se hace en cuanto lo enciendo.
3. **Justo después, mi ordenador cifra las copias y sube una a Cloudflare R2**, un almacenamiento en la nube fuera de casa. Allí guarda una por día durante 30 días y una por mes durante un año, y cada domingo comprueba que lo subido se puede leer.
4. **Si la copia más reciente tiene más de 36 horas**, el ordenador me avisa con una alerta en pantalla. Así me entero el mismo día de que la copia nocturna ha dejado de funcionar, y no el día que necesite restaurarla.
5. **Antes de un cambio delicado en los datos**, hago además una copia a mano. La última fue el 31 de octubre, antes de aplicar una tanda de correcciones a las fichas.

Son ficheros pequeños: la base de datos entera ocupa unos 180 KB y las fotos, unos 6 MB. Guardar dos meses de copias no cuesta nada, y en la nube los 275 MB de copias ocupan 16 MB, porque se comprimen y no se repite lo que ya estaba subido. Cabe de sobra en el plan gratuito.

## Sincronizar no es copiar

Este es el detalle que más importa, y el que más gente pasa por alto. Mi ordenador **no sincroniza** la carpeta del NUC: solo añade lo nuevo. Si alguien borrara las copias del NUC, o se vaciara su disco, mi copia no se vaciaría con él.

Con la sincronización pasa justo lo contrario. Si borras algo en un sitio, se borra en todos; si un virus cifra tus archivos, la versión cifrada sustituye a la buena en todas partes. Si usas un servicio que sincroniza, comprueba si guarda versiones anteriores y durante cuánto tiempo. Si no las guarda, no es una copia de seguridad.

## Una copia que no has probado no es una copia

Una copia que no se puede restaurar es solo un fichero. Así que la probamos: el 1 de noviembre de 2026 cogimos la copia nocturna del 31 de octubre y la restauramos en una base de datos vacía y temporal, en mi ordenador, sin tocar la de la web. No era la primera vez: la primera prueba fue el 14 de septiembre, con la primera copia que se hizo.

- Tardó **menos de un segundo**.
- Salieron las **25 tablas** y **311 negocios**, de los que **291 están publicados**. Es exactamente la cifra que enseña la web ese día.
- El paquete de fotos se abre y tiene sus 88 ficheros.

Si no se hubiera abierto, o si las cifras no coincidieran, nos habríamos enterado ese día, con tiempo para arreglarlo.

## Cómo queda con la regla 3-2-1

Desde el 1 de noviembre de 2026, el montaje cumple las tres:

- ✅ **3 copias**: la base de datos de la web, la copia de mi ordenador y la de la nube. La del NUC es una más, pero está en la misma máquina que la web: protege de un error o de un borrado, no de que falle el NUC.
- ✅ **2 soportes**: el NUC, mi ordenador y la nube son máquinas y discos distintos.
- ✅ **1 fuera de casa**: la de Cloudflare R2. Si un robo o un incendio se llevara los dos equipos, los datos seguirían ahí.

Hasta ese día faltaba la copia fuera de casa. La auditoría de seguridad del proyecto del 30 de octubre lo había señalado, y con ello otro punto flojo: las copias no iban cifradas. Ahora, la que sale de casa se cifra en mi ordenador antes de subirla, así que en la nube solo hay datos ilegibles sin la contraseña. Esa contraseña está guardada aparte, en un gestor de contraseñas: si se perdiera, la copia no serviría de nada.

Y como una copia sin probar no cuenta, ese mismo día restauramos la de la nube en una carpeta aparte: salió idéntica al original, fichero a fichero.

## Lista rápida para tu negocio

- [ ] Sé **qué datos** no podría volver a hacer si se pierden (clientes, pedidos, fotos, facturas).
- [ ] Hay una copia **automática**, que no depende de que alguien se acuerde.
- [ ] Hay al menos una copia en **otra máquina** y otra **fuera del local**.
- [ ] La copia **no se sincroniza**: si borro algo, la copia lo conserva.
- [ ] Algo me **avisa** si la copia deja de hacerse.
- [ ] He **restaurado** una copia alguna vez y he comprobado que los datos estaban.
- [ ] Las copias van **cifradas**, o están donde nadie más pueda llevárselas.

Si te falta alguna, ya sabes por dónde empezar.

---

**¿Tu web tiene copias de verdad, o solo crees que las tiene?** Las copias de seguridad y la vigilancia de caídas entran en el [mantenimiento](/es/servicios/#mnt). Escríbeme y te digo qué te falta.
