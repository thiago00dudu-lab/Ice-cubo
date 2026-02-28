export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Use POST" });
    }

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ ok: false, error: "MP_ACCESS_TOKEN not configured" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const value = Number(body?.amount || 0);
    const title = body?.title || "Depósito ICE";

    if (!value || value < 1) {
      return res.status(400).json({ ok: false, error: "amount inválido" });
    }

    // baseUrl automático do seu domínio na Vercel
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const baseUrl = `${proto}://${host}`;

    const preference = {
      items: [
        {
          title,
          quantity: 1,
          unit_price: value,
          currency_id: "BRL",
        },
      ],
      back_urls: {
        success: `${baseUrl}/?pay=success`,
        pending: `${baseUrl}/?pay=pending`,
        failure: `${baseUrl}/?pay=failure`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/mp_webhook`,
    };

    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({ ok: false, error: data });
    }

    return res.status(200).json({
      ok: true,
      preferenceId: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
