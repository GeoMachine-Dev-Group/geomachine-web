const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const base = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await response.json();
  return data.access_token;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { orderId } = JSON.parse(event.body);
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (data.status === "COMPLETED") {
      // Notificar a Telegram
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const amount = data.purchase_units[0].payments.captures[0].amount.value;
        const currency = data.purchase_units[0].payments.captures[0].amount.currency_code;
        const desc = data.purchase_units[0].description || 'Sin descripción';
        const name = data.payer.name.given_name + " " + data.payer.name.surname;
        const email = data.payer.email_address;
        
        const message = `🚀 *Nuevo Proyecto Iniciado*\n\n`
          + `✅ *Anticipo Recibido:* ${amount} ${currency}\n`
          + `📌 *Concepto:* ${desc}\n`
          + `👤 *Cliente:* ${name} (${email})\n`
          + `🆔 *Order ID:* \`${orderId}\``;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
          })
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "El pago no se pudo completar.", details: data })
      };
    }
  } catch (error) {
    console.error("Error al capturar orden PayPal:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to capture order." }),
    };
  }
};
