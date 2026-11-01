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

- **Tarjeta gráfica:** AMD Radeon RX 7900 GRE, con **16 GB de memoria (VRAM)**. Me costó entre 650 y 680 € hace unos dos años, cuando el hardware todavía no se había disparado.
- **Procesador:** AMD Ryzen 7 7800X3D, de 8 núcleos.
- **Memoria del sistema:** 32 GB de DDR5, en dos módulos de 16 GB, que me costaron 170 € con descuento.
- **Disco:** NVMe de 1,8 TB.
- **Software:** Ubuntu 24.04 y Ollama 0.32.14, que es el programa que carga los modelos y los sirve.

Es un equipo de sobremesa potente, no un servidor de centro de datos. Para una empresa pequeña es una referencia más útil que las tablas de los fabricantes.

Lo uso para probar la calidad de cada modelo antes de recomendarlo y para generar contenido. Las cifras de abajo salen de ese uso, no de una ficha técnica.

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

**1. La memoria de la tarjeta es lo que manda.** El modelo de 32B no cabe en 16 GB y, aun así, funciona: Ollama lo reparte, mete en la tarjeta lo que puede (15,6 GB) y el resto lo calcula el procesador con la memoria del sistema. Así puedes usar un modelo más grande que tu tarjeta sin comprar otra. El precio es la velocidad: escribe **casi seis veces más lento** que el de 14B. Además, lee tu pregunta a unos 34 tokens por segundo, cuando los modelos que caben enteros la leen a unos 200. Con un documento largo, eso se nota antes de que empiece a responder.

Por eso la primera pregunta no es qué tarjeta es más rápida, sino qué modelo necesitas y si cabe en la memoria de esa tarjeta.

**2. Más grande no siempre es más lento.** gpt-oss 20B es el más rápido de los cuatro aunque es el segundo más grande. Es un modelo de «mezcla de expertos»: en cada palabra solo activa una parte de sus parámetros. Si un modelo así cabe en tu tarjeta, puede darte más calidad sin perder velocidad.

**3. El procesador y la memoria del sistema importan menos de lo que parece.** Mientras el modelo cabe en la tarjeta, el procesador apenas trabaja. Solo pasa a ser importante cuando el modelo se desborda, y ahí ya vas lento hagas lo que hagas. Los 32 GB del sistema son los que permiten repartir el modelo de 32B entre la tarjeta y la memoria: con menos, no arrancaría. Pero que arranque no lo convierte en una opción cómoda para el día a día.

**4. El disco se llena antes de lo que crees.** Los modelos que tengo descargados para probar ocupan **100 GB**. Cada modelo mediano pesa entre 5 y 20 GB, y en cuanto pruebas versiones distintas se acumulan. Un disco rápido acorta la carga, pero lo que más se nota es su tamaño.

**5. Una tarjeta, un modelo cargado.** En mi equipo, dos herramientas comparten la misma tarjeta y el servicio está configurado para tener un solo modelo cargado a la vez. Si una usa un modelo y la otra otro distinto, cada cambio obliga a descargar uno y cargar el otro: de 6 a 34 segundos según el tamaño, en la tabla de arriba. Si en tu empresa varias personas o programas van a usar la IA a la vez, hay que decidirlo antes de comprar, no después.

**6. Con AMD funciona, con algún ajuste.** En mi equipo, Ollama lleva una línea de configuración que le indica la versión de la gráfica (`HSA_OVERRIDE_GFX_VERSION=11.0.0`) para reconocer bien la tarjeta. No es grave, pero es el tipo de detalle que convierte una instalación de una tarde en dos días si no lo conoces.

## Entrenar un modelo pequeño: lo que nos salió

Otra forma de ganar velocidad es enseñar a un modelo pequeño a hacer una tarea concreta como la hace uno grande. Se llama destilación, y la probamos en septiembre de 2026 con un caso real: las descripciones de las fichas de [abhazservis.com](https://abhazservis.com/), el directorio de negocios que mantenemos.

- **El profesor:** un modelo Qwen3 de 30B, que ya escribía esas descripciones.
- **El alumno:** un Qwen3 de 14B.
- **Los datos:** 272 pares sacados del propio catálogo: los datos de un negocio y la descripción que se publicó.
- **Dónde lo entrenamos:** en una GPU NVIDIA T4 gratuita de Kaggle, con QLoRA, una técnica que ajusta solo una pequeña parte del modelo y cabe en tarjetas modestas. Para entrenar, una AMD de 16 GB va justa y sus herramientas dan más problemas, así que salió más práctico entrenar fuera y traer a casa el modelo ya cuantizado.

Ganó en velocidad y perdió donde importa. Con las mismas 9 fichas de hoteles:

| | Tiempo por ficha | Fichas correctas |
|---|---|---|
| Alumno (14B entrenado) | ~1 s | 4 de 9 |
| Profesor (30B) | ~3 s | 8 de 9 |

El alumno llegó a inventarse desayunos y wifi gratis en un hotel que no había declarado nada de eso. En la ficha pública de un negocio real, eso es peor que tardar dos segundos más, así que seguimos usando el de 30B.

La lección: para destilar hacen falta bastantes más ejemplos, entre 500 y 2.000 revisados a mano, y si los escribió el propio profesor, el alumno copia también sus fallos. Antes de entrenar nada, conviene comprobar si el modelo grande ya te vale.

## Cómo decidir sin gastar de más

1. **Elige primero el modelo, no la máquina.** Para clasificar correos, resumir o buscar en tus documentos, un modelo de 8B a 14B suele bastar, y cabe holgado en 16 GB.
2. **Comprueba que el modelo cabe entero en la tarjeta**, con margen para el texto que le vas a pasar. Si no cabe, puedes repartirlo entre la tarjeta y la memoria para probarlo o para tareas sin prisa; para el uso diario, sube de tarjeta o baja de modelo.
3. **No pagues un procesador de gama alta para esto.** El dinero rinde más en memoria de la tarjeta.
4. **Cuenta el uso simultáneo**: cuántas personas o programas lo usarán a la vez y con cuántos modelos distintos.

## Si quieres que lo mire por ti

Antes de que compres nada, reviso qué quieres hacer con la IA y te digo qué tarjeta y qué modelo encajan, con números como los de arriba. Es la [auditoría de hardware](/es/servicios/#sys): de 1 a 2 días.

---

**¿Estás valorando montar tu propia IA?** Cuéntame qué quieres que haga y te digo qué hardware necesitas de verdad. [Mira el servicio aquí](/es/servicios/#sys).
