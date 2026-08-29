import type { APIRoute } from 'astro';

// Ruta on-demand: se despliega como función de Vercel, no se prerenderiza.
export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }

  const { name, contact, service, budget, message, website, startedAt } = data;

  // Honeypot: campo oculto que un humano nunca rellena. Se responde 200 sin
  // delatar el filtro, para no darle a un bot la pista de qué lo detuvo.
  if (website) {
    return json(200, { ok: true });
  }

  // Time-trap: un envío en menos de 3s desde que se pintó el formulario es,
  // casi siempre, un bot. Mismo criterio: 200 silencioso, no un error visible.
  const startTs = Number(startedAt);
  if (!startTs || Number.isNaN(startTs) || Date.now() - startTs < 3000) {
    return json(200, { ok: true });
  }

  if (!name || !contact || !message) {
    return json(400, { ok: false, error: 'missing_fields' });
  }

  const token = import.meta.env.TELEGRAM_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.TELEGRAM_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return json(500, { ok: false, error: 'server_misconfigured' });
  }

  // Texto plano, sin parse_mode: un mensaje con "*", "_" o "[" del usuario
  // rompería el parser de Markdown de Telegram (400 can't parse entities) y
  // tiraría abajo envíos legítimos por un carácter suelto, no por spam.
  const text = [
    '📩 Nuevo lead — geomachine.es',
    `Nombre: ${name}`,
    `Contacto: ${contact}`,
    service ? `Servicio: ${service}` : null,
    budget ? `Presupuesto: ${budget}` : null,
    `Mensaje: ${message}`,
  ]
    .filter(Boolean)
    .join('\n');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    return json(502, { ok: false, error: 'telegram_failed' });
  }
  return json(200, { ok: true });
};

export const GET: APIRoute = () => json(405, { ok: false, error: 'method_not_allowed' });
