// netlify/functions/contact.js
// ESM: el package.json raíz ya tiene "type": "module", así que este fichero
// se resuelve como ESM sin ambigüedad — sin esto, el token del bot tendría
// que viajar en el cliente para llamar directo a la API de Telegram, visible
// en cualquier pestaña de red.
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'method_not_allowed' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'invalid_json' }) };
  }

  const { name, contact, service, budget, message, website, startedAt } = data;

  // Honeypot: campo oculto que un humano nunca rellena. Se responde 200 sin
  // delatar el filtro, para no darle a un bot la pista de qué lo detuvo.
  if (website) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  // Time-trap: un envío en menos de 3s desde que se pintó el formulario es,
  // casi siempre, un bot rellenando el form por script. Mismo criterio de
  // no delatar el filtro: 200 silencioso, no un error visible.
  const startTs = Number(startedAt);
  if (!startTs || Number.isNaN(startTs) || Date.now() - startTs < 3000) {
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
