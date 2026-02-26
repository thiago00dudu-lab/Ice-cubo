module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
<style>
:root{
  --bg:#071a2f; --card:#0b2645; --card2:#0d315a;
  --line:rgba(255,255,255,.10);
  --txt:#e9f5ff; --mut:#9cc9ea;
  --a:#38bdf8; --good:#16a34a; --warn:#f59e0b; --bad:#ef4444;
  --gold:#ffd700; --blue:#60a5fa;
}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:
  radial-gradient(900px 700px at 20% -10%, rgba(56,189,248,.18), transparent 60%),
  linear-gradient(180deg,#061427,var(--bg)); color:var(--txt); height:100vh; overflow:hidden;}
a{color:inherit}
#app{height:100vh;display:flex;flex-direction:column}
.topbar{
  height:64px; display:flex; align-items:center; justify-content:space-between;
  padding:10px 12px; gap:10px; border-bottom:1px solid var(--line);
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
}
.brand{display:flex;align-items:center;gap:10px;min-width:0}
.badge{
  width:42px;height:42px;border-radius:14px;display:grid;place-items:center;
  background:linear-gradient(145deg, rgba(56,189,248,.30), rgba(56,189,248,.10));
  border:1px solid rgba(56,189,248,.25);
  font-weight:1000; letter-spacing:.5px;
}
.brand b{display:block;letter-spacing:1px}
.brand small{display:block;color:var(--mut);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rightpill{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:16px;
  background:rgba(255,255,255,.06); border:1px solid var(--line); }
.coin{
  width:26px;height:26px;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 30% 30%, var(--blue), rgba(0,0,0,0));
  border:1px solid rgba(255,215,0,.55);
  box-shadow:0 0 0 2px rgba(255,215,0,.06) inset;
}
.coin span{color:var(--gold);font-weight:1000}
.main{flex:1; overflow:auto; padding:12px 12px 92px}
.card{
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border:1px solid var(--line); border-radius:18px; padding:14px;
  box-shadow:0 18px 45px rgba(0,0,0,.25);
  margin-bottom:12px;
}
.hr{height:1px;background:var(--line);margin:12px 0}
.row{display:flex;align-items:center;gap:10px}
.row.space{justify-content:space-between}
.tag{font-size:12px;color:var(--mut)}
.pill{
  display:inline-flex;gap:8px;align-items:center;padding:6px 10px;border-radius:999px;
  border:1px solid var(--line); background:rgba(255,255,255,.05); font-size:12px; color:var(--mut)
}
.pill b{color:var(--txt)}
.btn{
  border:0;border-radius:14px;padding:12px 12px;font-weight:900;cursor:pointer;
  background:rgba(56,189,248,.18); color:var(--txt);
  border:1px solid rgba(56,189,248,.25);
}
.btn:active{transform:translateY(1px)}
.btn.good{background:rgba(22,163,74,.20); border-color:rgba(22,163,74,.35)}
.btn.warn{background:rgba(245,158,11,.18); border-color:rgba(245,158,11,.35)}
.btn.bad{background:rgba(239,68,68,.18); border-color:rgba(239,68,68,.35)}
.inp,textarea{
  width:100%; background:rgba(255,255,255,.06); border:1px solid var(--line);
  color:var(--txt); border-radius:14px; padding:12px; outline:none;
}
textarea{min-height:90px; resize:none}
.hide{display:none}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.notice{
  padding:10px 12px;border-radius:14px;border:1px solid var(--line);
  background:rgba(255,255,255,.05); color:var(--mut);
}
.smallcards{display:flex;gap:10px;overflow:auto;padding-bottom:4px}
.small{min-width:190px}
.media{width:100%;border-radius:16px;overflow:hidden;border:1px solid var(--line); background:rgba(0,0,0,.25)}
.media video,.media img{display:block;width:100%;height:120px;object-fit:cover}
.stage{
  height:220px;border-radius:18px;border:1px solid var(--line);
  background:
   radial-gradient(700px 280px at 30% -20%, rgba(56,189,248,.22), transparent 60%),
   linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.05));
  position:relative;overflow:hidden;
}
.bubbles:before,.bubbles:after{
  content:"";position:absolute;inset:-40%;
  background:
    radial-gradient(circle, rgba(255,255,255,.20) 0 2px, transparent 3px) 0 0/120px 160px,
    radial-gradient(circle, rgba(255,255,255,.12) 0 1px, transparent 2px) 40px 20px/160px 160px;
  animation:float 16s linear infinite; opacity:.6;
}
.bubbles:after{animation-duration:22s;opacity:.35;transform:scale(1.2)}
@keyframes float{to{transform:translateY(-140px)}}
.stageInner{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px}
#stageMain{width:100%;height:100%;object-fit:cover;border-radius:16px;display:none}
#stageHint{text-align:center;color:rgba(255,255,255,.85)}
#stageHint b{display:block;font-size:18px;letter-spacing:1px}
#stageHint small{color:rgba(255,255,255,.65)}
.stageBar{
  position:absolute;left:12px;right:12px;bottom:12px;
  display:flex;gap:8px;align-items:center;justify-content:space-between;
}
.bigBtn{padding:12px 14px}
.nav{
  position:fixed;left:10px;right:10px;bottom:10px;height:72px;border-radius:22px;
  border:1px solid var(--line); background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
  display:flex;align-items:center;justify-content:space-around;
  box-shadow:0 18px 45px rgba(0,0,0,.35);
}
.nav button{
  width:20%;height:60px;background:transparent;border:0;color:var(--mut);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-weight:900;
}
.nav button i{font-size:18px}
.nav button.active{color:var(--a)}
.star-gold{color:var(--gold);filter:drop-shadow(0 0 6px rgba(255,215,0,.35))}
.star-blue{color:var(--blue);filter:drop-shadow(0 0 6px rgba(96,165,250,.35))}
</style>
</head>
<body>
<div id="app">
  <div class="topbar">
    <div class="brand">
      <div class="badge">IC</div>
      <div style="min-width:0">
        <b>ICE-CUBO</b>
        <small id="subtitle">Timeline · Perfil · Carteira</small>
      </div>
    </div>
    <div class="rightpill">
      <div class="coin"><span>฿</span></div>
      <div style="display:flex;flex-direction:column;line-height:1.05">
        <b><span id="blueBal">0</span> BLUE</b>
        <small class="tag" id="who">deslogado</small>
      </div>
    </div>
  </div>

  <div class="main">
    <!-- TIMELINE -->
    <div class="card" id="panelTimeline">
      <div class="stage bubbles">
        <div class="stageInner">
          <video id="stageMain" playsinline></video>
          <div id="stageHint">
            <b>Toque 2x em um vídeo</b>
            <small>ele sobe aqui pra tela grande</small>
          </div>
        </div>
        <div class="stageBar">
          <div class="pill"><i class="fa-solid fa-wand-magic-sparkles" style="color:var(--a)"></i>
            <span class="tag">Reels/Tinder: arrasta pro lado</span>
          </div>
          <button class="btn bigBtn" id="camBtn"><i class="fa-solid fa-camera"></i> Câmera</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="row space">
        <b><i class="fa-solid fa-timeline" style="color:var(--a)"></i> Timeline</b>
        <span class="tag">Camada 1: seguindo/filhos · Camada 2: todos</span>
      </div>

      <div class="smallcards" id="reelRow" style="margin-top:10px"></div>

      <div class="hr"></div>

      <div class="row space">
        <b>Todos</b>
        <span class="pill">posts <b id="postCount">0</b></span>
      </div>
      <div id="feed" style="margin-top:10px"></div>
    </div>

    <!-- PERFIL -->
    <div class="card hide" id="panelPerfil">
      <div class="row space">
        <b><i class="fa-solid fa-user" style="color:var(--a)"></i> Seu perfil</b>
        <span class="tag">poste foto/vídeo</span>
      </div>

      <div class="notice" id="loginBox" style="margin-top:12px">
        <div class="row space">
          <b>Entrar / Criar conta</b>
          <span class="tag">ADM intocável</span>
        </div>

        <div class="row" style="margin-top:10px">
          <input class="inp" id="lgUser" placeholder="Usuário"/>
          <input class="inp" id="lgPass" placeholder="Senha" type="password"/>
        </div>

        <div class="row" style="margin-top:10px">
          <button class="btn" id="btnLogin"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
          <button class="btn good" id="btnReg"><i class="fa-solid fa-user-plus"></i> Criar</button>
          <button class="btn bad hide" id="btnLogout"><i class="fa-solid fa-power-off"></i> Sair</button>
        </div>

        <div class="muted" style="margin-top:8px">
          Login ADM: <b>ADM</b> · Senha: <b>1533</b>
        </div>
      </div>

      <div class="hr"></div>

      <div class="row" style="margin-bottom:10px">
        <label class="btn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id="filePick" type="file" accept="image/*,video/*" style="display:none"/>
        </label>
        <button class="btn good" id="postBtn"><i class="fa-solid fa-upload"></i> Postar</button>
      </div>
      <div class="tag" id="pickInfo">Nenhum arquivo</div>

      <div class="hr"></div>

      <div class="row"><b><i class="fa-solid fa-users" style="color:var(--a)"></i> Seguindo</b>
        <span class="muted" id="followCount">0</span>
      </div>
      <div class="tag" id="followList" style="margin-top:6px">-</div>

      <div class="row" style="margin-top:10px"><b><i class="fa-solid fa-sitemap" style="color:var(--a)"></i> Filhos</b>
        <span class="muted" id="childCount">0</span>
      </div>
      <div class="tag" id="childList" style="margin-top:6px">-</div>

      <div class="hr"></div>

      <div class="row space"><b>Meus posts</b><span class="pill">itens <b id="myCount">0</b></span></div>
      <div class="grid" id="myPosts" style="margin-top:10px"></div>
    </div>

    <!-- CARTEIRA -->
    <div class="card hide" id="panelCarteira">
      <div class="row space">
        <b><i class="fa-solid fa-wallet" style="color:var(--a)"></i> Carteira</b>
        <span class="pill">BLUE <b id="blueBal2">0</b></span>
      </div>
      <div class="tag">Depósito / Saque (protótipo)</div>

      <div class="hr"></div>

      <div class="notice">
        <div class="row"><b>⚠ Importante</b><span class="tag">protótipo</span></div>
        <div style="margin-top:6px">
          Depósito real (Mercado Pago) e saque real automático exigem backend + compliance.
          Aqui vamos usar PIX real via API, e crédito de BLUE no app.
        </div>
      </div>

      <div class="hr"></div>

      <div class="row space">
        <b>Depósito</b>
        <span class="pill">BRL → BLUE</span>
      </div>
      <div class="tag" style="margin-top:6px">BRL = 1 BLUE (ajuste depois)</div>

      <div class="row" style="margin-top:10px">
        <input class="inp" id="depVal" placeholder="Valor (ex: 10)" inputmode="decimal"/>
        <button class="btn good" id="depMock"><i class="fa-solid fa-bolt"></i> Depósito rápido</button>
      </div>
      <div class="tag" id="depMsg" style="margin-top:8px"></div>

      <div class="hr"></div>

      <!-- PIX REAL -->
      <div class="row space">
        <b>Depósito real (PIX)</b>
        <span class="pill"><span class="tag">Mercado Pago</span></span>
      </div>
      <div class="tag" style="margin-top:6px">Gera QR Code e copia/cola. Credita quando aprovado.</div>

      <div class="row" style="margin-top:10px">
        <input class="inp" id="pixEmail" placeholder="Seu e-mail (obrigatório)" />
      </div>

      <div class="row" style="margin-top:10px">
        <input class="inp" id="pixVal" placeholder="Valor (ex: 10)" inputmode="decimal" />
        <button class="btn" id="pixBtn"><i class="fa-brands fa-pix"></i> Gerar PIX</button>
      </div>

      <div class="notice hide" id="pixBox" style="margin-top:12px">
        <div class="row space">
          <b>QR Code</b>
          <span class="tag" id="pixStatus">aguardando...</span>
        </div>

        <div class="row" style="margin-top:10px;align-items:flex-start">
          <img id="pixImg" style="width:140px;height:140px;border-radius:14px;border:1px solid var(--line);background:#fff"/>
          <div style="flex:1">
            <textarea id="pixCode" class="inp" style="min-height:140px" placeholder="código copia e cola"></textarea>
            <div class="row" style="margin-top:8px">
              <button class="btn" id="pixCopy"><i class="fa-solid fa-copy"></i> Copiar</button>
              <button class="btn bad" id="pixClose"><i class="fa-solid fa-xmark"></i> Fechar</button>
            </div>
          </div>
        </div>

        <div class="tag" id="pixMsg" style="margin-top:8px"></div>
      </div>

      <div class="hr"></div>

      <div class="row space">
        <b>Saque</b>
        <span class="pill">BLUE → pedido</span>
      </div>
      <div class="row" style="margin-top:10px">
        <input class="inp" id="saqVal" placeholder="Valor para sacar" inputmode="decimal"/>
        <button class="btn warn" id="saqReq"><i class="fa-solid fa-paper-plane"></i> Solicitar</button>
      </div>
      <div class="tag" id="saqMsg" style="margin-top:8px"></div>

      <div class="hr"></div>

      <div class="row space">
        <b>Histórico</b>
        <span class="pill">itens <b id="histCount">0</b></span>
      </div>
      <div id="hist" style="margin-top:10px"></div>
    </div>

    <!-- TROCAS -->
    <div class="card hide" id="panelTrocas">
      <div class="row space">
        <b><i class="fa-solid fa-repeat" style="color:var(--a)"></i> Trocas</b>
        <span class="tag">produto + oferta</span>
      </div>

      <div class="row" style="margin-top:10px">
        <input class="inp" id="swapTitle" placeholder="Nome do produto (ex: Tênis X)"/>
        <input class="inp" id="swapWant" placeholder="Quero em troca (ex: Moletom / BLUE)"/>
      </div>
      <div style="margin-top:10px">
        <textarea id="swapDesc" placeholder="Descrição rápida..."></textarea>
      </div>

      <div class="row" style="margin-top:10px">
        <label class="btn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-camera"></i> Foto/Vídeo
          <input id="swapFile" type="file" accept="image/*,video/*" style="display:none"/>
        </label>
        <button class="btn good" id="swapPost"><i class="fa-solid fa-bolt"></i> Publicar</button>
      </div>
      <div class="tag" id="swapPickInfo" style="margin-top:8px">Nenhum arquivo</div>

      <div class="hr"></div>
      <div class="row space"><b>Trocas publicadas</b><span class="pill">itens <b id="swapCount">0</b></span></div>
      <div class="grid" id="swapGrid" style="margin-top:10px"></div>
    </div>

    <!-- ADM -->
    <div class="card hide" id="panelADM">
      <div class="row space">
        <b><i class="fa-solid fa-shield-halved" style="color:var(--a)"></i> Painel ADM</b>
        <span class="tag">somente ADM</span>
      </div>

      <div class="hr"></div>

      <div class="row space">
        <b>Usuários</b>
        <span class="pill">total <b id="uCount">0</b></span>
      </div>
      <div id="uList" style="margin-top:10px;display:flex;flex-direction:column;gap:10px"></div>

      <div class="hr"></div>

      <div class="row space">
        <b>Pedidos de Saque</b>
        <span class="pill">itens <b id="wCount">0</b></span>
      </div>
      <div id="wList" style="margin-top:10px;display:flex;flex-direction:column;gap:10px"></div>
    </div>

  </div>

  <div class="nav">
    <button data-tab="timeline" class="active"><i class="fa-solid fa-house"></i><div>HOME</div></button>
