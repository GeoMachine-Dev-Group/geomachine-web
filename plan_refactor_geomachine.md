# Plan de refactor — Catálogo GeoMachine.es

Revisión técnica de 5 mejoras propuestas para `Catalog.astro`, `Base.astro`, `global.css` y `data/catalog.ts`, con opinión sin filtros, deuda técnica detectada, y código listo para implementar. Estructurado por prioridad de ejecución, no por el orden en que se propusieron.

**Contexto real del proyecto** (para que el resto del documento tenga sentido):
- Astro 4.16, `output: static` (confirmado en el build), **sin adapter**, desplegado a Netlify con `netlify deploy --prod --dir=dist`. Cero servidor, cero runtime Node en producción.
- No existe ningún componente `Card` — las tarjetas de servicio y las de paquete están **copiadas y pegadas** dentro de `Catalog.astro`, con markup casi idéntico.
- El panel de controles (`.panel`) ya es `position: sticky; top: 0; z-index: 20`.
- El efecto tilt ya es 100% CSS (`data-cardstyle="tilt"` en `<html>`), con un único listener JS global en `Base.astro` que solo calcula `--rx`/`--ry`.
- La sección de cierre ya tiene dos CTA: `mailto:hola@geomachine.es` y `https://t.me/geomachine`.
- `Base.astro` ya no es solo del catálogo — desde hace poco también envuelve el blog (`schema="none"`, props opcionales). Cualquier cosa que se añada ahí sale en **todas** las páginas, catálogo y blog.

---

## Veredicto rápido de las 5 propuestas

| # | Propuesta | Veredicto | Por qué |
|---|---|---|---|
| 1 | Destacar paquete con props booleanas | **Sí, pero no como está planteado** | No hay componente que reciba props — hay que extraerlo primero. Sin eso, "prop booleana" es una `class` condicional más en un `.map()`, lo cual está bien pero no es lo que describís |
| 2 | Desactivar tilt en táctil | **Diagnóstico incompleto** | El problema real no es el tilt — es que *ambos* estilos de tarjeta reaccionan a `:hover`, y en táctil eso se dispara con el primer toque. Arreglar solo el tilt deja el bug en el estilo por defecto |
| 3 | Sticky CTA tras el Hero | **Sí, directo** | Encaja con el patrón que ya usáis (`IntersectionObserver` para `.reveal`). Único cuidado real: no chocar con el panel sticky que ya existe |
| 4 | Formulario nativo → webhook Telegram | **Sí, pero el fetch no puede ir directo al Bot API desde el navegador** | Expondría el token del bot en el código cliente — cualquiera con DevTools podría leerlo, mandar mensajes o hacer spam en vuestro chat. Hace falta un proxy (Netlify Function) |
| 5 | Mejorar copy de premium | **Sí, y es el cambio de menor riesgo de los cinco** | Cero código nuevo, solo contenido en `catalog.ts`. `APP-02` ya menciona Node/PostgreSQL/Redis en `spec` — el hueco real está en `human` (el texto que de verdad lee el cliente al hacer hover) |

---

## Prioridad 0 — Deuda técnica a resolver primero

No son parte de las 5 mejoras, pero **#1 y #4 salen mal si no se hace esto antes**.

### 0.1 — Las tarjetas están duplicadas, no componentizadas

En `Catalog.astro`, el bloque `<article class="card reveal">...</article>` aparece **dos veces**, casi idéntico: una vez para `line.items.map()` (líneas 191-212) y otra para `bundles.map()` (líneas 235-253). Mismo header, mismo nombre, mismo precio, mismos detalles — la única diferencia real es que una muestra `item.spec` (párrafo) y la otra `b.includes` (lista).

Esto ya es deuda hoy (cualquier cambio de estilo de tarjeta hay que hacerlo dos veces y confiar en que no diverjan), y es exactamente lo que hace la propuesta #1 (props booleanas) imposible de hacer bien: no hay a qué componente pasarle la prop.

**Fix — extraer `ServiceCard.astro`:**

```astro
---
// src/components/ServiceCard.astro
interface Props {
  code: string;
  name: string;
  time?: string;
  /** Párrafo (servicios) o lista de bullets (paquetes) — un solo componente cubre los dos casos. */
  description: string | string[];
  humanLabel: string;
  human: string;
  priceAttrs: Record<string, string>;
  initialPrice: string;
  initialRecurring?: string;
  recurringLabel?: string;
  featured?: boolean;
  featuredLabel?: string;
}
const {
  code, name, time, description, humanLabel, human,
  priceAttrs, initialPrice, initialRecurring, recurringLabel,
  featured = false, featuredLabel,
} = Astro.props;
---

<article class:list={['card', 'reveal', { 'card--featured': featured }]} tabindex="0">
  <div class="card__inner">
    {featured && featuredLabel && <span class="card__badge">{featuredLabel}</span>}
    <div class="card__header">
      <span class="card__code">{code}</span>
      {time && <span class="card__time">{time}</span>}
    </div>
    <h3 class="card__name">{name}</h3>

    {Array.isArray(description) ? (
      <ul class="card__list">
        {description.map((line) => <li>{line}</li>)}
      </ul>
    ) : (
      <p class="card__spec">{description}</p>
    )}

    <div class="card__price" {...priceAttrs}>
      <span class="price-value">{initialPrice}</span>
      {initialRecurring && (
        <small class="card__recurring">
          {recurringLabel} <span class="price-value">{initialRecurring}</span>
        </small>
      )}
    </div>
    <div class="card__details">
      <p class="card__human-label">{humanLabel}</p>
      <p class="card__human">{human}</p>
    </div>
  </div>
</article>
```

Nota: `class:list` es la directiva nativa de Astro para clases condicionales — evita template strings manuales y es la forma idiomática de hacer justo lo que pedía la propuesta #1 ("prop booleana que destaca la tarjeta").

**Uso en `Catalog.astro`** (sustituye los dos bloques `<article>` duplicados):

```astro
---
import ServiceCard from './ServiceCard.astro';
---

<!-- servicios de cada línea -->
{line.items.map((item) => (
  <ServiceCard
    code={item.code}
    name={item.name[lang]}
    time={item.time?.[lang]}
    description={item.spec[lang]}
    humanLabel={t.colService}
    human={item.human[lang]}
    priceAttrs={priceData(item)}
    initialPrice={initial(item)}
    initialRecurring={item.launchRecurring ? initialRecurring(item) : undefined}
    recurringLabel={t.thenMonthly}
  />
))}

<!-- paquetes -->
{bundles.map((b) => (
  <ServiceCard
    code={b.code}
    name={b.name[lang]}
    time={b.time?.[lang]}
    description={b.includes[lang]}
    humanLabel={t.bundleIncludes}
    human={b.human[lang]}
    priceAttrs={bundlePriceData(b)}
    initialPrice={money(b[DEFAULT_TIER][DEFAULT_CURRENCY], DEFAULT_CURRENCY, 'once')}
    featured={b.code === 'PACK-02'}
    featuredLabel={t.featuredBadge}
  />
))}
```

`featured={b.code === 'PACK-02'}` — deliberadamente **no** he añadido un campo `featured` a `Bundle` en `catalog.ts`. Es una decisión de marketing puntual, no un dato del catálogo; meterlo en el schema es infra para algo que hoy es una sola tarjeta. Si en el futuro hay más de un paquete destacado a la vez, se revisa entonces.

CSS nuevo en `global.css` (añadir, no toca nada existente):

```css
/* --- Tarjeta destacada (paquete estrella) ----------------------------------- */
.card--featured .card__inner { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent-soft); }
.card__badge {
  position: absolute; top: -.65rem; left: 1.4rem;
  background: var(--accent); color: var(--paper);
  font-family: var(--data); font-size: .62rem; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase;
  padding: .3rem .7rem; border-radius: 999px;
}
```

---

## Prioridad 1 — Quick wins (bajo riesgo, alto impacto, poco código)

### 1.1 — Mejorar copy de premium (propuesta #5)

Es la mejora de menor riesgo de las cinco: cero JS, cero componentes, solo texto en `catalog.ts`. Dos matices que vale la pena señalar antes de tocarlo:

- **`APP-02` (Arquitectura Backend) ya menciona el stack** en `spec`: *"Node.js, PostgreSQL, Redis, ecosistema escalable"*. Lo que falta no es el stack — es que `human` (el texto que se lee al hacer hover, el que de verdad vende) es genérico: *"Consigues un backend capaz de aguantar miles de usuarios a la vez"*. Ahí es donde debería ir el detalle técnico y, sobre todo, prueba social: ya tenéis un proyecto real en desarrollo con exactamente ese stack (el MVP de transporte que aparece en el showcase del Hero) — citarlo aquí es gratis y añade credibilidad que hoy no estáis usando.

  ```ts
  // src/data/catalog.ts — APP-02, campo human.es (aplicar el mismo criterio a ru/en/ka)
  human: {
    es: 'Consigues un backend en Node.js + PostgreSQL + Redis, con transacciones bloqueadas correctamente y sin locks sobre las tablas calientes — el mismo patrón que uso ahora mismo en un MVP de transporte en producción, no una arquitectura de manual.',
    // ...
  },
  ```

- **`APP-03` (Bolsa de horas)**: la condición ya está en `spec` ("mínimo diez horas, sin caducidad"), pero en una sola línea plana. Si el objetivo es "aclarar las condiciones", el sitio donde de verdad hace falta más detalle es `human` — ahí es donde se puede explicar *cómo se consumen* las horas (¿se descuentan por tarea completa o por tiempo real? ¿hay un mínimo por petición?), que es la pregunta que un cliente indeciso se hace antes de comprar una bolsa de horas y hoy no está respondida en ningún sitio del catálogo.

No hay código que mostrar aquí más allá del ejemplo — es trabajo de contenido en las 4 columnas de idioma (`es`/`ru`/`en`/`ka`) de `human` en `APP-02` y `APP-03`. Bloqueante real: el georgiano (`ka`) sigue con la advertencia pendiente de revisión nativa que ya tenéis anotada en la cabecera de `catalog.ts` — no escribáis condiciones comerciales nuevas en `ka` sin que alguien nativo las revise antes de publicar.

### 1.2 — El problema de hover en táctil (propuesta #2, redefinida)

Tal y como está planteada la propuesta ("desactivar el tilt en táctil"), soluciona la mitad del problema. El bug real es más amplio: **el 100% de la interacción de la tarjeta — en los dos estilos, no solo tilt — depende de `:hover`**, y en pantallas táctiles `:hover` se dispara con el primer toque (`.card:hover .card__price { opacity: .05 }`, `.card:hover .card__details { transform: translateY(0) }`, el desplazamiento de la capa apilada). Es decir: en el estilo por defecto ("stack", que es el que ve el 100% de las visitas que no han tocado el panel de ajustes) un usuario en móvil ya sufre exactamente el problema que la propuesta dice que solo pasa con el tilt.

La forma correcta y sin JS de resolver esto es `@media (hover: hover) and (pointer: fine)` — la media feature diseñada específicamente para "el dispositivo puede hacer hover de verdad", en vez de intentar adivinarlo por JS (heurísticas de `touchstart` o sniffing de user-agent, ambas frágiles). Importante: hay que separar `:hover` de `:focus-within` — lo segundo tiene que seguir funcionando siempre, es lo que hace accesible la tarjeta por teclado.

```css
/* global.css — sustituye las reglas .card:hover actuales por esta separación */

/* :focus-within sigue activo en todos los dispositivos — accesibilidad por teclado */
.card:focus-within .card__price { opacity: .05; }
.card:focus-within .card__details { transform: translateY(0); }

/* :hover solo donde el dispositivo puede hacer hover de verdad */
@media (hover: hover) and (pointer: fine) {
  .card:hover .card__price { opacity: .05; }
  .card:hover .card__details { transform: translateY(0); }
  .card:hover:before { transform: translate(8px, 8px); border-color: var(--rule-soft); }
  .card:hover .card__inner { transform: translate(-4px, -4px); border-color: var(--accent); }
}

/* mismo criterio para las reglas de tilt */
@media (hover: hover) and (pointer: fine) {
  html[data-cardstyle='tilt'] .card:hover .card__inner { border-color: var(--accent); }
  html[data-cardstyle='tilt'] .card:hover .card__price { opacity: 1; }
  html[data-cardstyle='tilt'] .card:hover .card__inner:after { opacity: 1; }
}
```

Y en `Base.astro`, el listener global de `mousemove` que calcula el tilt debería ni registrarse en dispositivos táctiles — hoy se añade siempre y hace un check interno (`if (root.dataset.cardstyle !== 'tilt') return`) en cada movimiento de ratón de toda la página, incluidas las visitas donde el tilt nunca se va a activar:

```ts
// Base.astro — sustituye el `if (!reduceMotion) { document.addEventListener('mousemove', ...) }`
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!reduceMotion && supportsHover) {
  document.addEventListener('mousemove', (e) => {
    if (root.dataset.cardstyle !== 'tilt') return;
    // ... resto igual
  });
  document.addEventListener('mouseout', (e) => {
    // ... resto igual
  });
}
```

Esto también resuelve, gratis, el punto de rendimiento de la sección de deuda técnica más abajo.

### 1.3 — Microcopy de confianza junto al CTA (bonus, no pedido)

Cero código, cero riesgo. Ya tenéis el dato — `MNT-03` promete "respuesta en 24 horas" — pero está enterrado en una tarjeta de mantenimiento que casi nadie va a leer antes de decidir si escribe. Poner una variante de esa promesa justo debajo del botón de CTA principal (`.actions`) es una palanca de conversión clásica (reduce la incertidumbre justo en el momento de la decisión) y no toca nada de arquitectura:

```astro
<!-- Catalog.astro, dentro de .actions, después de los dos <a class="btn"> -->
<p class="actions__note">{t.ctaResponseTime}</p>
```
```css
.actions__note { flex-basis: 100%; margin-top: .35rem; font-size: .78rem; color: var(--ink-soft); }
```
```ts
// ui.ts, en las 4 secciones de idioma
ctaResponseTime: 'Respondo en menos de 24 horas.',
```

---

## Prioridad 2 — Sticky CTA (propuesta #3)

Encaja bien con el proyecto porque reutiliza un patrón que ya existe (`IntersectionObserver` para las animaciones `.reveal` en `Catalog.astro`) en vez de traer uno nuevo. Dos cuidados reales que la propuesta tal cual no menciona:

1. **El panel de controles ya es sticky** (`z-index: 20`). El FAB necesita un `z-index` por encima (uso 30) y, en el layout de dos líneas que toma el panel en móvil, hay que verificar que no se solapen visualmente — con `position: fixed; bottom` en vez de `top` no debería pasar, pero es lo primero que hay que mirar en el dispositivo real.
2. **CTA duplicado al final de la página**: si el FAB sigue visible cuando el usuario ya llegó a la sección `.close` (que tiene su propio botón "Pedir presupuesto" grande), son dos CTA idénticos compitiendo en la misma pantalla — ruido, no ayuda. Merece la pena ocultar el FAB cuando `.close` entra en viewport.

**Implementación — todo dentro de `Catalog.astro`, no en `Base.astro`.** Esto es deliberado: `Base.astro` ya es compartido con el blog, y un FAB de "Pedir presupuesto" no tiene sentido en un artículo — el blog ya resuelve su propio CTA con el enlace "servicio relacionado". Meterlo en el layout general acoplaría el catálogo al blog para nada.

```astro
<!-- Catalog.astro, justo antes de </section> de .close, o al final del fichero -->
<a href="mailto:hola@geomachine.es" class="fab" data-fab hidden>
  {t.ctaButton}
</a>
```

```css
/* global.css */
.fab {
  position: fixed; bottom: 1.25rem; right: 1.25rem; z-index: 30;
  background: var(--accent); color: var(--paper); text-decoration: none;
  font-family: var(--data); font-size: .76rem; font-weight: 600;
  letter-spacing: .1em; text-transform: uppercase;
  padding: .85rem 1.4rem; border-radius: 999px;
  box-shadow: 0 10px 28px -6px #00000070;
  opacity: 0; transform: translateY(12px); pointer-events: none;
  transition: opacity .3s ease, transform .3s ease;
}
.fab.is-visible { opacity: 1; transform: none; pointer-events: auto; }
@media (max-width: 480px) {
  .fab { left: 1.25rem; right: 1.25rem; text-align: center; }
}
@media (prefers-reduced-motion: reduce) { .fab { transition: none; } }
```

```ts
// Catalog.astro, dentro del <script> que ya existe al final del fichero
const hero = document.querySelector('.hero');
const closeSection = document.querySelector('.close');
const fab = document.querySelector<HTMLElement>('[data-fab]');

if (hero && closeSection && fab) {
  fab.hidden = false;
  let pastHero = false;
  let inClose = false;
  const sync = () => { fab.classList.toggle('is-visible', pastHero && !inClose); };

  new IntersectionObserver(([entry]) => { pastHero = !entry.isIntersecting; sync(); },
    { rootMargin: '-10% 0px 0px 0px' }).observe(hero);

  new IntersectionObserver(([entry]) => { inClose = entry.isIntersecting; sync(); },
    { threshold: 0.15 }).observe(closeSection);
}
```

`hidden` en el HTML inicial evita que el FAB parpadee visible antes de que el JS decida su estado (no hay salto de layout: `position: fixed` lo saca del flujo).

---

## Prioridad 3 — Formulario nativo → webhook (propuesta #4)

Esta es la que de verdad cambia la arquitectura, y donde tengo que ser más tajante: **la propuesta tal cual está descrita ("un fetch... hacia Telegram") no se puede hacer de forma segura solo en el cliente.**

### Por qué no

La API de bots de Telegram (`https://api.telegram.org/bot<TOKEN>/sendMessage`) necesita el token del bot en cada llamada. Si ese `fetch` sale directo desde el navegador, el token queda visible en el JS descargado y en la pestaña Network de cualquier visitante — con eso, cualquiera puede mandar mensajes arbitrarios a vuestro chat, o simplemente reventarlo a base de spam. No es una vulnerabilidad teórica: es la forma número uno en que se filtran tokens de bots de Telegram.

### La solución que no rompe el "sitio estático sin servidor"

El proyecto no tiene adapter de Astro (`output: static`) y así debe seguir — no hace falta SSR ni `@astrojs/netlify` para esto. La pieza que falta es una **Netlify Function** aislada, que vive fuera del build de Astro (en `netlify/functions/`, no en `src/`) y guarda el token como variable de entorno del lado del servidor. Netlify ya la detecta y despliega automáticamente junto al sitio estático — cero cambios en `astro.config.mjs`.

```js
// netlify/functions/contact.cjs
// .cjs explícito: fuerza CommonJS pase lo que pase con "type": "module" del package.json raíz.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'invalid_json' }) };
  }

  const { name, contact, service, budget, message, website, startedAt } = data;

  // Honeypot: campo oculto por CSS que un humano nunca rellena. Si viene con
  // contenido, es un bot — se responde 200 para no delatar el filtro.
  if (website) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  // Time-trap: un envío en menos de 3s desde que se pintó el formulario es,
  // casi siempre, un bot rellenando el form por script, no una persona leyendo.
  if (typeof startedAt === 'number' && Date.now() - startedAt < 3000) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  if (!name || !contact || !message) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'missing_fields' }) };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'server_misconfigured' }) };
  }

  const text = [
    '📩 Nuevo lead — geomachine.es',
    `Nombre: ${name}`,
    `Contacto: ${contact}`,
    service ? `Servicio: ${service}` : null,
    budget ? `Presupuesto: ${budget}` : null,
    `Mensaje: ${message}`,
  ].filter(Boolean).join('\n');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    return { statusCode: 502, body: JSON.stringify({ ok: false, error: 'telegram_failed' }) };
  }
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
```

Variables de entorno (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) van en Netlify → Site configuration → Environment variables, nunca en el repo — mismo criterio que ya usáis para el `.env.deploy` del VPS.

### El formulario

Reemplaza el `<a href="mailto:...">` principal; **mantiene el enlace de Telegram como alternativa** — no hay motivo para quitarlo, sigue siendo la opción de quien prefiere escribir directo sin rellenar nada:

```astro
<!-- Catalog.astro, dentro de la sección .close, sustituyendo el <a class="btn btn--solid"> de mailto -->
<form
  id="contact-form"
  class="contact-form"
  data-msg-sending={t.formSending}
  data-msg-success={t.formSuccess}
  data-msg-error={t.formError}
  novalidate
>
  <!-- honeypot: oculto por CSS, no por `hidden` (algunos lectores de spam ignoran hidden) -->
  <input type="text" name="website" class="visually-hidden" tabindex="-1" autocomplete="off" />
  <input type="hidden" name="startedAt" />

  <label class="contact-form__field">
    <span class="control__label">{t.formName}</span>
    <input type="text" name="name" required />
  </label>
  <label class="contact-form__field">
    <span class="control__label">{t.formContact}</span>
    <input type="text" name="contact" required placeholder="Email o @usuario de Telegram" />
  </label>
  <label class="contact-form__field">
    <span class="control__label">{t.formMessage}</span>
    <textarea name="message" rows="3" required></textarea>
  </label>

  <div class="actions">
    <button type="submit" class="btn btn--solid">{t.ctaButton}</button>
    <a class="btn btn--ghost" href="https://t.me/geomachine">{t.ctaSecondary}</a>
  </div>
  <p class="contact-form__status" role="status" aria-live="polite" hidden></p>
</form>
```

```ts
// Catalog.astro, dentro del <script> existente al final del fichero
const form = document.getElementById('contact-form') as HTMLFormElement | null;
if (form) {
  // Los textos localizados viajan por data-attrs: este <script> corre en el
  // navegador, sin acceso al objeto `t` del frontmatter de Astro.
  const startedAtInput = form.elements.namedItem('startedAt') as HTMLInputElement;
  startedAtInput.value = String(Date.now());

  const status = form.querySelector<HTMLElement>('.contact-form__status')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    status.hidden = false;
    status.textContent = form.dataset.msgSending ?? '';

    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const res = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('bad status');
      form.querySelectorAll('input, textarea, button').forEach((el) => ((el as HTMLElement).hidden = true));
      status.textContent = form.dataset.msgSuccess ?? '';
    } catch {
      status.textContent = form.dataset.msgError ?? '';
      submitBtn.disabled = false;
    }
  });
}
```

CSS mínimo (reutiliza `.control__label` y `.btn` ya existentes):

```css
.contact-form { display: flex; flex-direction: column; gap: 1rem; max-width: 40ch; }
.contact-form__field { display: flex; flex-direction: column; gap: .4rem; }
.contact-form input[type="text"], .contact-form textarea {
  background: var(--panel-2); border: 1px solid var(--rule); color: var(--ink);
  font-family: var(--body); font-size: .92rem; padding: .65rem .8rem; border-radius: 6px;
  resize: vertical;
}
.contact-form input:focus-visible, .contact-form textarea:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
.contact-form__status { font-size: .85rem; color: var(--accent); margin-top: .5rem; }
```

Claves nuevas en `ui.ts` (`formName`, `formContact`, `formMessage`, `formSending`, `formSuccess`, `formError`) — a diferencia de las del blog, estas van en **las 4 secciones de idioma** (`es`/`ru`/`en`/`ka`), porque el catálogo, a diferencia del blog, sí vive en los 4 idiomas.

### Verificación antes de dar esto por terminado

- `netlify deploy --prod --dir=dist` recoge `netlify/functions/` automáticamente junto al `dist/` publicado — confirmarlo con un `curl -X POST` real a `https://geomachine.es/.netlify/functions/contact` tras el primer deploy, no asumirlo.
- Probar el honeypot y el time-trap enviando el form normal (debe llegar a Telegram) y luego simulando un bot (rellenar `website` a mano vía DevTools — debe responder 200 pero **no** llegar mensaje).
- Confirmar que las variables de entorno están puestas en Netlify antes del primer deploy — si faltan, la función devuelve 500 explícito (`server_misconfigured`), no un fallo silencioso.

### Alternativa más ligera, si en algún momento no querés mantener ni una función

Servicios como Formspree o Web3Forms hacen exactamente esto (formulario → tu email/webhook, con anti-spam ya resuelto) sin escribir backend propio. Lo descarto como recomendación principal porque el pedido explícito era Telegram y porque ya tenéis el hábito de auto-alojar todo lo que podéis (Plausible, el propio sitio) — pero es la opción correcta si en el futuro preferís no mantener ni siquiera una función de 60 líneas.

---

## Otras mejoras sugeridas (no pedidas, bajo impacto en código)

- **`priceData()` y `bundlePriceData()` en `Catalog.astro` son casi la misma función** (mismo bucle tarifa×moneda, misma construcción de `data-*`). No es urgente, pero si vais a tocar ese fichero para meter `ServiceCard`, es un buen momento para fusionarlas en una sola función parametrizada por `unit`.
- **El `mailto:` actual no lleva `subject`/`body` prefijados.** Si el formulario (Prioridad 3) tarda en implementarse, un `mailto:hola@geomachine.es?subject=...` mientras tanto es un cambio de una línea y reduce fricción ya — pero es un parche de transición, no lo dejéis como solución definitiva una vez esté el form.

## Lo que NO haría

- **No** metería el Sticky CTA en `Base.astro` — ver Prioridad 2, es una decisión de arquitectura, no de gusto.
- **No** añadiría `@astrojs/netlify` ni cambiaría `output` a `hybrid`/`server` solo para el formulario — es la razón número uno por la que un sitio 100% estático termina arrastrando complejidad de servidor que no necesita para nada más.
- **No** usaría reCAPTCHA para el anti-spam del formulario — pesa, depende de un script externo de Google, y contradice la posición de "hiper-rápido, sin fricciones" del propio proyecto. El honeypot + time-trap cubre el 95% de los bots automáticos con coste cero de UX.
- **No** tocaría el schema de `Bundle` en `catalog.ts` para añadir un campo `featured` — es marketing puntual de una tarjeta, no un dato del catálogo.

---

## Orden de ejecución recomendado

1. **Prioridad 0** (extraer `ServiceCard.astro`) — desbloquea el resto, riesgo bajo, se puede verificar visualmente en minutos comparando antes/después.
2. **Prioridad 1** (fix de hover táctil + copy premium + microcopy CTA) — el fix de hover es el único de los tres con código real; los otros dos son contenido.
3. **Prioridad 2** (Sticky CTA) — depende de que Prioridad 0 esté hecho si querés que el FAB también respete el mismo sistema de diseño de `.btn`.
4. **Prioridad 3** (formulario + Netlify Function) — la más grande, la única que toca infraestructura nueva (variables de entorno, función serverless). Dejarla para el final no es pereza, es que las tres anteriores no dependen de ella y esta sí se beneficia de que el resto ya esté estable antes de tocar el flujo de conversión principal.
