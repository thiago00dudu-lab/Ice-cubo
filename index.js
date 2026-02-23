module.exports = (req, res) => {
  // Sempre responder HTML no / (GET)
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, error: "Use GET" }));
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  return res.end(`<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ICE-CUBO • PIX</title>
  <style>
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#0b1220;color:#e8eefc}
    .wrap{max-width:900px;margin:0 auto;padding:18px}
    .card{background:#111a2e;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px;margin:12px 0;box-shadow:0 10px 30px rgba(0,0,0,.25)}
    h1{font-size:20px;margin:0 0 10px}
    label{display:block;font-size:12px;opacity:.9;margin:10px 0 6px}
    input{width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#0b1326;color:#e8eefc;outline:none}
    button{width:100%;padding:12px;border-radius:12px;border:0;background:#38bdf8;color:#001018;font-weight:800;cursor:pointer}
    button:disabled{opacity:.5;cursor:not-allowed}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .small{font-size:12px;opacity:.85}
    .ok{color:#86efac}
    .bad{color:#fca5a5}
    .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
    .qr{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start}
    img{background:#fff;border-radius:12px;padding:10px;max-width:240px}
    textarea{width:100%;min-height:92px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#0b1326;color:#e8eefc;outline:none}
    .pill{display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.25);font-size:12px}
    a{color:#38bdf8;text-decoration:none}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>ICE-CUBO • Pagamento PIX (Mercado Pago)</h1>
      <div class="small">Se der erro, o problema vai aparecer aqui embaixo (sem travar tudo).</div>
    </div>

    <div class="card">
      <div class="row">
        <div>
          <label>Email do comprador</label>
          <input id="email" placeholder="ex: cliente@gmail.com" />
        </div>
        <div>
          <label>Valor (R$)</label>
          <input id="amount" placeholder="ex: 9.90" inputmode="decimal" />
        </div>
      </div>

      <div style="height:12px"></div>
      <button id="btn">Gerar PIX</button>
      <div style="height:10px"></div>
      <div id="msg" class="small"></div>
    </div>

    <div id="pixCard" class="card" style="display:none">
      <div class="pill">Pagamento</div>
      <div style="height:10px"></div>

      <div class="small">Status: <b id="status" class="mono">-</b></div>
      <div class="small">Payment ID: <b id="pid" class="mono">-</b></div>
      <div style="height:12px"></div>

      <div class="qr">
        <div>
          <div class="small">QR Code</div>
          <img id="qrimg" alt="QR Code PIX" />
        </div>
        <div style="flex:1;min-width:260px">
          <div class="small">Copia e cola</div>
          <textarea id="qrtext" class="mono" readonly></textarea>
          <div style="height:10px"></div>
          <button id="copyBtn" type="button">Copiar código PIX</button>
        </div>
      </div>

      <div style="height:12px"></div>
      <div class="small">* O status atualiza automaticamente.</div>
    </div>

    <div class="card">
      <div class="small">
        Endpoints usados:
        <span class="mono">POST /api/mp_create</span> e <span class="mono">GET /api/mp_status?paymentId=...</span>
      </div>
    </div>
  </div>

<script>
(function(){
  const $ = (id) => document.getElementById(id);

  const btn = $("btn");
  const msg = $("msg");
  const pixCard = $("pixCard");
  const statusEl = $("status");
  const pidEl = $("pid");
  const qrimg = $("qrimg");
  const qrtext = $("qrtext");
  const copyBtn = $("copyBtn");

  let pollTimer = null;

  function setMsg(text, ok){
    msg.textContent = text || "";
    msg.className = "small " + (ok === true ? "ok" : ok === false ? "bad" : "");
  }

  function moneyToNumber(s){
    if(!s) return NaN;
    // aceita "9,90" ou "9.90"
    const v = String(s).trim().replace(/\\./g, "").replace(",", ".");
    return Number(v);
  }

  async function createPix(email, amount){
    const r = await fetch("/api/mp_create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, amount })
    });
    const data = await r.json().catch(() => null);
    if(!r.ok || !data || data.ok !== true){
      const err = (data && (data.error || data.message)) ? (data.error || data.message) : ("HTTP " + r.status);
      throw new Error(err);
    }
    return data;
  }

  async function fetchStatus(paymentId){
    const r = await fetch("/api/mp_status?paymentId=" + encodeURIComponent(paymentId));
    const data = await r.json().catch(() => null);
    if(!r.ok || !data || data.ok !== true){
      const err = (data && (data.error || data.message)) ? (data.error || data.message) : ("HTTP " + r.status);
      throw new Error(err);
    }
    return data;
  }

  function startPolling(paymentId){
    if(pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(async () => {
      try{
        const st = await fetchStatus(paymentId);
        statusEl.textContent = st.status || "-";
        // para de ficar consultando quando aprovar
        if(st.status === "approved"){
          setMsg("Pagamento aprovado ✅", true);
          clearInterval(pollTimer);
          pollTimer = null;
        }
      }catch(e){
        // não derruba, só mostra
        setMsg("Falha ao checar status: " + (e && e.message ? e.message : e), false);
      }
    }, 2500);
  }

  btn.addEventListener("click", async () => {
    try{
      setMsg("", null);
      btn.disabled = true;

      const email = String($("email").value || "").trim();
      const amount = moneyToNumber($("amount").value);

      if(!email || email.indexOf("@") === -1){
        setMsg("Digite um email válido.", false);
        btn.disabled = false;
        return;
      }
      if(!Number.isFinite(amount) || amount <= 0){
        setMsg("Digite um valor válido (ex: 9,90).", false);
        btn.disabled = false;
        return;
      }

      setMsg("Gerando PIX...", null);
      const p = await createPix(email, amount);

      pixCard.style.display = "block";
      pidEl.textContent = p.paymentId || "-";
      statusEl.textContent = p.status || "pending";

      qrtext.value = p.qr_code || "";
      if(p.qr_code_base64){
        qrimg.src = "data:image/png;base64," + p.qr_code_base64;
      }else{
        qrimg.removeAttribute("src");
      }

      setMsg("PIX gerado. Abra seu app e pague no QR Code.", true);
      if(p.paymentId) startPolling(p.paymentId);

    }catch(e){
      setMsg("Erro: " + (e && e.message ? e.message : e), false);
    }finally{
      btn.disabled = false;
    }
  });

  copyBtn.addEventListener("click", async () => {
    try{
      const text = qrtext.value || "";
      if(!text){
        setMsg("Não tem código PIX para copiar.", false);
        return;
      }
      await navigator.clipboard.writeText(text);
      setMsg("Copiado ✅", true);
    }catch(e){
      setMsg("Não consegui copiar automaticamente. Selecione e copie manual.", false);
    }
  });
})();
</script>

</body>
</html>`);
};
