export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).json({ ok: false, error: "MP_ACCESS_TOKEN not configured" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const amount = Number(body?.amount || 0);
    const email = body?.email || "comprador@test.com";

    if (!amount || amount < 1) {
      return res.status(400).json({ ok: false, error: "amount inválido" });
    }

    const payload = {
      transaction_amount: amount,
      description: "Depósito ICE",
      payment_method_id: "pix",
      payer: { email }
    };

    const r = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ ok: false, error: data });

    const tx = data?.point_of_interaction?.transaction_data;

    return res.status(200).json({
      ok: true,
      paymentId: data.id,
      status: data.status,
      qr_code: tx?.qr_code || null,              // copia e cola
      qr_code_base64: tx?.qr_code_base64 || null // imagem base64
    });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
