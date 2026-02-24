// /api/mp.js (Vercel Serverless Function - CommonJS)
// ENV na Vercel:
// ACCESS_TOKEN = seu token privado Mercado Pago
// MP_WEBHOOK_SECRET = sua chave secreta do webhook (opcional, recomendado)

const crypto = require("crypto");

const MP_API = "https://api.mercadopago.com";

function json(res, code, data) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(code).send(JSON.stringify(data, null, 2));
}

function getHeader(req, name) {
  return (req.headers?.[name] || req.headers?.[name?.toLowerCase()] || "").toString();
}

/**
 * Validação de assinatura do webhook (quando presente):
 * x-signature: ts=... , v1=...
 * x-request-id: ...
 * manifest: id:{id};request-id:{x-request-id};ts:{ts};
 * HMAC-SHA256(manifest, secret) === v1
 */
function verifyWebhookSignature({ secret, xSignature, xRequestId, id }) {
  if (!secret) return true; // se você não setar secret, não bloqueia
  if (!xSignature || !xRequestId || !id) return false;

  const parts = xSignature.split(",").map((p) => p.trim());
  let ts = "";
  let v1 = "";

  for (const p of parts) {
    const [k, val] = p.split("=");
    if (!k) continue;
    if (k.trim() === "ts") ts = (val || "").trim();
    if (k.trim() === "v1") v1 = (val || "").trim();
  }

  if (!ts || !v1) return false;

  const manifest = `id:${id};request-id:${xRequestId};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
  } catch {
    return false;
  }
}

async function mpFetch(path, { accessToken, method = "GET", body, idempotencyKey } = {}) {
  if (!accessToken) throw new Error("ACCESS_TOKEN não configurado na Vercel (Environment Variables).");

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  if (idempotencyKey) headers["X-Idempotency-Key"] = idempotencyKey;

  const resp = await fetch(`${MP_API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!resp.ok) {
    const msg = data?.message || data?.error || `Erro Mercado Pago (${resp.status})`;
    const detail = data?.cause || data;
    const err = new Error(msg);
    err.status = resp.status;
    err.detail = detail;
    throw err;
  }

  return data;
}

function pickPixData(payment) {
  const td = payment?.point_of_interaction?.transaction_data || {};
  return {
    payment_id: payment?.id,
    status: payment?.status,
    status_detail: payment?.status_detail,
    ticket_url: td?.ticket_url || null,
    qr_code: td?.qr_code || null,
    qr_code_base64: td?.qr_code_base64 || null,
  };
}

module.exports = async function handler(req, res) {
  try {
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET;

    // Healthcheck / Ping
    if (req.method === "GET" && req.query && req.query.ping) {
      return json(res, 200, {
        ok: true,
        online: "ICE CUBO Online na Vercel ✅",
        hasAccessToken: !!ACCESS_TOKEN,
        hasWebhookSecret: !!MP_WEBHOOK_SECRET,
        endpoints: {
          create_pix: "/api/mp?action=create_pix  (POST JSON)",
          status: "/api/mp?action=status&id=PAYMENT_ID (GET)",
          webhook: "/api/mp (POST)",
        },
      });
    }

    // =========================
    // 1) CRIAR PIX (POST)
    // =========================
    if (req.method === "POST" && req.query?.action === "create_pix") {
      const { amount, email, description } = req.body || {};

      if (!amount || Number(amount) <= 0) {
        return json(res, 400, { ok: false, error: "Informe amount > 0" });
      }
      if (!email) {
        return json(res, 400, { ok: false, error: "Informe email do pagador" });
      }

      // Idempotência (evita duplicar cobrança se apertar 2x)
      const idem = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");

      const payment = await mpFetch("/v1/payments", {
        accessToken: ACCESS_TOKEN,
        method: "POST",
        idempotencyKey: idem,
        body: {
          transaction_amount: Number(amount),
          description: description || "ICE-CUBO PIX",
          payment_method_id: "pix",
          payer: { email: String(email) },
        },
      });

      return json(res, 200, { ok: true, pix: pickPixData(payment) });
    }

    // =========================
    // 2) STATUS (GET)
    // =========================
    if (req.method === "GET" && req.query?.action === "status") {
      const id = req.query?.id;
      if (!id) return json(res, 400, { ok: false, error: "Passe ?id=PAYMENT_ID" });

      const payment = await mpFetch(`/v1/payments/${encodeURIComponent(id)}`, {
        accessToken: ACCESS_TOKEN,
        method: "GET",
      });

      return json(res, 200, { ok: true, payment: pickPixData(payment) });
    }

    // =========================
    // 3) WEBHOOK (POST)
    // =========================
    // Configure no painel MP apontando para:
    // https://SEUAPP.vercel.app/api/mp
    if (req.method === "POST") {
      const body = req.body || {};
      const dataId = body?.data?.id || body?.id || req.query?.id || req.query?.["data.id"];

      const xSignature = getHeader(req, "x-signature");
      const xRequestId = getHeader(req, "x-request-id");

      const okSig = verifyWebhookSignature({
        secret: MP_WEBHOOK_SECRET,
        xSignature,
        xRequestId,
        id: dataId,
      });

      if (!okSig) {
        return json(res, 401, { ok: false, error: "Webhook assinatura inválida" });
      }

      // Se não tiver id, responde OK pra não reenviar sem parar
      if (!dataId) {
        return json(res, 200, { ok: true, note: "Webhook recebido sem data.id" });
      }

      // Confirma pagamento consultando no MP (fonte da verdade)
      const payment = await mpFetch(`/v1/payments/${encodeURIComponent(dataId)}`, {
        accessToken: ACCESS_TOKEN,
        method: "GET",
      });

      return json(res, 200, {
        ok: true,
        confirmed: true,
        payment: pickPixData(payment),
      });
    }

    // Método não permitido
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { ok: false, error: "Method not allowed" });
  } catch (err) {
    const status = err?.status || 500;
    return json(res, status, {
      ok: false,
      error: String(err?.message || err),
      detail: err?.detail || null,
    });
  }
};
