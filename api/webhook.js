// api/webhook.js
export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const paymentId =
      body?.data?.id ||
      body?.id ||
      req.query["data.id"] ||
      req.query["id"];

    console.log("Webhook MP recebido:", {
      method: req.method,
      paymentId,
      query: req.query,
      body,
    });

    // Sempre responder 200 rápido pro MP não ficar reenviando
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: true, err: String(e?.message || e) });
  }
}
