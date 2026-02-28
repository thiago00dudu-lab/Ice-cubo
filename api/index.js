// api/index.js (UM ARQUIVO SÓ - CommonJS)
const MP_API = "https://api.mercadopago.com";

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const action = url.searchParams.get("action") || "";

    // Helpers
    const sendJSON = (code, obj) => {
      res.statusCode = code;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(obj));
    };

    const readBodyJSON = async () => {
      if (req.body && typeof req.body === "object") return req.body;
      let raw = "";
      await new Promise((resolve) => {
        req.on("data", (c) => (raw += c));
        req.on("end", resolve);
      });
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    };

    // -------------------------
    // ACTION: mp_create (PIX)
    // -------------------------
    if (action === "mp_create") {
      const token = process.env.MP_ACCESS_TOKEN;
      if (!token) return sendJSON(500, { OK: false, error: { message: "MP_ACCESS_TOKEN não configurado" } });

      if (req.method !== "POST") return sendJSON(405, { OK: false, error: { message: "Use POST" } });

      const body = await readBodyJSON();
      const email = String(body.email || "").trim();
      const quantia = body.quantia ?? body.amount; // aceita "quantia" (seu front) ou "amount"
      const amount = Number(String(quantia || "").replace(",", "."));

      if (!email || !amount || Number.isNaN(amount) || amount <= 0) {
        return sendJSON(400, { OK: false, error: { message: "Envie { email, quantia } com valor > 0" } });
      }

      const payload = {
        transaction_amount: Math.round(amount * 100) / 100,
        description: "ICE CUBO - PIX",
        payment_method_id: "pix",
        payer: { email },
      };

      const r = await fetch(`${MP_API}/v1/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": (Date.now().toString(36) + Math.random().toString(16).slice(2)),
        },
        body: JSON.stringify(payload),
      });

      const data = await r.json();
      if (!r.ok) return sendJSON(400, { OK: false, error: data });

      const tx = data.point_of_interaction?.transaction_data || {};
      const codigo_qr = tx.qr_code || null;
      const qr_base64 = tx.qr_code_base64 || null;

      if (!codigo_qr) {
        return sendJSON(500, { OK: false, error: { message: "Criou pagamento mas não veio qr_code", raw: data } });
      }

      return sendJSON(200, {
        OK: true,
        paymentId: data.id,
        status: data.status,
        valor: data.transaction_amount,
        codigo_qr,    // <-- seu front usa isso
        qr_base64,    // <-- opcional
      });
    }

    // -------------------------
    // ACTION: mp_status
    // -------------------------
    if (action === "mp_status") {
      const token = process.env.MP_ACCESS_TOKEN;
      if (!token) return sendJSON(500, { OK: false, error: { message: "MP_ACCESS_TOKEN não configurado" } });

      const paymentId = url.searchParams.get("paymentId");
      if (!paymentId) return sendJSON(400, { OK: false, error: { message: "Passe ?paymentId=" } });

      const r = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await r.json();
      if (!r.ok) return sendJSON(400, { OK: false, error: data });

      return sendJSON(200, {
        OK: true,
        paymentId: data.id,
        status: data.status,
        status_detail: data.status_detail,
        valor: data.transaction_amount,
      });
    }

    // -------------------------
    // SITE (HTML)
    // -------------------------
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.statusCode = 200;

    res.end(`<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>ICE CUBO</title>
<style>
  body{background:#000;color:#fff;font-family:sans-serif;margin:0;display:flex;flex-direction:column;align-items:center;min-height:100vh;justify-content:center}
  .card{background:#111;border:1px solid #333;padding:25px;border-radius:20px;width:85%;max-width:380px;text-align:center}
  h1{font-size:22px;margin:0 0 12px;color:#0070f3}
  p{margin:0 0 12px;color:#aaa;font-size:14px}
  input{width:100%;padding:12px;margin:10px 0;border-radius:8px;border:1px solid #444;background:#222;color:#fff;box-sizing:border-box}
  button{width:100%;padding:15px;background:#0070f3;color:#fff;border:none;border-radius:10px;font-weight:bold;cursor:pointer;font-size:16px}
  #res{margin-top:15px;font-size:13px;word-break:break-word;text-align:left}
  .ok{color:#00ff00}
  .err{color:#ff4444}
  .menu-footer{position:fixed;bottom:0;width:100%;display:flex;justify-content:space-around;padding:18px;background:#080808;border-top:1px solid #222}
  .menu-item{color:#888;font-size:12px;text-decoration:none;cursor:pointer}
  .smallbtn{background:#1b1b1b;border:1px solid #333;margin-top:10px}
  .row{display:flex;gap:10px}
  .row button{width:50%}
</style>
</head>
<body>

<div class="card">
  <h1>ICE CUBO</h1>
  <p>Preencha para gerar seu Pix</p>

  <input type="email" id="email" placeholder="Seu e-mail (Mercado Pago)">
  <input type="number" step="0.01" id="valor" placeholder="Valor R$ (ex: 5.00)">

  <div class="row">
    <button onclick="gerar()">GERAR PIX</button>
    <button class="smallbtn" onclick="verStatus()">VER STATUS</button>
  </div>

  <div id="res"></div>
</div>

<div class="menu-footer">
  <div class="menu-item">Casa</div>
  <div class="menu-item">Câmera</div>
  <div class="menu-item">Perigo</div>
</div>

<script>
  let lastPaymentId = null;

  async function gerar(){
    const email = document.getElementById('email').value.trim();
    const valor = document.getElementById('valor').value;
    const resDiv = document.getElementById('res');

    if(!email || !valor) return alert("Preencha tudo!");
    resDiv.innerHTML = "Gerando Pix... aguarde.";

    try{
      const response = await fetch('/api?action=mp_create', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, quantia: valor }) // mantém seu padrão
      });

      const dados = await response.json();

      if(dados.OK){
        lastPaymentId = dados.paymentId;

        resDiv.innerHTML = \`
          <div class="ok"><b>Pix Gerado!</b></div>
          <div style="margin-top:8px;color:#aaa">PaymentId: <b>\${dados.paymentId}</b></div>
          <div style="margin-top:8px;color:#aaa">Status: <b>\${dados.status}</b></div>
          <div style="margin-top:12px;color:#aaa"><small>Copia e cola:</small></div>
          <input value="\${dados.codigo_qr}" readonly onclick="this.select()">
          <div style="margin-top:10px;font-size:12px;color:#888">Depois de pagar, clique em “VER STATUS”.</div>
        \`;
      } else {
        const msg = (dados.error && (dados.error.message || dados.error.error)) || "Falha no servidor";
        resDiv.innerHTML = "<div class='err'><b>Erro:</b> " + String(msg) + "</div>";
      }
    }catch(e){
      resDiv.innerHTML = "<div class='err'>Erro de conexão.</div>";
    }
  }

  async function verStatus(){
    const resDiv = document.getElementById('res');
    if(!lastPaymentId){
      return alert("Gere um Pix primeiro.");
    }
    resDiv.innerHTML = "Consultando status...";

    try{
      const r = await fetch('/api?action=mp_status&paymentId=' + encodeURIComponent(lastPaymentId));
      const dados = await r.json();

      if(dados.OK){
        resDiv.innerHTML = \`
          <div><b>Status do pagamento</b></div>
          <div style="margin-top:8px;color:#aaa">PaymentId: <b>\${dados.paymentId}</b></div>
          <div style="margin-top:8px;color:#aaa">Status: <b>\${dados.status}</b></div>
          <div style="margin-top:8px;color:#aaa">Detalhe: <b>\${dados.status_detail || "-"}</b></div>
          <div style="margin-top:12px;\${dados.status==='approved' ? 'color:#00ff00' : 'color:#ffcc00'}">
            \${dados.status==='approved' ? '✅ Pago (approved)' : '⏳ Ainda não aprovado'}
          </div>
        \`;
      } else {
        const msg = (dados.error && (dados.error.message || dados.error.error)) || "Falha no servidor";
        resDiv.innerHTML = "<div class='err'><b>Erro:</b> " + String(msg) + "</div>";
      }
    }catch(e){
      resDiv.innerHTML = "<div class='err'>Erro de conexão.</div>";
    }
  }
</script>

</body>
</html>`);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ OK: false, error: { message: e.message } }));
  }
};
