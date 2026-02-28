export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).json({ ok: false, error: "MP_ACCESS_TOKEN not configured" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { title = "Depósito ICE", amount } = body || {};

    const value = Number(amount);
    if (!value || value < 1) return res.status(400).json({ ok: false, error: "amount inválido" });

    // Preference (Checkout Pro): abre tela do Mercado Pago (Pix/cartão)
    const preference = {
      items: [{ title, quantity: 1, unit_price: value }],
      // IMPORTANTE: coloque sua URL real depois
      back_urls: {
        success: "https://SEU-DOMINIO.vercel.app/?pay=success",
        pending: "https://SEU-DOMINIO.vercel.app/?pay=pending",
        failure: "https://SEU-DOMINIO.vercel.app/?pay=failure"
      },
      auto_return: "approved",
      notification_url: "https://SEU-DOMINIO.vercel.app/api/mp_webhook"
    };

    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(preference)
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ ok: false, error: data });

    return res.status(200).json({
      ok: true,
      preferenceId: data.id,
      init_point: data.init_point
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
