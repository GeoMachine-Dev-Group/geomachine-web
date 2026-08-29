const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const base = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { totalAmount, invoiceRef, serviceName } = JSON.parse(event.body);
    
    if (!totalAmount || isNaN(totalAmount)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Monto inválido.' }) };
    }

    // Calcular el 50% del adelanto
    const advanceAmount = (parseFloat(totalAmount) * 0.5).toFixed(2);
    
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: invoiceRef || "general",
          description: `Adelanto 50% - ${serviceName || 'Proyecto'}`,
          amount: {
            currency_code: "EUR",
            value: advanceAmount,
          },
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ orderId: data.id }),
    };

  } catch (error) {
    console.error("Error al crear la orden PayPal:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create order." }),
    };
  }
};
