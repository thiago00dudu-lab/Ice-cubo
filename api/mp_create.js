const MP = "https://api.mercadopago.com";

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).end(JSON.stringify({ ok:false, error:"MP_ACCESS_TOKEN não configurado" }));

    if (req.method !== "POST") return res.status(405).end(JSON.stringify({ ok:false, error:"Use POST" }));

    let raw = "";
    await new Promise(resolve => {
      req.on("data", c => raw += c);
      req.on("end", resolve);
    });

    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }

    const email = String(body.email || "").trim();
    const amount = Number(body.amount);

    if (!email || !amount || Number.isNaN(amount) || amount < 1) {
      return res.status(400).end(JSON.stringify({ ok:false, error:"Envie { email, amount>=1 }" }));
    }

    const idem = "ice_" + Date.now().toString(36) + "_" + Math.random().toString(16).slice(2);

    const r = await fetch(`${MP}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idem,
      },
      body: JSON.stringify({
        transaction_amount: Math.round(amount * 100) / 100,
        description: "Compra BLUE - ICE-CUBO",
        payment_method_id: "pix",
        payer: { email },
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(400).end(JSON.stringify({ ok:false, error:data }));

    const tx = data?.point_of_interaction?.transaction_data || {};
    return res.status(200).end(JSON.stringify({
      ok: true,
      paymentId: data.id,
      status: data.status,
      amount: data.transaction_amount,
      qr_code: tx.qr_code || null,
      qr_code_base64: tx.qr_code_base64 || null
    }));
  } catch (e) {
    return res.status(500).end(JSON.stringify({ ok:false, error:e.message }));
  }
};
