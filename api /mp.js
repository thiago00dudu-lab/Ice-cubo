<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
  <title>ICE-CUBO</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    :root{
      --bg:#061428;--glass:rgba(255,255,255,.08);--glass2:rgba(255,255,255,.12);
      --line:rgba(255,255,255,.16);--txt:#eaf2ff;--mut:#b7c7e6;--acc:#38bdf8;
      --bad:#fb7185;--ok:#22c55e;
    }
    *{box-sizing:border-box}
    body{
      margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
      background:
        radial-gradient(1200px 600px at 20% -10%,rgba(56,189,248,.18),transparent 60%),
        radial-gradient(900px 600px at 110% 30%,rgba(99,102,241,.14),transparent 55%),
        linear-gradient(180deg,#031024,#071b33 60%,#041226);
      color:var(--txt);height:100vh;overflow:hidden;
    }
    button{color:inherit;cursor:pointer}
    a{color:var(--acc);text-decoration:none}
    #app{height:100vh;display:flex;flex-direction:column}

    /* TOP */
    .top{height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:#000}
    .bgSea{position:absolute;inset:0;opacity:.45;filter:saturate(1.15);
      background:
        radial-gradient(circle at 10% 20%,rgba(56,189,248,.18),transparent 35%),
        radial-gradient(circle at 80% 10%,rgba(59,130,246,.16),transparent 35%),
        radial-gradient(circle at 30% 80%,rgba(34,211,238,.14),transparent 35%),
        linear-gradient(180deg,#021024,#041a35);
    }
    .bubbles:before,.bubbles:after{
      content:"";position:absolute;inset:-20%;
      background:
        radial-gradient(circle,rgba(255,255,255,.22) 0 2px,transparent 3px) 0 0/120px 120px,
        radial-gradient(circle,rgba(255,255,255,.16) 0 1px,transparent 2px) 40px 20px/160px 160px;
      animation:float 14s linear infinite;opacity:.55
    }
    .bubbles:after{animation-duration:20s;opacity:.35;transform:scale(1.15)}
    @keyframes float{to{transform:translateY(-120px)}}

    .marca{position:absolute;top:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:3}
    .logo,.pill{
      display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);
      background:var(--glass);backdrop-filter:blur(10px);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.25)
    }
    .logo b{letter-spacing:1px}
    .pill{gap:8px}
    .pill .coin{
      width:26px;height:26px;border-radius:50%;display:grid;place-items:center;
      background:radial-gradient(circle at 30% 30%,#0ea5e9,#0b2a6a);
      border:1px solid rgba(255,215,0,.55);box-shadow:0 0 0 2px rgba(255,215,0,.18) inset
    }
    .pill .coin span{color:#ffd700;font-weight:900}

    .viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2}
    #hint{
      position:absolute;left:12px;right:12px;bottom:72px;padding:10px 12px;border:1px solid var(--line);
      background:var(--glass);backdrop-filter:blur(12px);border-radius:18px;color:var(--mut);text-align:center
    }

    /* CONTENT */
    .content{flex:1;display:flex;flex-direction:column;gap:10px;padding:12px}
    .card{
      border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(10px);
      border-radius:18px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,.18)
    }
    .tabs{display:flex;gap:10px}
    .tab{
      flex:1;padding:10px;border-radius:16px;border:1px solid var(--line);
      background:rgba(0,0,0,.18);text-align:center;font-weight:800;color:var(--mut)
    }
    .tab.on{background:rgba(56,189,248,.18);color:var(--txt);border-color:rgba(56,189,248,.35)}
    .muted{color:var(--mut)}
    .btnRow{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
    .btn{
      padding:10px 12px;border-radius:16px;border:1px solid var(--line);
      background:rgba(56,189,248,.15);font-weight:800
    }
    .btn.ghost{background:rgba(0,0,0,.18);color:var(--txt)}
    .msg{margin-top:10px;padding:10px 12px;border-radius:16px;border:1px solid rgba(251,113,133,.35);background:rgba(251,113,133,.12);color:#ffd3dc;display:none}
    .msg.ok{border-color:rgba(34,197,94,.35);background:rgba(34,197,94,.12);color:#c9f7dc}

    /* BOTTOM NAV */
    .nav{
      height:72px;display:flex;gap:10px;padding:10px 12px;border-top:1px solid var(--line);
      background:rgba(0,0,0,.18);backdrop-filter:blur(10px)
    }
    .nav button{
      flex:1;border-radius:18px;border:1px solid var(--line);
      background:rgba(255,255,255,.06);font-weight:900;color:var(--mut);
      display:flex;align-items:center;justify-content:center;gap:8px
    }
    .nav button.on{background:rgba(56,189,248,.18);color:var(--txt);border-color:rgba(56,189,248,.35)}
  </style>
</head>
<body>
<div id="app">
  <div class="top">
    <div class="bgSea"></div>
    <div class="bubbles"></div>

    <div class="marca">
      <div class="logo">
        <div style="width:28px;height:28px;border-radius:10px;background:rgba(56,189,248,.25);display:grid;place-items:center;border:1px solid rgba(56,189,248,.35)"><b>I</b></div>
        <div>
          <b>ICE</b><div class="muted" style="font-size:12px">Rede social / Lives</div>
        </div>
      </div>

      <div class="pill" id="pillRight">
        <div class="coin"><span>B</span></div>
        <b>BLUE</b>
        <span class="muted" style="font-size:12px">PIX desativado</span>
      </div>
    </div>

    <div class="viewer">
      <div id="hint">Topo do app (vídeo/câmera depois). Por enquanto é tela de destaque.</div>
    </div>
  </div>

  <div class="content">
    <div class="card">
      <div class="tabs">
        <div class="tab on" id="tabHome">Home</div>
        <div class="tab" id="tabFeed">Feed</div>
        <div class="tab" id="tabLive">Live</div>
      </div>

      <div style="margin-top:10px">
        <div id="screenHome">
          <h3 style="margin:6px 0 6px">ICE-CUBO (sem PIX)</h3>
          <div class="muted">Versão só pra confirmar que o site abre e navega sem travar.</div>

          <div class="btnRow">
            <button class="btn" id="btnTest">Testar UI</button>
            <button class="btn ghost" id="btnAlert">Abrir aviso</button>
          </div>

          <div class="msg" id="msgBox"></div>
        </div>

        <div id="screenFeed" style="display:none">
          <h3 style="margin:6px 0 6px">Feed (mock)</h3>
          <div class="muted">Aqui depois entram posts, curtidas e comentários.</div>
          <div class="card" style="margin-top:10px">
            <b>Post exemplo</b>
            <div class="muted" style="margin-top:6px">“Isso aqui é um placeholder só pra testar navegação.”</div>
            <div class="btnRow">
              <button class="btn ghost" onclick="like()">Curtir 👍</button>
              <button class="btn ghost" onclick="share()">Compartilhar ⤴</button>
            </div>
          </div>
        </div>

        <div id="screenLive" style="display:none">
          <h3 style="margin:6px 0 6px">Live (mock)</h3>
          <div class="muted">Depois a gente liga câmera e faz o player aqui.</div>
          <div class="btnRow">
            <button class="btn ghost" onclick="alert('Câmera entra depois ✅')">Abrir câmera</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="nav">
    <button class="on" id="navHome"><i class="fa-solid fa-house"></i> Home</button>
    <button id="navPix" title="PIX desativado"><i class="fa-solid fa-qrcode"></i> PIX</button>
    <button id="navLive"><i class="fa-solid fa-video"></i> Live</button>
  </div>
</div>

<script>
  const tabHome = document.getElementById("tabHome");
  const tabFeed = document.getElementById("tabFeed");
  const tabLive = document.getElementById("tabLive");

  const navHome = document.getElementById("navHome");
  const navPix  = document.getElementById("navPix");
  const navLive = document.getElementById("navLive");

  const screenHome = document.getElementById("screenHome");
  const screenFeed = document.getElementById("screenFeed");
  const screenLive = document.getElementById("screenLive");

  function setOn(el, on){ el.classList.toggle("on", !!on); }

  function show(which){
    screenHome.style.display = which==="home" ? "block":"none";
    screenFeed.style.display = which==="feed" ? "block":"none";
    screenLive.style.display = which==="live" ? "block":"none";

    setOn(tabHome, which==="home");
    setOn(tabFeed, which==="feed");
    setOn(tabLive, which==="live");

    setOn(navHome, which==="home" || which==="feed");
    setOn(navLive, which==="live");
  }

  tabHome.onclick = ()=>show("home");
  tabFeed.onclick = ()=>show("feed");
  tabLive.onclick = ()=>show("live");

  navHome.onclick = ()=>show("home");
  navLive.onclick = ()=>show("live");

  // PIX desativado
  navPix.onclick = ()=> {
    alert("PIX está desativado por enquanto. Primeiro vamos deixar o app 100% estável ✅");
  };

  // Botões home
  const msgBox = document.getElementById("msgBox");
  document.getElementById("btnTest").onclick = ()=>{
    msgBox.className = "msg ok";
    msgBox.style.display = "block";
    msgBox.textContent = "UI OK ✅ Site carregou, navegação funcionando.";
  };
  document.getElementById("btnAlert").onclick = ()=>alert("App abrindo normal ✅");

  // Mock actions
  function like(){ alert("Curtiu ✅ (mock)"); }
  function share(){ alert("Compartilhar ✅ (mock)"); }
</script>
</body>
</html>
