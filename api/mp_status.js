export default async function handler(req, res) {
  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).json({ ok: false, error: "MP_ACCESS_TOKEN not configured" });

    const { paymentId } = req.query;
    if (!paymentId) return res.status(400).json({ ok: false, error: "Missing paymentId" });

    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ ok: false, error: data });

    return res.status(200).json({
      ok: true,
      id: data.id,
      status: data.status,
      amount: data.transaction_amount,
      approvedAt: data.date_approved
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
