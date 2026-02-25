const MP = "https://api.mercadopago.com";

module.exports = async (req, res) => {
  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).json({ ok: false, error: "MP_ACCESS_TOKEN não configurado" });
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

    let body = req.body;
    if (!body) {
      let raw = "";
      await new Promise((resolve) => {
        req.on("data", (c) => (raw += c));
        req.on("end", resolve);
      });
      body = raw ? JSON.parse(raw) : {};
    }

    const email = String(body.email || "").trim();
    const amount = Number(body.amount);

    if (!email || !amount || Number.isNaN(amount)) {
      return res.status(400).json({ ok: false, error: "Envie { email, amount }" });
    }

    const transaction_amount = Math.round(amount * 100) / 100;

    const r = await fetch(`${MP}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": (Date.now().toString(36) + Math.random().toString(16).slice(2)),
      },
      body: JSON.stringify({
        transaction_amount,
        description: "Compra BLUE - ICE-CUBO",
        payment_method_id: "pix",
        payer: { email },
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(400).json({ ok: false, error: data });

    const tx = data.point_of_interaction?.transaction_data || {};
    return res.status(200).json({
      ok: true,
      paymentId: data.id,
      status: data.status,
      amount: data.transaction_amount,
      qr_code: tx.qr_code || null,
      qr_code_base64: tx.qr_code_base64 || null,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
