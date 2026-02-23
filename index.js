const MP = "https://api.mercadopago.com";

function send(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function sendHtml(res, html) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}

function getUrl(req) {
  // Vercel fornece req.url com path + query
  return new URL(req.url, "https://local.vercel");
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({ _raw: raw });
      }
    });
  });
}

function timingSafeEq(a, b) {
  // evita comparação insegura (simples)
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function mpCreate(req, res) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return send(res, 500, { ok: false, error: "MP_ACCESS_TOKEN não configurado" });
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "Use POST" });

  const body = await readBody(req);
  const email = String(body.email || "").trim();
  const amount = Number(body.amount);

  if (!email || !amount || Number.isNaN(amount)) {
    return send(res, 400, { ok: false, error: "Envie { email, amount }" });
  }

  // MP pode recusar valores muito baixos; arredonda 2 casas
  const transaction_amount = Math.round(amount * 100) / 100;

  const r = await fetch(`${MP}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `${Date.now().toString(36)}${Math.random().toString(16).slice(2)}`
    },
    body: JSON.stringify({
      transaction_amount,
      description: "Compra BLUE - ICE-CUBO",
      payment_method_id: "pix",
      payer: { email }
    })
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) return send(res, 400, { ok: false, error: data });

  const tx = data?.point_of_interaction?.transaction_data || {};
  return send(res, 200, {
    ok: true,
    paymentId: data.id,
    status: data.status,
    amount: data.transaction_amount,
    qr_code: tx.qr_code || null,
    qr_code_base64: tx.qr_code_base64 || null
  });
}

async function mpStatus(req, res) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return send(res, 500, { ok: false, error: "MP_ACCESS_TOKEN não configurado" });
  if (req.method !== "GET") return send(res, 405, { ok: false, error: "Use GET" });

  const url = getUrl(req);
  const paymentId = url.searchParams.get("paymentId");
  if (!paymentId) return send(res, 400, { ok: false, error: "Passe ?paymentId=" });

  const r = await fetch(`${MP}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) return send(res, 400, { ok: false, error: data });

  return send(res, 200, {
    ok: true,
    id: data.id,
    status: data.status, // approved / pending / rejected
    amount: data.transaction_amount
  });
}

async function webhook(req, res) {
  // opcional: valida um segredo simples via header
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (secret) {
    const got = req.headers["x-webhook-secret"];
    if (!timingSafeEq(String(got || ""), String(secret))) {
      return send(res, 401, { ok: false, error: "Webhook secret inválido" });
    }
  }

  // só responde OK (você pode salvar em DB depois)
  const body = await readBody(req);
  return send(res, 200, { ok: true, received: body });
}

function homeHtml() {
  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE-CUBO</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:0;background:#0b1220;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{max-width:520px;width:100%;background:#111b33;border:1px solid #22325c;border-radius:16px;padding:18px}
  input,button{width:100%;padding:12px;border-radius:12px;border:0;margin:8px 0;font-size:16px}
  input{background:#0b1220;color:#fff;border:1px solid #22325c}
  button{background:#38bdf8;color:#001018;font-weight:800;cursor:pointer}
  pre{white-space:pre-wrap;word-break:break-word;background:#0b1220;border:1px solid #22325c;border-radius:12px;padding:12px}
  small{opacity:.8}
</style>
</head>
<body>
  <div class="card">
    <h2>ICE-CUBO ✅</h2>
    <small>Teste PIX Mercado Pago (criar e consultar status)</small>

    <input id="email" placeholder="email do pagador" value="teste@email.com"/>
    <input id="amount" placeholder="valor (ex: 1.00)" value="1.00"/>
    <button onclick="criar()">Gerar PIX</button>

    <div id="qrarea" style="display:none">
      <p><b>paymentId:</b> <span id="pid"></span></p>
      <button onclick="status()">Ver status</button>
      <pre id="qr"></pre>
    </div>

    <pre id="out"></pre>
  </div>

<script>
let paymentId = null;

async function criar(){
  const email = document.getElementById('email').value.trim();
  const amount = Number(document.getElementById('amount').value);
  document.getElementById('out').textContent = 'Criando pagamento...';

  const r = await fetch('/api/mp_create', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email, amount })
  });
  const data = await r.json();
  document.getElementById('out').textContent = JSON.stringify(data, null, 2);

  if(data && data.ok){
    paymentId = data.paymentId;
    document.getElementById('pid').textContent = paymentId;
    document.getElementById('qrarea').style.display = 'block';
    document.getElementById('qr').textContent = data.qr_code || '(sem qr_code)';
  }
}

async function status(){
  if(!paymentId) return;
  document.getElementById('out').textContent = 'Consultando status...';
  const r = await fetch('/api/mp_status?paymentId=' + encodeURIComponent(paymentId));
  const data = await r.json();
  document.getElementById('out').textContent = JSON.stringify(data, null, 2);
}
</script>
</body>
</html>`;
}

module.exports = async (req, res) => {
  try {
    const url = getUrl(req);
    const path = url.pathname;

    // HOME
    if (path === "/" && req.method === "GET") return sendHtml(res, homeHtml());

    // API
    if (path === "/api/mp_create") return mpCreate(req, res);
    if (path === "/api/mp_status") return mpStatus(req, res);

    // webhook opcional (se usar)
    if (path === "/api/mp_webhook") return webhook(req, res);

    return send(res, 404, { ok: false, error: "Not found", path });
  } catch (e) {
    return send(res, 500, { ok: false, error: String(e?.message || e) });
  }
};
