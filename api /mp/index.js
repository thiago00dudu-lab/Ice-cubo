// api/mp/index.js
// Vercel Serverless Function – Mercado Pago PIX

const crypto = require("crypto");

const MP_API = "https://api.mercadopago.com";

function json(res, code, data) {
  res.setHeader("Content-Type", "application/json");
  return res.status(code).send(data);
}

async function mpFetch(path, { method = "GET", body } = {}) {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    throw new Error("ACCESS_TOKEN não configurado na Vercel");
  }

  const response = await fetch(`${MP_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const err = new Error(data?.message || "Erro Mercado Pago");
    err.status = response.status;
    throw err;
  }

  return data;
}

module.exports = async function handler(req, res) {
  try {
    // TESTE DA API
    if (req.method === "GET" && req.query?.ping) {
      return json(res, 200, {
        ok: true,
        message: "API ICE PIX ONLINE ✅",
      });
    }

    // CRIAR PIX
    if (req.method === "POST" && req.query?.action === "create_pix") {
      const { amount, email } = req.body || {};

      if (!amount || !email) {
        return json(res, 400, { ok: false, error: "Informe amount e email" });
      }

      const payment = await mpFetch("/v1/payments", {
        method: "POST",
        body: {
          transaction_amount: Number(amount),
          payment_method_id: "pix",
          description: "ICE CUBO PIX",
          payer: { email },
        },
      });

      const pixData = payment?.point_of_interaction?.transaction_data || {};

      return json(res, 200, {
        ok: true,
        payment_id: payment.id,
        status: payment.status,
        qr_code: pixData.qr_code,
        qr_code_base64: pixData.qr_code_base64,
        ticket_url: pixData.ticket_url,
      });
    }

    // CONSULTAR STATUS
    if (req.method === "GET" && req.query?.action === "status") {
      const id = req.query?.id;

      if (!id) {
        return json(res, 400, { ok: false, error: "Passe o id do pagamento" });
      }

      const payment = await mpFetch(`/v1/payments/${id}`);

      return json(res, 200, {
        ok: true,
        status: payment.status,
        status_detail: payment.status_detail,
      });
    }

    return json(res, 405, { ok: false, error: "Método não permitido" });

  } catch (err) {
    return json(res, err.status || 500, {
      ok: false,
      error: err.message,
    });
  }
};
