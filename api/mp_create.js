const MP = "https://api.mercadopago.com";

module.exports = async (req, res) => {
  try {
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({
        ok: false,
        error: "MP_ACCESS_TOKEN não configurado"
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Use POST"
      });
    }

    let body = "";

    await new Promise(resolve => {
      req.on("data", chunk => {
        body += chunk;
      });
      req.on("end", resolve);
    });

    const { email, amount } = JSON.parse(body || "{}");

    if (!email || !amount) {
      return res.status(400).json({
        ok: false,
        error: "Email e valor obrigatórios"
      });
    }

    const response = await fetch(`${MP}/v1/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        payment_method_id: "pix",
        description: "Compra BLUE - ICE CUBO",
        payer: { email }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        ok: false,
        error: data
      });
    }

    return res.status(200).json({
      ok: true,
      paymentId: data.id,
      status: data.status,
      pix: data.point_of_interaction?.transaction_data?.qr_code || null
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
};
