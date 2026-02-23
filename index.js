const BLUE_PER_BRL = 100;      // 1 real = 100 BLUE
const MIN_DEPOSIT = 0.05;      // pode falhar no MP, se falhar usa 1.00
const MIN_WITHDRAW = 50;       // saque mínimo em BLUE
const MINE_REWARD = 50;        // 50 BLUE por bloco
const USER_SHARE = 0.85;       // 85% pro comprador (em BLUE)
const REF_SHARE = 0.05;        // 5% pro "pai" (se tiver)
const SITE_SHARE = 0.10;       // 10% "taxa do site" (só contabiliza em log)

globalThis.DB ||= {
  users: {},      // username -> { pass, email, parent, blue, posts:[] }
  sessions: {},   // sid -> username
  pending: {},    // paymentId -> { username, brl, createdAt }
  withdraws: []   // { username, amount, pix, at }
};
const DB = globalThis.DB;

const uid = (n=24)=>{ const a="abcdefghijklmnopqrstuvwxyz0123456789"; let s=""; for(let i=0;i<n;i++) s+=a[(Math.random()*a.length)|0]; return s; };

function cookieGet(req, name){
  const c = req.headers.cookie || "";
  const m = c.match(new RegExp("(?:^|;\\s*)"+name+"=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : "";
}
function cookieSet(res, name, val){
  res.setHeader("Set-Cookie", `${name}=${encodeURIComponent(val)}; Path=/; HttpOnly; SameSite=Lax`);
}
async function readBody(req){
  if (req.body) return req.body;
  let raw=""; await new Promise(r=>{ req.on("data",c=>raw+=c); req.on("end",r); });
  if(!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function me(req){
  const sid = cookieGet(req,"sid");
  const u = sid && DB.sessions[sid];
  return u ? DB.users[u] && u : null;
}

function page(title, body){
  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<title>${title}</title>
<style>
  :root{--bg:#071526;--card:rgba(255,255,255,.06);--b:rgba(255,255,255,.12);--t:#e9f4ff;--a:#38bdf8;--g:#22c55e;--r:#ef4444;}
  *{box-sizing:border-box} body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto;background:radial-gradient(900px 500px at 70% 0%,rgba(56,189,248,.22),transparent),var(--bg);color:var(--t)}
  .wrap{max-width:980px;margin:0 auto;padding:16px}
  .top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border:1px solid var(--b);border-radius:18px;background:var(--card);position:sticky;top:10px;backdrop-filter:blur(10px)}
  .brand{display:flex;align-items:center;gap:10px}
  .logo{width:44px;height:44px;border-radius:14px;background:radial-gradient(circle at 30% 30%,#7dd3fc, #1d4ed8);display:grid;place-items:center;font-weight:900}
  .name{font-weight:900;letter-spacing:.4px}
  .sub{opacity:.8;font-size:12px}
  .bear{width:70px;height:44px;position:relative;overflow:hidden}
  .bear:before{content:"🐻‍❄️";font-size:34px;position:absolute;left:0;top:2px;animation:bear 1.1s ease-in-out infinite}
  .bear:after{content:"🧊";font-size:26px;position:absolute;right:6px;top:10px;animation:ice 1.1s ease-in-out infinite}
  @keyframes bear{0%,100%{transform:translateX(0)}50%{transform:translateX(10px)}}
  @keyframes ice{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(10deg)}}
  .card{margin-top:14px;padding:14px;border:1px solid var(--b);border-radius:18px;background:var(--card)}
  .row{display:flex;gap:10px;flex-wrap:wrap}
  input,button{font:inherit}
  input{width:100%;padding:12px 12px;border-radius:14px;border:1px solid var(--b);background:rgba(0,0,0,.22);color:var(--t);outline:none}
  .btn{padding:12px 14px;border-radius:14px;border:1px solid var(--b);background:rgba(56,189,248,.18);color:var(--t);font-weight:800}
  .btnG{background:rgba(34,197,94,.18)}
  .btnR{background:rgba(239,68,68,.18)}
  .kpi{display:flex;gap:12px;flex-wrap:wrap}
  .pill{padding:10px 12px;border-radius:16px;border:1px solid var(--b);background:rgba(0,0,0,.18)}
  .bigActions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
  .big{padding:14px;border-radius:18px;border:1px solid var(--b);background:rgba(0,0,0,.18);font-weight:900}
  .big span{display:block;font-size:12px;opacity:.8;font-weight:700}
  @media (max-width:780px){.bigActions{grid-template-columns:1fr}}
  .qr{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .qr img{width:220px;max-width:100%;border-radius:16px;border:1px solid var(--b);background:#fff}
  .muted{opacity:.8;font-size:12px}
  .link{color:var(--a);text-decoration:none;font-weight:800}
</style></head><body><div class="wrap">${body}</div>
<script>
async function api(url, data){
  const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data||{})});
  return r.json();
}
async function postForm(action){
  const f = document.querySelector("form[data-action='"+action+"']");
  const data = Object.fromEntries(new FormData(f).entries());
  const out = await api("/api", { action, ...data });
  alert(out.ok ? (out.msg||"OK") : ("ERRO: "+(out.error||"")));
  if(out.reload) location.reload();
}
async function deposit(){
  const brl = Number(document.getElementById("dep_brl").value||0);
  const out = await api("/api", { action:"deposit_create", brl });
  if(!out.ok) return alert("ERRO: "+out.error);
  document.getElementById("payId").textContent = out.paymentId;
  document.getElementById("qrwrap").style.display="block";
  document.getElementById("qrimg").src = out.qr_code_base64 ? ("data:image/png;base64,"+out.qr_code_base64) : "";
  document.getElementById("qrcopy").value = out.qr_code || "";
}
async function paid(){
  const pid = document.getElementById("payId").textContent.trim();
  const out = await api("/api", { action:"deposit_confirm", paymentId: pid });
  if(!out.ok) return alert("ERRO: "+out.error);
  alert(out.msg);
  location.reload();
}
async function mine(){
  const btn=document.getElementById("mineBtn");
  btn.disabled=true; btn.textContent="Minerando bloco...";
  const out = await api("/api", { action:"mine" });
  btn.disabled=false; btn.textContent="⛏️ Minerar BLUE (Bloco)";
  alert(out.ok ? out.msg : ("ERRO: "+out.error));
  if(out.ok) location.reload();
}
</script></body></html>`;
}

function loginPage(){
  return page("ICE-CUBO", `
  <div class="top">
    <div class="brand">
      <div class="logo">IC</div>
      <div>
        <div class="name">ICE-CUBO <span class="muted">• BLUE</span></div>
        <div class="sub">Login & Cadastro</div>
      </div>
    </div>
    <div class="bear" title="urso tentando tirar a moeda (loop)"></div>
  </div>

  <div class="card">
    <div class="row">
      <div style="flex:1;min-width:220px">
        <h3 style="margin:0 0 10px">Entrar</h3>
        <form data-action="login" onsubmit="event.preventDefault();postForm('login')">
          <input name="username" placeholder="Usuário" required>
          <div style="height:10px"></div>
          <input name="pass" type="password" placeholder="Senha" required>
          <div style="height:10px"></div>
          <button class="btn btnG" type="submit">Entrar</button>
        </form>
      </div>

      <div style="flex:1;min-width:220px">
        <h3 style="margin:0 0 10px">Cadastrar</h3>
        <form data-action="signup" onsubmit="event.preventDefault();postForm('signup')">
          <input name="username" placeholder="Usuário" required>
          <div style="height:10px"></div>
          <input name="email" type="email" placeholder="Email" required>
          <div style="height:10px"></div>
          <input name="pass" type="password" placeholder="Senha" required>
          <div style="height:10px"></div>
          <input name="ref" placeholder="Indicação (opcional) ex: @thiago">
          <div style="height:10px"></div>
          <button class="btn" type="submit">Criar conta</button>
        </form>
        <div class="muted" style="margin-top:10px">
          Regra: 5% de cada depósito do seu “filho” é seu. Compartilhe seu link!
        </div>
      </div>
    </div>
  </div>
  `);
}

function appPage(username){
  const u = DB.users[username];
  const parent = u.parent ? "@"+u.parent : "sem pai";
  const shareLink = `?ref=@${encodeURIComponent(username)}`;
  return page("ICE-CUBO", `
  <div class="top">
    <div class="brand">
      <div class="logo">IC</div>
      <div>
        <div class="name">ICE-CUBO <span class="muted">• BLUE</span></div>
        <div class="sub">Logado como <b>@${username}</b> • pai: <b>${parent}</b></div>
      </div>
    </div>
    <div class="bear"></div>
  </div>

  <div class="card">
    <div class="kpi">
      <div class="pill"><b>Saldo:</b> ${Math.floor(u.blue)} BLUE</div>
      <div class="pill"><b>Email:</b> ${u.email}</div>
      <div class="pill"><b>Seu link:</b> <a class="link" href="${shareLink}">${shareLink}</a></div>
      <div class="pill"><button class="btn btnR" onclick="location.href='/api?logout=1'">Sair</button></div>
    </div>
  </div>

  <div class="card">
    <h3 style="margin:0 0 10px">Ações (em destaque)</h3>
    <div class="bigActions">
      <div class="big">💳 Depositar <span>Compra BLUE via PIX Mercado Pago</span></div>
      <div class="big">🏦 Sacar <span>Solicitar saque (mínimo ${MIN_WITHDRAW} BLUE)</span></div>
      <button id="mineBtn" class="big" onclick="mine()">⛏️ Minerar BLUE (Bloco)<span>1 bloco = ${MINE_REWARD} BLUE</span></button>
    </div>
  </div>

  <div class="card">
    <h3 style="margin:0 0 10px">Depósito (PIX)</h3>
    <div class="row">
      <div style="flex:1;min-width:220px">
        <input id="dep_brl" type="number" step="0.01" min="${MIN_DEPOSIT}" placeholder="Valor em R$ (ex: 1.00)">
        <div style="height:10px"></div>
        <button class="btn btnG" onclick="deposit()">Gerar QR Code</button>
        <div class="muted" style="margin-top:8px">Se R$0,05 falhar no MP, use R$1,00.</div>
      </div>
      <div id="qrwrap" style="display:none;flex:1;min-width:220px">
        <div class="pill">paymentId: <b id="payId"></b></div>
        <div class="qr" style="margin-top:10px">
          <img id="qrimg" alt="QR PIX"/>
          <div style="flex:1;min-width:220px">
            <div class="muted">Copia e cola PIX:</div>
            <input id="qrcopy" readonly>
            <div style="height:10px"></div>
            <button class="btn btnG" onclick="paid()">✅ JÁ PAGUEI (Confirmar)</button>
            <div class="muted" style="margin-top:8px">
              Quando aprovado, credita BLUE automático (85% pra você e 5% pro pai se existir).
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <h3 style="margin:0 0 10px">Saque</h3>
    <form data-action="withdraw" onsubmit="event.preventDefault();postForm('withdraw')">
      <input name="amount" type="number" min="${MIN_WITHDRAW}" step="1" placeholder="Quantidade em BLUE (mín ${MIN_WITHDRAW})" required>
      <div style="height:10px"></div>
      <input name="pix" placeholder="Sua chave PIX para receber" required>
      <div style="height:10px"></div>
      <button class="btn">Solicitar saque</button>
    </form>
    <div class="muted" style="margin-top:10px">No demo, o saque fica registrado. Pagamento real depois a gente integra.</div>
  </div>

  <div class="card">
    <h3 style="margin:0 0 10px">Perfis (demo)</h3>
    <div class="muted">Toque em um usuário para abrir o perfil dele (posts demo).</div>
    <div class="row" style="margin-top:10px">
      ${Object.keys(DB.users).slice(0,12).map(x=>`
        <button class="btn" onclick="location.href='/api?profile=${encodeURIComponent(x)}'">@${x}</button>
      `).join("") || "<div class='muted'>Sem usuários ainda</div>"}
    </div>
  </div>
  `);
}

function profilePage(viewer, target){
  const u = DB.users[target];
  if(!u) return page("Perfil", `<div class="card">Perfil não existe. <a class="link" href="/api">Voltar</a></div>`);
  return page("Perfil", `
    <div class="top">
      <div class="brand">
        <div class="logo">👤</div>
        <div>
          <div class="name">@${target}</div>
          <div class="sub">Saldo: <b>${Math.floor(u.blue)} BLUE</b> • pai: <b>${u.parent?("@"+u.parent):"sem pai"}</b></div>
        </div>
      </div>
      <a class="link" href="/api">Voltar</a>
    </div>

    <div class="card">
      <h3 style="margin:0 0 10px">Posts (demo)</h3>
      ${(u.posts||[]).length ? (u.posts.map(p=>`<div class="pill" style="margin-top:10px">${p}</div>`).join("")) :
        `<div class="muted">Ainda sem posts. (Depois a gente coloca fotos/vídeos de verdade.)</div>`}
    </div>

    ${viewer ? `<div class="card muted">Você está logado como @${viewer}</div>` : ""}
  `);
}

module.exports = async (req, res) => {
  try {
    // logout
    const url = new URL(req.url, "http://localhost");
    if (url.searchParams.get("logout")) {
      const sid = cookieGet(req,"sid");
      if (sid) delete DB.sessions[sid];
      cookieSet(res,"sid","");
      res.statusCode=302; res.setHeader("Location","/api"); return res.end();
    }

    // view profile
    const prof = url.searchParams.get("profile");
    const viewer = me(req);
    if (prof) {
      res.setHeader("Content-Type","text/html; charset=utf-8");
      return res.end(profilePage(viewer, prof));
    }

    // API actions
    if (req.method === "POST") {
      const body = await readBody(req);
      const action = body.action;

      // signup
      if (action === "signup") {
        const username = String(body.username||"").trim().replace(/^@/,"");
        const email = String(body.email||"").trim();
        const pass = String(body.pass||"");
        const ref = String(body.ref||"").trim().replace(/^\\?/,"").replace(/^ref=/,"").trim();
        const parent = ref ? ref.replace(/^@/,"") : (url.searchParams.get("ref")||"").replace(/^@/,"");

        if (!username || !email || !pass) return res.end(JSON.stringify({ok:false,error:"Preencha tudo"}));
        if (DB.users[username]) return res.end(JSON.stringify({ok:false,error:"Usuário já existe"}));

        DB.users[username] = { pass, email, parent: (parent && DB.users[parent]) ? parent : "", blue: 0, posts:[`Olá, eu sou @${username}!`] };

        // auto-login
        const sid = uid(28);
        DB.sessions[sid]=username;
        cookieSet(res,"sid",sid);

        res.setHeader("Content-Type","application/json");
        return res.end(JSON.stringify({ok:true,msg:"Conta criada!",reload:true}));
      }

      // login
      if (action === "login") {
        const username = String(body.username||"").trim().replace(/^@/,"");
        const pass = String(body.pass||"");
        const u = DB.users[username];
        if(!u || u.pass !== pass) return res.end(JSON.stringify({ok:false,error:"Login inválido"}));
        const sid = uid(28);
        DB.sessions[sid]=username;
        cookieSet(res,"sid",sid);
        res.setHeader("Content-Type","application/json");
        return res.end(JSON.stringify({ok:true,msg:"Logado!",reload:true}));
      }

      // must be logged for below
      const username = me(req);
      if (!username) {
        res.setHeader("Content-Type","application/json");
        return res.end(JSON.stringify({ok:false,error:"Faça login"}));
      }

      // deposit create -> calls /api/mp_create
      if (action === "
