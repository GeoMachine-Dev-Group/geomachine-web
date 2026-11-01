---
title: "Qué hardware necesitas de verdad para IA en tu servidor"
description: "Mediciones en mi propio equipo: qué modelos de IA caben en una tarjeta de 16 GB, a qué velocidad responden y qué pasa cuando el modelo no cabe."
pubDate: 2026-08-12
updatedDate: 2026-11-01
pillar: "SYS"
relatedService: "SYS-03"
translationSlug: "kakoe-zhelezo-nuzhno-dlya-ii"
draft: false
---

Si quieres una IA que trabaje con tus datos sin enviarlos a nadie, la primera pregunta es qué máquina necesitas. Aquí no te doy una lista teórica: te cuento lo que he medido en el equipo donde yo mismo ejecuto modelos de IA en local.

## El equipo

- **Tarjeta gráfica:** AMD Radeon RX 7900 GRE, con **16 GB de memoria (VRAM)**.
- **Procesador:** AMD Ryzen 7 7800X3D, de 8 núcleos.
- **Memoria del sistema:** 30 GB.
- **Disco:** NVMe de 1,8 TB.
- **Software:** Ubuntu 24.04 y Ollama 0.32.14, que es el programa que carga los modelos y los sirve.

Es un equipo de sobremesa potente, no un servidor de centro de datos. Para una empresa pequeña es una referencia más útil que las tablas de los fabricantes.

## Lo que he medido

El 1 de noviembre de 2026 le pasé a cuatro modelos la misma pregunta corta. La velocidad es la de escritura de la respuesta, en tokens por segundo (un token equivale, más o menos, a una sílaba o a una palabra corta).

| Modelo | Memoria que ocupa | ¿Cabe en la tarjeta? | Velocidad | Tiempo de carga |
|---|---|---|---|---|
| Qwen3 8B | 5,3 GB | Sí, entero | 53 tokens/s | 6 s |
| Qwen2.5 14B | 9,1 GB | Sí, entero | 43 tokens/s | 8 s |
| gpt-oss 20B | 12,7 GB | Sí, entero | 80 tokens/s | 25 s |
| Qwen2.5 32B | 20,7 GB | **No**: 15,6 GB en la tarjeta y el resto en la memoria del sistema | **7,5 tokens/s** | 34 s |

Es una sola pasada con un texto corto, no un banco de pruebas de laboratorio: con otro texto los números cambian algo. Pero la diferencia entre la última fila y las otras tres no es de matiz.

## Lo que me enseñaron estos números

**1. La memoria de la tarjeta es lo que manda.** El modelo de 32B no es malo, pero no cabe en 16 GB. Ollama mete en la tarjeta lo que puede y el resto lo calcula el procesador con la memoria del sistema. El resultado es que escribe **casi seis veces más lento** que el de 14B. Además, lee tu pregunta a unos 34 tokens por segundo, cuando los modelos que caben enteros la leen a unos 200. Con un documento largo, eso se nota antes de que empiece a responder.

Por eso la primera pregunta no es qué tarjeta es más rápida, sino qué modelo necesitas y si cabe en la memoria de esa tarjeta.

**2. Más grande no siempre es más lento.** gpt-oss 20B es el más rápido de los cuatro aunque es el segundo más grande. Es un modelo de «mezcla de expertos»: en cada palabra solo activa una parte de sus parámetros. Si un modelo así cabe en tu tarjeta, puede darte más calidad sin perder velocidad.

**3. El procesador y la memoria del sistema importan menos de lo que parece.** Mientras el modelo cabe en la tarjeta, el procesador apenas trabaja. Solo pasa a ser importante cuando el modelo se desborda, y ahí ya vas lento hagas lo que hagas. Los 30 GB del sistema dan para desbordar un modelo de 32B, pero no lo convierten en una opción cómoda.

**4. El disco se llena antes de lo que crees.** Los modelos que tengo descargados para probar ocupan **100 GB**. Cada modelo mediano pesa entre 5 y 20 GB, y en cuanto pruebas versiones distintas se acumulan. Un disco rápido acorta la carga, pero lo que más se nota es su tamaño.

**5. Una tarjeta, un modelo cargado.** En mi equipo, dos herramientas comparten la misma tarjeta y el servicio está configurado para tener un solo modelo cargado a la vez. Si una usa un modelo y la otra otro distinto, cada cambio obliga a descargar uno y cargar el otro: de 6 a 34 segundos según el tamaño, en la tabla de arriba. Si en tu empresa varias personas o programas van a usar la IA a la vez, hay que decidirlo antes de comprar, no después.

**6. Con AMD funciona, pero hay que pelearse un poco.** Para que Ollama reconociera bien mi tarjeta tuve que indicarle la versión de la gráfica a mano, con una variable de configuración (`HSA_OVERRIDE_GFX_VERSION`). No es grave, pero es el tipo de detalle que convierte una instalación de una tarde en dos días si no lo conoces.

## Cómo decidir sin gastar de más

1. **Elige primero el modelo, no la máquina.** Para clasificar correos, resumir o buscar en tus documentos, un modelo de 8B a 14B suele bastar, y cabe holgado en 16 GB.
2. **Comprueba que el modelo cabe entero en la tarjeta**, con margen para el texto que le vas a pasar. Si no cabe, o subes de tarjeta o bajas de modelo: desbordarlo no es un término medio.
3. **No pagues un procesador de gama alta para esto.** El dinero rinde más en memoria de la tarjeta.
4. **Cuenta el uso simultáneo**: cuántas personas o programas lo usarán a la vez y con cuántos modelos distintos.

## Si quieres que lo mire por ti

Antes de que compres nada, reviso qué quieres hacer con la IA y te digo qué tarjeta y qué modelo encajan, con números como los de arriba. Es la [auditoría de hardware](/es/servicios/#sys): de 2 a 4 días.

---

**¿Estás valorando montar tu propia IA?** Cuéntame qué quieres que haga y te digo qué hardware necesitas de verdad. [Mira el servicio aquí](/es/servicios/#sys).
