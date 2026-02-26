const MP = "https://api.mercadopago.com";

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).end(JSON.stringify({ ok:false, error:"MP_ACCESS_TOKEN não configurado" }));

    const url = new URL(req.url, "https://localhost");
    const paymentId = url.searchParams.get("paymentId");
    if (!paymentId) return res.status(400).end(JSON.stringify({ ok:false, error:"Passe ?paymentId=" }));

    const r = await fetch(`${MP}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await r.json();
    if (!r.ok) return res.status(400).end(JSON.stringify({ ok:false, error:data }));

    return res.status(200).end(JSON.stringify({
      ok: true,
      id: data.id,
      status: data.status,
      amount: data.transaction_amount
    }));
  } catch (e) {
    return res.status(500).end(JSON.stringify({ ok:false, error:e.message }));
  }
};
