const MP = "https://api.mercadopago.com";

module.exports = async (req, res) => {
  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ ok: false, error: "MP_ACCESS_TOKEN não configurado" });
    }

    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({ ok: false, error: "Passe ?paymentId=" });
    }

    const r = await fetch(`${MP}/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(400).json({ ok: false, error: data });
    }

    return res.status(200).json({
      ok: true,
      id: data.id,
      status: data.status,
      valor: data.transaction_amount,
    });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
