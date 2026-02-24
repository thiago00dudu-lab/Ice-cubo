// api/mp/index.js (Vercel Serverless Function - CommonJS)
const MP_API = "https://api.mercadopago.com";

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

async function mpFetch(path, accessToken, opts = {}) {
  const r = await fetch(`${MP_API}${path}`, {
    method: opts.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  if (!r.ok) throw { status: r.status, detail: json || text };
  return json || {};
}

module.exports = async (req, res) => {
  try {
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    if (!ACCESS_TOKEN) return send(res, 500, { ok:false, error:"Missing env ACCESS_TOKEN" });

    // PING
    if (req.method === "GET" && req.query?.ping === "1") {
      return send(res, 200, { ok:true, route:"/api/mp", ping:true });
    }

    // CRIAR PIX
    if (req.method === "POST" && req.query?.action === "create_pix") {
      const { email, value } = req.body || {};
      const amount = Number(value || 0);
      if (!email || !amount || amount <= 0) return send(res, 400, { ok:false, error:"email e value obrigatórios" });

      const body = {
        transaction_amount: amount,
        description: "ICE-CUBO PIX",
        payment_method_id: "pix",
        payer: { email },
      };

      const payment = await mpFetch("/v1/payments", ACCESS_TOKEN, { method:"POST", body });
      const tx = payment?.point_of_interaction?.transaction_data || {};
      return send(res, 200, {
        ok: true,
        id: payment.id,
        status: payment.status,
        qr_code: tx.qr_code || null,
        qr_code_base64: tx.qr_code_base64 || null,
      });
    }

    // STATUS
    if (req.method === "GET" && req.query?.action === "status") {
      const id = req.query.id;
      if (!id) return send(res, 400, { ok:false, error:"id obrigatório" });

      const payment = await mpFetch(`/v1/payments/${encodeURIComponent(id)}`, ACCESS_TOKEN);
      return send(res, 200, { ok:true, id: payment.id, status: payment.status, status_detail: payment.status_detail });
    }

    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { ok:false, error:"Method not allowed" });
  } catch (e) {
    return send(res, e.status || 500, { ok:false, error:"API error", detail: e.detail || String(e) });
  }
};
