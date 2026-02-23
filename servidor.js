module.exports = (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).end(`<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg1:#dff3ff;--bg2:#bfe8ff;--bg3:#072445;--g:rgba(255,255,255,.55);--l:rgba(7,36,69,.18);--t:#06223f;--m:#2b587d;--a:#0ea5e9}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--t);height:100vh;overflow:hidden;
background:radial-gradient(1200px 700px at 15% -10%,rgba(255,255,255,.85),transparent 55%),
radial-gradient(900px 700px at 110% 20%,rgba(56,189,248,.25),transparent 60%),
linear-gradient(180deg,var(--bg1),var(--bg2) 45%,#7dd3fc 70%,#2aa9ff 86%,var(--bg3));
}
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.35;mix-blend-mode:multiply;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none'%3E%3Cpath d='M60 10c6 10 6 20 0 30c-6-10-6-20 0-30Z' fill='%230ea5e9' opacity='.35'/%3E%3Cpath d='M35 35c10 6 20 6 30 0c-10-6-20-6-30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Cpath d='M85 35c-10 6-20 6-30 0c10-6 20-6 30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Ccircle cx='22' cy='88' r='3' fill='%23ffffff' opacity='.35'/%3E%3Ccircle cx='35' cy='98' r='2' fill='%23ffffff' opacity='.25'/%3E%3Ccircle cx='48' cy='88' r='2' fill='%23ffffff' opacity='.2'/%3E%3Cpath d='M82 86c8-10 12-18 4-28c-9 6-14 12-4 28Z' fill='%230b5fa5' opacity='.22'/%3E%3Cpath d='M82 86c2-6 8-10 12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M82 86c-2-6-8-10-12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E");
background-size:140px 140px;
}
a{color:inherit}button{cursor:pointer}input,textarea{font:inherit}
#app{height:100vh;display:flex;flex-direction:column}
.top{height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:rgba(0,0,0,.08)}
.bub:before,.bub:after{content:"";position:absolute;inset:-20%;background:
radial-gradient(circle,rgba(255,255,255,.35) 0 2px,transparent 3px) 0 0/120px 120px,
radial-gradient(circle,rgba(255,255,255,.22) 0 1px,transparent 2px) 40px 20px/160px 160px;
animation:float 14s linear infinite;opacity:.55}
.bub:after{animation-duration:20s;opacity:.35;transform:scale(1.15)}
@keyframes float{to{transform:translateY(-120px)}}

.brand{position:absolute;top:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:3}
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.10)}
.brandname{display:flex;flex-direction:column;line-height:1.05}
.brandname b{letter-spacing:1.2px;font-size:15px}
.brandname small{color:var(--m);font-size:11px}

.pill{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px}
.coin{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#38bdf8,#0b2a6a);
border:1px solid rgba(255,215,0,.55);box-shadow:0 0 0 2px rgba(255,215,0,.18) inset}
.coin span{color:#ffd700;font-weight:1000}
.pill .meta{display:flex;flex-direction:column;line-height:1.05}
.pill .meta b{font-size:12px}
.pill .meta small{font-size:11px;color:var(--m)}

.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2}
#mainV{width:100%;height:100%;object-fit:cover;display:none}
#mainI{width:100%;height:100%;object-fit:cover;display:none}
#hint{position:absolute;inset:auto 12px 72px 12px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:18px;color:var(--m);text-align:center}

.stageBar{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:4}
.card{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:18px;min-width:0}
.av{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;font-weight:1000;background:linear-gradient(135deg,#38bdf8,#1d4ed8);position:relative;color:#fff}
.meta2{min-width:0}
.meta2 .name{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:8px}
.meta2 .sub{font-size:12px;color:var(--m);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.star{font-size:13px}
.star.gold{color:#ffd700;text-shadow:0 0 10px rgba(255,215,0,.35)}
.star.blue{color:#0ea5e9;text-shadow:0 0 10px rgba(14,165,233,.25)}
.sbtn{padding:10px 12px;border-radius:18px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);color:var(--t)}
.sbtn:active{transform:scale(.98)}

.bottom{flex:1;display:flex;flex-direction:column;gap:10px;padding:10px 10px 74px;overflow:hidden}
.carousel{display:flex;gap:10px;overflow:auto;scroll-snap-type:x mandatory;padding-bottom:4px}
.item{min-width:190px;max-width:190px;height:120px;border-radius:18px;overflow:hidden;border:1px solid var(--l);background:rgba(255,255,255,.35);scroll-snap-align:center;position:relative}
.item video,.item img{width:100%;height:100%;object-fit:cover;display:block}
.tag{position:absolute;left:8px;bottom:8px;padding:6px 10px;border:1px solid rgba(7,36,69,.18);background:rgba(255,255,255,.55);backdrop-filter:blur(8px);border-radius:14px;font-size:12px;display:flex;gap:8px;align-items:center;color:#053055}
.tag .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);color:#fff}
.item.active{outline:2px solid rgba(14,165,233,.9)}

.panel{flex:1;overflow:auto;border:1px solid var(--l);background:rgba(255,255,255,.55);backdrop-filter:blur(12px);border-radius:22px;padding:12px}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.hrow h3{margin:0;font-size:16px}
.muted{color:var(--m);font-size:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.post{border:1px solid var(--l);background:rgba(255,255,255,.35);border-radius:18px;overflow:hidden}
.post video,.post img{width:100%;height:140px;object-fit:cover;display:block}
.pbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px}
.badge{font-size:12px;color:var(--m);display:flex;align-items:center;gap:8px;min-width:0}
.badge .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);color:#fff;flex:0 0 auto;position:relative}
.badge b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:105px}
.chip{font-size:11px;padding:4px 8px;border-radius:999px;border:1px solid rgba(14,165,233,.25);background:rgba(14,165,233,.10);color:#075985}
.icon{border:0;background:transparent;color:#ef4444;padding:6px 8px;border-radius:12px}
.icon:active{transform:scale(.96)}

.nav{position:fixed;left:10px;right:10px;bottom:10px;display:flex;gap:10px;z-index:10}
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--l);background:rgba(255,255,255,.55);backdrop-filter:blur(14px);color:var(--t);display:flex;align-items:center;justify-content:center;gap:8px}
.nav button.active{outline:2px solid rgba(14,165,233,.9)}

.modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:flex-end;justify-content:center;z-index:20}
.sheet{width:min(760px,100%);max-height:86vh;border-radius:26px 26px 0 0;overflow:hidden;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.88);backdrop-filter:blur(18px)}
.sheetTop{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(7,36,69,.12)}
.sheetTop b{font-size:14px}
.sheetBody{padding:12px 12px 14px;overflow:auto;max-height:calc(86vh - 52px)}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.field{flex:1;min-width:180px}
.field input,.field textarea{width:100%;padding:12px;border-radius:18px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.75);color:var(--t);outline:none}
.field textarea{min-height:74px;resize:vertical}
hr{border:0;border-top:1px solid rgba(7,36,69,.12);margin:10px 0}

/* filtros */
.filt{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 10px}
.filt button{padding:8px 10px;border-radius:999px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.7)}
.filt button.on{outline:2px solid rgba(14,165,233,.9);background:rgba(14,165,233,.12)}

/* bear */
.bearWrap{width:44px;height:44px;border-radius:16px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.65);display:grid;place-items:center;overflow:hidden}
.bearWrap svg{width:44px;height:44px}
@keyframes paw{0%,100%{transform:translate(0,0) rotate(-3deg)}50%{transform:translate(2px,-1px) rotate(6deg)}}
@keyframes coin{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-1px)}}
.paw{transform-origin:24px 24px}.coinAnim{transform-origin:22px 26px}
.bearStage-grab .paw{animation:paw 1.1s ease-in-out infinite}
.bearStage-grab .coinAnim{animation:coin 1.1s ease-in-out infinite}
.crownBtn{padding:10px 12px;border-radius:18px;border:1px solid var(--l);background:rgba(255,255,255,.55)}
</style>
</head>
<body>
<div id="app">
  <div class="top bub">
    <div class="brand">
      <div class="logo">
        <div class="bearWrap bearStage-grab" title="urso + BLUE">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ice" x1="10" y1="20" x2="50" y2="54">
                <stop stop-color="#9ae6ff" stop-opacity=".9"/>
                <stop offset="1" stop-color="#1f4ed8" stop-opacity=".55"/>
              </linearGradient>
              <radialGradient id="gold" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(34 36) rotate(45) scale(18)">
                <stop stop-color="#ffeaa7"/><stop offset="1" stop-color="#ffb703"/>
              </radialGradient>
            </defs>
            <rect x="10" y="26" width="40" height="28" rx="6" fill="url(#ice)" stroke="rgba(255,255,255,.35)"/>
            <g class="coinAnim">
              <circle cx="30" cy="40" r="10" fill="url(#gold)" stroke="rgba(255,215,0,.65)"/>
              <path d="M30 33v14M24 36h10a4 4 0 0 1 0 8H24" stroke="#0b2a6a" stroke-width="3" stroke-linecap="round"/>
            </g>
            <g class="paw">
              <circle cx="50" cy="24" r="10" fill="rgba(255,255,255,.95)"/>
              <circle cx="44" cy="18" r="3" fill="rgba(255,255,255,.95)"/>
              <circle cx="56" cy="18" r="3" fill="rgba(255,255,255,.95)"/>
              <circle cx="50" cy="25" r="2" fill="#0b2a6a"/>
            </g>
          </svg>
        </div>
        <div class="brandname">
          <b>ICE-CUBO</b>
          <small>feed • trocas • seguidores</small>
        </div>
      </div>

      <div style="display:flex;gap:10px;align-items:center">
        <button class="crownBtn" id="adminBtn" title="ADM master"><i class="fa-solid fa-crown"></i></button>
        <div class="pill" title="BLUE (simulação)">
          <div class="coin"><span>B</span></div>
          <div class="meta">
            <b id="blueBal">0.000000 BLUE</b>
            <small id="blueInfo">cap 21.000.000</small>
          </div>
        </div>
      </div>
    </div>

    <div class="viewer">
      <div id="hint">Timeline + Trocas funcionando. Toque em um item para destacar.</div>
      <video id="mainV" playsinline controls></video>
      <img id="mainI" alt="">
    </div>

    <div class="stageBar">
      <div class="card" id="ownerCard">
        <div class="av" id="ownerAv">I</div>
        <div class="meta2">
          <div class="name" id="ownerName">ICE IA</div>
          <div class="sub" id="ownerSub">Toque no perfil para abrir</div>
        </div>
      </div>
      <button class="sbtn" id="mineBtn" title="Minerar BLUE (simulação)"><i class="fa-solid fa-hammer"></i></button>
    </div>
  </div>

  <div class="bottom">
    <div class="carousel" id="carousel"></div>

    <div class="panel" id="panelFeed">
      <div class="hrow"><h3><i class="fa-solid fa-film"></i> Timeline</h3><span class="muted">2 camadas</span></div>

      <div class="filt">
        <button id="fSeg" class="on"><i class="fa-solid fa-user-group"></i> Seguindo/Filhos</button>
        <button id="fTro"><i class="fa-solid fa-repeat"></i> Só Trocas</button>
        <button id="fAll"><i class="fa-solid fa-globe"></i> Todos</button>
      </div>

      <div class="muted" id="feedNote">Camada 1: seguindo/filhos • Camada 2: todos</div>

      <div style="font-weight:900;margin:10px 0 6px">Seguindo/Filhos</div>
      <div class="grid" id="feedGridFollow"></div>

      <div style="font-weight:900;margin:14px 0 6px">Todos</div>
      <div class="grid" id="feedGridAll"></div>
    </div>

    <div class="panel" id="panelHome" style="display:none">
      <div class="hrow"><h3><i class="fa-solid fa-user"></i> Seu perfil</h3><span class="muted">poste foto/vídeo</span></div>

      <div class="row" style="margin-bottom:10px">
        <label class="sbtn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id="filePick" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="sbtn" id="postBtn"><i class="fa-solid fa-upload"></i> Postar</button>
        <span class="muted" id="pickInfo">Nenhum arquivo</span>
      </div>

      <hr>
      <div class="hrow"><h3 style="font-size:14px;margin:0"><i class="fa-solid fa-user-plus"></i> Seguindo</h3><span class="muted" id="followCount">0</span></div>
      <div class="muted" id="followList">—</div>

      <hr>
      <div class="hrow"><h3 style="font-size:14px;margin:0"><i class="fa-solid fa-sitemap"></i> Filhos</h3><span class="muted" id="childCount">0</span></div>
      <div class="muted" id="childList">—</div>

      <hr>
      <div class="muted" style="margin-bottom:8px">Seus posts:</div>
      <div class="grid" id="myPosts"></div>
    </div>

    <div class="panel" id="panelSwap" style="display:none">
      <div class="hrow"><h3><i class="fa-solid fa-repeat"></i> Trocas</h3><span class="muted">produto + oferta</span></div>

      <div class="row">
        <div class="field"><input id="swapTitle" placeholder="Nome do produto (ex: Tênis X)"></div>
        <div class="field"><input id="swapWant" placeholder="Quero em troca (ex: Moletom / BLUE)"></div>
      </div>
      <div class="row" style="margin-top:8px">
        <div class="field"><textarea id="swapDesc" placeholder="Descrição rápida..."></textarea></div>
      </div>
      <div class="row" style="margin-top:8px;margin-bottom:10px">
        <label class="sbtn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-camera"></i> Foto/Vídeo
          <input id="swapFile" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="sbtn" id="swapPost"><i class="fa-solid fa-bolt"></i> Publicar troca</button>
        <span class="muted" id="swapPickInfo">Nenhum arquivo</span>
      </div>

      <hr>
      <div class="hrow"><h3 style="font-size:14px;margin:0"><i class="fa-solid fa-shop"></i> Trocas publicadas</h3><span class="muted" id="swapCount">0</span></div>
      <div class="grid" id="swapGrid"></div>
    </div>

    <div class="panel" id="panelHelp" style="display:none">
      <div class="hrow"><h3><i class="fa-solid fa-triangle-exclamation"></i> Perigo</h3><span class="muted">modo futuro</span></div>
      <div class="muted">Depois você liga alertas ON/OFF aqui.</div>
    </div>
  </div>
</div>

<!-- Modal: detalhe da troca -->
<div class="modal" id="modalSwap">
  <div class="sheet">
    <div class="sheetTop">
      <b id="swapTitleModal">Troca</b>
      <button class="sbtn" id="closeSwap"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="sheetBody">
      <div id="swapDetail"></div>
      <hr>
      <div id="swapOfferArea"></div>
      <hr>
      <div id="swapOffersList"></div>
    </div>
  </div>
</div>

<!-- Modal: perfil do usuário -->
<div class="modal" id="modalUser">
  <div class="sheet">
    <div class="sheetTop">
      <b id="userTitle">Usuário</b>
      <button class="sbtn" id="closeUser"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="sheetBody">
      <div id="userBody"></div>
    </div>
  </div>
</div>

<div class="nav">
  <button id="navFeed" class="active"><i class="fa-solid fa-film"></i><span>Feed</span></button>
  <button id="navHome"><i class="fa-solid fa-user"></i><span>Perfil</span></button>
  <button id="navSwap"><i class="fa-solid fa-repeat"></i><span>Trocas</span></button>
  <button id="navHelp"><i class="fa-solid fa-triangle-exclamation"></i><span>Perigo</span></button>
</div>

<script>
(function(){
  function $(id){ return document.getElementById(id); }
  function now(){ return Date.now(); }
  function uid(){ return now().toString(36) + Math.random().toString(16).slice(2); }
  function esc(s){
    s = s || "";
    return s.replace(/[&<>"]/g,function(m){
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" })[m];
    });
  }
  function fmt(ts){ return new Date(ts).toLocaleString().slice(0,16); }
  function toast(msg){ $("hint").textContent = msg; $("hint").style.display="block"; }

  var ROLE={USER:"user",MOD:"mod",ADM:"adm"};
  function starHtml(r){
    if(r===ROLE.ADM) return '<span class="star gold"><i class="fa-solid fa-star"></i></span>';
    if(r===ROLE.MOD) return '<span class="star blue"><i class="fa-solid fa-star"></i></span>';
    return "";
  }
  function mkAv(ch){ return ch || "U"; }

  var me={id:"me",name:"Você",avatar:"V",role:ROLE.USER};
  var ai={id:"iceai",name:"ICE IA",avatar:"I",role:ROLE.MOD};
  var fakes=[{id:"maya",name:"maya",avatar:"M",role:ROLE.USER},{id:"kadu",name:"kadu",avatar:"K",role:ROLE.MOD},{id:"adm",name:"ICE ADM",avatar:"A",role:ROLE.ADM}];

  var LS="icecubo_state_srv_fix_v1";
  var st=JSON.parse(localStorage.getItem(LS)||"null")||{
    my:[],
    feed:[],
    swaps:[],
    offers:[],
    follow:[ai.id,fakes[0].id],
    children:[fakes[1].id],
    admin:{isMaster:false},
    blue:{cap:21000000,blocks:0,bal:0,reward:50,halvEvery:210000,nextHalv:210000,minted:0}
  };
  function save(){ localStorage.setItem(LS,JSON.stringify(st)); }

  function seed(){
    if(!st.feed.length){
      st.feed = [
        {id:"seed1",type:"video",url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",owner:ai,ts:now()-60000},
        {id:"seed2",type:"video",url:"https://www.w3schools.com/html/mov_bbb.mp4",owner:fakes[1],ts:now()-120000},
        {id:"seed3",type:"image",url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60",owner:fakes[0],ts:now()-180000}
      ];
    }
    if(!st.swaps.length){
      var s0={id:"swap1",title:"Tênis (fictício)",desc:"Pouco usado. Tamanho 41.",want:"Moletom ou BLUE",owner:fakes[0],ts:now()-360000,
        media:{type:"image",url:"https://images.unsplash.com/photo-1528701800489-20be3c8dd6a3?auto=format&fit=crop&w=1200&q=60"}};
      var s1={id:"swap2",title:"Skate (fictício)",desc:"Deck ok, roda boa.",want:"Boné / camisa",owner:ai,ts:now()-240000,
        media:{type:"video",url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}};
      st.swaps=[s0,s1];
      st.feed.unshift({id:"feed_"+uid(),type
