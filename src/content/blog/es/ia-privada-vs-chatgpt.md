---
title: "IA privada o ChatGPT: cuándo tus datos no deben salir de la empresa"
description: "Las tres opciones reales para usar IA con datos sensibles, lo que tenemos montado en local y lo que hemos aprendido: dónde compensa una IA propia y dónde no."
pubDate: 2026-08-12
updatedDate: 2026-11-01
pillar: "IA"
relatedService: "IA-04"
translationSlug: "bezopasnost-dannyh-ii"
draft: false
---

Usar ChatGPT para el día a día está bien casi siempre. El problema aparece en un momento concreto: cuando lo que vas a pegar no es tuyo para pegarlo. La ficha de un paciente, el expediente de un cliente, las nóminas, un contrato con cláusula de confidencialidad. Ahí la pregunta no es si el modelo es bueno, sino si puedes mandar ese texto a un tercero.

## Las tres opciones reales

1. **Un asistente público**, gratis o con plan personal. Sirve para lo que ya es público o inventado: redactar un correo genérico, buscar ideas, reescribir un párrafo. No sirve para nada que identifique a una persona o a un cliente.
2. **Un plan de empresa o una API con contrato de tratamiento de datos.** El proveedor se compromete por contrato a no entrenar con tus datos. Es lo que usa la mayoría de las empresas, y está bien. Aun así, tus datos salen de la empresa en cada consulta.
3. **Un modelo en tu propia máquina.** Los datos no salen nunca. A cambio, compras el hardware y el mantenimiento es cosa tuya.

La mayoría de las empresas necesita la segunda. Este artículo va de cuándo hace falta la tercera, y de lo que hemos aprendido usándola.

## Lo que tenemos montado nosotros

En el mismo equipo del artículo sobre [qué hardware necesitas para IA](/es/blog/hardware-para-ia-local/), con una tarjeta AMD de 16 GB, tenemos IA local funcionando desde agosto de 2026:

- **Preguntas a nuestras propias notas.** Las notas de trabajo de todos los proyectos, con datos de clientes y de proyectos, están indexadas en el propio equipo: unos 1.640 fragmentos de texto. Un modelo pequeño los convierte en vectores para encontrar los relevantes, y un Qwen3 de 14B responde a partir de ellos. Ni las notas ni las preguntas salen de la máquina. Es el mismo caso que el de una empresa que quiere preguntarle a sus contratos o a su manual interno.
- **Un chat en el navegador.** Para usarlo sin terminal tenemos Open WebUI, una interfaz parecida a la de ChatGPT, pero conectada al modelo local.
- **Solo atiende al propio equipo.** El servidor de modelos y el chat están configurados para responder solo a peticiones de la misma máquina, no de la red. Una IA «privada» que puede consultar cualquiera conectado al wifi de la oficina no es tan privada.
- **Modelos más grandes que la tarjeta.** Un Qwen3 de 30B, de tipo «mezcla de expertos», no cabe en 16 GB. Va repartido entre la tarjeta y la memoria del sistema, y aun así escribe a entre 17 y 28 tokens por segundo (un token es, más o menos, una sílaba o una palabra corta). Sirve para tareas que no corren prisa.

## Lo que hemos aprendido

**1. El modelo local no es tan bueno como los grandes de pago.** Los modelos abiertos que caben en una tarjeta de 16 GB van por detrás de los mejores comerciales, y quien diga lo contrario te está vendiendo algo. Lo comprobamos al [entrenar un modelo pequeño](/es/blog/hardware-para-ia-local/) para escribir fichas de negocios: era rápido, pero se inventaba datos, y nos quedamos con uno más grande. Lo que ganas con una IA propia no es calidad. Ganas que los datos se quedan en casa, que el coste es fijo y que nada deja de funcionar porque un proveedor cambie sus precios o sus condiciones.

**2. Instalar el modelo es lo fácil.** Poner a funcionar un modelo es cosa de una tarde. El trabajo de verdad está alrededor: indexar tus documentos para que responda sobre tu empresa y no sobre el mundo en general, darle al equipo una interfaz que vaya a abrir, decidir quién puede ver qué y no dejarlo abierto a la red.

**3. Una tarjeta, un modelo cargado.** Si dos herramientas usan modelos distintos en la misma tarjeta, cada cambio obliga a descargar uno y cargar el otro, y eso son segundos de espera. Si varias personas lo van a usar a la vez, hay que tenerlo en cuenta antes de comprar.

## Cuándo compensa y cuándo no

**Compensa** en dos casos:
- Cuando **los datos no pueden salir**, por ley o por contrato: clínicas, despachos de abogados, asesorías, cualquier empresa con datos de clientes que no quiere depender de la política de privacidad de otro.
- Cuando **se hacen las mismas preguntas a los mismos documentos todos los días**: un equipo que busca en contratos, un soporte que responde con un manual, alguien que saca datos de facturas o formularios. El volumen es lo que justifica tener la máquina.

**No compensa** con un uso ocasional. Si son veinte preguntas a la semana, un plan de empresa con contrato de datos sale más barato que comprar y mantener un equipo para eso. Ten tu propia IA cuando la alternativa te costaría más o cuando los datos no pueden salir, no porque un servidor propio dé más sensación de seguridad.

## Cuánto cuesta

- **El hardware.** Lo que manda es la memoria de la tarjeta gráfica. La nuestra, de 16 GB, costó entre 650 y 680 € hace unos dos años. Con 16 GB van bien los modelos de 8B a 14B, que bastan para clasificar, resumir, extraer datos y buscar en documentos. Para modelos medianos, con más calidad, hacen falta 24 GB o más.
- **El montaje.** Es el servicio de [IA privada en tu servidor](/es/servicios/#ia); el precio actual está en la página de servicios. Si todavía no sabes qué comprar, la [auditoría de hardware](/es/servicios/#sys) te dice qué tarjeta y qué modelo encajan antes de gastar nada.

## Lo que no cambia

Sigue siendo IA: se equivoca, necesita a una persona revisando las decisiones importantes y su calidad depende del modelo que pongas. Una IA privada cambia dónde están los datos, no lo que la IA sabe hacer.

---

**¿Manejas datos que no deberían salir de tu empresa?** Cuéntame tu caso y te digo cuál de las tres opciones te encaja, aunque la respuesta sea que no necesitas una IA propia. [Mira el servicio aquí](/es/servicios/#ia).
