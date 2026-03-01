// api/mp_create.js
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Use POST" });
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_ACCESS_TOKEN) {
      return res.status(500).json({ ok: false, error: "Falta MP_ACCESS_TOKEN na Vercel" });
    }

    const { amount, email, cpf, description } = req.body || {};
    const value = Number(amount);

    if (!value || value < 1) {
      return res.status(400).json({ ok: false, error: "amount inválido" });
    }

    if (!email) {
      return res.status(400).json({ ok: false, error: "email obrigatório" });
    }

    const baseUrl =
      (req.headers["x-forwarded-proto"] || "https") +
      "://" +
      (req.headers["x-forwarded-host"] || req.headers.host);

    const external_reference = "dep_" + Date.now();

    const body = {
      transaction_amount: value,
      description: description || "Depósito ICE",
      payment_method_id: "pix",
      payer: {
        email,
        ...(cpf
          ? {
              identification: {
                type: "CPF",
                number: String(cpf).replace(/\D/g, ""),
              },
            }
          : {}),
      },
      external_reference,
      notification_url: baseUrl + "/api/webhook",
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": external_reference, // 🔥 ESSENCIAL
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        ok: false,
        mp_error: data,
      });
    }

    const tx = data?.point_of_interaction?.transaction_data || {};

    return res.status(200).json({
      ok: true,
      ticket_url: tx.ticket_url || null,
      qr_code: tx.qr_code || null,
      qr_code_base64: tx.qr_code_base64 || null,
      paymentId: data.id,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: String(e?.message || e),
    });
  }
}
