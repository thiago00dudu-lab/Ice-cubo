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
      st.feed.unshift({id:"feed_"+uid(),type:s0.media.type,url:s0.media.url,owner:s0.owner,ts:s0.ts,swapId:s0.id});
      st.feed.unshift({id:"feed_"+uid(),type:s1.media.type,url:s1.media.url,owner:s1.owner,ts:s1.ts,swapId:s1.id});
    }
    save();
  }
  seed();

  var selected=null;
  var feedMode="seg";

  function setOwner(u){
    $("ownerAv").textContent = mkAv(u.avatar);
    $("ownerName").innerHTML = esc(u.name) + " " + starHtml(u.role);
    $("ownerSub").textContent = "Toque no perfil para abrir";
  }

  function showMedia(p){
    selected=p;
    $("hint").style.display="none";
    setOwner(p.owner||ai);
    var v=$("mainV"), i=$("mainI");
    v.pause(); v.removeAttribute("src"); v.load();
    v.style.display="none"; i.style.display="none";
    if(p.type==="video"){ v.src=p.url; v.style.display="block"; v.play().catch(function(){}); }
    else{ i.src=p.url; i.style.display="block"; }
    var kids = $("carousel").children;
    for(var k=0;k<kids.length;k++){
      kids[k].classList.toggle("active", kids[k].dataset.id===p.id);
    }
  }

  function blueRender(){
    var b=st.blue;
    var rem=Math.max(0,b.cap-b.minted);
    $("blueBal").textContent=(b.bal||0).toFixed(6)+" BLUE";
    $("blueInfo").innerHTML="minted <b>"+Math.floor(b.minted).toLocaleString("pt-BR")+"</b> • faltam <b>"+Math.floor(rem).toLocaleString("pt-BR")+"</b> • reward <b>"+b.reward+"</b>";
  }
  function blueMine(){
    var b=st.blue;
    if(b.minted>=b.cap){ toast("Cap 21.000.000 atingido."); return; }
    b.blocks++;
    var canMint=Math.min(b.reward,b.cap-b.minted);
    b.minted+=canMint; b.bal+=canMint;
    if(b.blocks>=b.nextHalv){
      b.reward=Math.max(0.00000001,b.reward/2);
      b.nextHalv+=b.halvEvery;
      toast("HALVING! reward agora "+b.reward);
    }else{
      toast("Minerou +"+canMint+" BLUE ✅");
    }
    save(); blueRender(); renderAll();
  }
  $("mineBtn").onclick=blueMine;

  function setTab(t){
    $("navFeed").classList.toggle("active",t==="feed");
    $("navHome").classList.toggle("active",t==="home");
    $("navSwap").classList.toggle("active",t==="swap");
    $("navHelp").classList.toggle("active",t==="help");
    $("panelFeed").style.display=t==="feed"?"block":"none";
    $("panelHome").style.display=t==="home"?"block":"none";
    $("panelSwap").style.display=t==="swap"?"block":"none";
    $("panelHelp").style.display=t==="help"?"block":"none";
  }
  $("navFeed").onclick=function(){setTab("feed");};
  $("navHome").onclick=function(){setTab("home");};
  $("navSwap").onclick=function(){setTab("swap");};
  $("navHelp").onclick=function(){setTab("help");};

  $("adminBtn").onclick=function(){
    var pass=prompt("Senha ADM master:");
    if(!pass) return;
    if(pass==="1234"){
      st.admin.isMaster=true; save();
      toast("ADM master ativo ✅");
    }else toast("Senha inválida.");
  };

  function openUserModal(u){
    $("userTitle").textContent="Perfil • @"+u.name;
    var fol = st.follow.indexOf(u.id)>=0;
    var chi = st.children.indexOf(u.id)>=0;

    $("userBody").innerHTML =
      '<div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">'+
      '<div class="av" style="width:54px;height:54px;border-radius:18px">'+mkAv(u.avatar)+'</div>'+
      '<div><div style="font-weight:1000;font-size:16px">@'+esc(u.name)+' '+starHtml(u.role)+'</div>'+
      '<div class="muted">ID: '+esc(u.id)+'</div></div></div>'+
      '<div class="row">'+
      '<button class="sbtn" id="btnFollow"><i class="fa-solid '+(fol?'fa-user-minus':'fa-user-plus')+'"></i> '+(fol?'Parar de seguir':'Seguir')+'</button>'+
      '<button class="sbtn" id="btnChild"><i class="fa-solid fa-sitemap"></i> '+(chi?'Remover filho':'Marcar como filho')+'</button>'+
      "</div>";

    $("btnFollow").onclick=function(){
      if(u.id===me.id){ toast("Você já é você 😄"); return; }
      if(fol) st.follow = st.follow.filter(function(x){return x!==u.id;});
      else st.follow.push(u.id);
      save(); $("modalUser").style.display="none"; renderAll();
    };
    $("btnChild").onclick=function(){
      if(u.id===me.id){ toast("Você não pode ser seu filho 😄"); return; }
      if(chi) st.children = st.children.filter(function(x){return x!==u.id;});
      else st.children.push(u.id);
      save(); $("modalUser").style.display="none"; renderAll();
    };

    $("modalUser").style.display="flex";
  }
  $("closeUser").onclick=function(){ $("modalUser").style.display="none"; };

  function openSwapModal(swapId){
    var s = st.swaps.find(function(x){return x.id===swapId;});
    if(!s){ toast("Troca não encontrada."); return; }

    $("swapTitleModal").textContent = "Troca • " + s.title;
    $("modalSwap").style.display="flex";

    var mediaHtml = (s.media.type==="video")
      ? '<video muted playsinline controls src="'+esc(s.media.url)+'"></video>'
      : '<img src="'+esc(s.media.url)+'" alt="">';

    $("swapDetail").innerHTML =
      '<div class="post">'+mediaHtml+
      '<div class="pbar"><span class="badge"><span class="mini">'+mkAv(s.owner.avatar)+'</span><b>@'+esc(s.owner.name)+'</b> '+starHtml(s.owner.role)+' • '+fmt(s.ts)+'</span><span class="chip">TROCA</span></div>'+
      '<div style="padding:10px"><div style="font-weight:900;margin-bottom:4px">'+esc(s.title)+'</div>'+
      '<div class="muted" style="margin-bottom:6px">'+esc(s.desc)+'</div>'+
      '<div class="muted"><b>Quer em troca:</b> '+esc(s.want)+'</div></div></div>';

    if(s.owner.id!==me.id){
      $("swapOfferArea").innerHTML =
        '<div style="font-weight:900;margin-bottom:6px">Sua oferta (texto)</div>'+
        '<div class="row"><div class="field"><textarea id="offerDesc" placeholder="Descreva o que você oferece"></textarea></div></div>'+
        '<div class="row" style="margin-top:8px"><button class="sbtn" id="sendOffer"><i class="fa-solid fa-handshake"></i> Enviar oferta</button></div>';

      $("sendOffer").onclick=function(){
        var d = ($("offerDesc").value||"").trim();
        if(!d){ toast("Descreva sua oferta."); return; }
        st.offers.unshift({id:"o_"+uid(),swapId:swapId,from:me,desc:d,ts:now(),status:"pending"});
        save(); toast("Oferta enviada ✅"); renderSwapOffers(swapId);
      };
    } else {
      $("swapOfferArea").innerHTML = '<div class="muted">Você é o dono. Abaixo aparecem ofertas pra aceitar/recusar.</div>';
    }

    renderSwapOffers(swapId);
  }
  $("closeSwap").onclick=function(){ $("modalSwap").style.display="none"; };

  function renderSwapOffers(swapId){
    var s = st.swaps.find(function(x){return x.id===swapId;});
    var offers = st.offers.filter(function(o){return o.swapId===swapId;}).sort(function(a,b){return b.ts-a.ts;});
    if(!offers.length){ $("swapOffersList").innerHTML='<div class="muted">Sem ofertas ainda.</div>'; return; }

    var html='<div style="font-weight:900;margin-bottom:6px">Ofertas ('+offers.length+')</div>';
    offers.forEach(function(o){
      html += '<div class="post" style="margin-bottom:10px">'+
      '<div class="pbar"><span class="badge"><span class="mini">'+mkAv(o.from.avatar)+'</span><b>@'+esc(o.from.name)+'</b> '+starHtml(o.from.role)+' • '+fmt(o.ts)+'</span>'+
      '<span class="chip">'+(o.status==="pending"?"PENDENTE":(o.status==="accepted"?"ACEITA":"RECUSADA"))+'</span></div>'+
      '<div style="padding:10px"><div class="muted">'+esc(o.desc)+'</div></div>';

      if(s.owner.id===me.id && o.status==="pending"){
        html += '<div class="row" style="padding:0 10px 10px">'+
          '<button class="sbtn" data-acc="'+o.id+'"><i class="fa-solid fa-check"></i> Aceitar</button>'+
          '<button class="sbtn" data-rej="'+o.id+'"><i class="fa-solid fa-xmark"></i> Recusar</button>'+
        "</div>";
      }

      html += "</div>";
    });

    $("swapOffersList").innerHTML = html;

    var acc = $("swapOffersList").querySelectorAll("[data-acc]");
    for(var i=0;i<acc.length;i++){
      acc[i].onclick=function(){
        var id=this.getAttribute("data-acc");
        st.offers.forEach(function(x){
          if(x.swapId===swapId){
            if(x.id===id) x.status="accepted";
            else if(x.status==="pending") x.status="rejected";
          }
        });
        save(); toast("Troca aceita ✅"); renderSwapOffers(swapId); renderAll();
      };
    }
    var rej = $("swapOffersList").querySelectorAll("[data-rej]");
    for(var j=0;j<rej.length;j++){
      rej[j].onclick=function(){
        var id=this.getAttribute("data-rej");
        var o=st.offers.find(function(x){return x.id===id;});
        if(o){ o.status="rejected"; save(); toast("Oferta recusada."); renderSwapOffers(swapId); renderAll(); }
      };
    }
  }

  // Upload simples local (preview) — salva como blob URL (demo)
  var pickedFile=null;
  $("filePick").onchange=function(e){
    pickedFile = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    $("pickInfo").textContent = pickedFile ? (pickedFile.name+" • "+Math.round(pickedFile.size/1024)+"KB") : "Nenhum arquivo";
  };
  $("postBtn").onclick=function(){
    if(!pickedFile){ toast("Selecione um arquivo."); return; }
    var type = pickedFile.type.indexOf("video")===0 ? "video" : "image";
    var url = URL.createObjectURL(pickedFile);
    st.my.unshift({id:"my_"+uid(),type:type,url:url,owner:me,ts:now()});
    save();
    pickedFile=null; $("filePick").value=""; $("pickInfo").textContent="Postado ✅";
    toast("Post publicado ✅"); renderAll();
  };

  var pickedSwap=null;
  $("swapFile").onchange=function(e){
    pickedSwap = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    $("swapPickInfo").textContent = pickedSwap ? (pickedSwap.name+" • "+Math.round(pickedSwap.size/1024)+"KB") : "Nenhum arquivo";
  };
  $("swapPost").onclick=function(){
    var title=($("swapTitle").value||"").trim();
    var want=($("swapWant").value||"").trim();
    var desc=($("swapDesc").value||"").trim();
    if(!title||!want||!desc){ toast("Preencha nome, descrição e o que quer."); return; }
    if(!pickedSwap){ toast("Adicione foto/vídeo do produto."); return; }
    var type = pickedSwap.type.indexOf("video")===0 ? "video" : "image";
    var url = URL.createObjectURL(pickedSwap);
    var swapId="s_"+uid();
    var s={id:swapId,title:title,desc:desc,want:want,owner:me,ts:now(),media:{type:type,url:url}};
    st.swaps.unshift(s);
    st.feed.unshift({id:"feed_"+uid(),type:type,url:url,owner:me,ts:s.ts,swapId:swapId});
    save();
    $("swapTitle").value="";$("swapWant").value="";$("swapDesc").value="";
    pickedSwap=null; $("swapFile").value=""; $("swapPickInfo").textContent="Publicado ✅";
    toast("Troca publicada ✅"); renderAll();
  };

  function setFeedMode(m){
    feedMode=m;
    $("fSeg").classList.toggle("on",m==="seg");
    $("fTro").classList.toggle("on",m==="tro");
    $("fAll").classList.toggle("on",m==="all");
    renderAll();
  }
  $("fSeg").onclick=function(){setFeedMode("seg");};
  $("fTro").onclick=function(){setFeedMode("tro");};
  $("fAll").onclick=function(){setFeedMode("all");};

  function renderFollowLists(){
    $("followCount").textContent = st.follow.length;
    $("childCount").textContent  = st.children.length;

    function mapU(id){
      var all=[me,ai].concat(fakes);
      for(var i=0;i<all.length;i++) if(all[i].id===id) return all[i];
      return {id:id,name:id,avatar:"?",role:ROLE.USER};
    }
    $("followList").textContent = st.follow.length ? st.follow.map(function(id){return "@"+mapU(id).name;}).join(", ") : "—";
    $("childList").textContent  = st.children.length ? st.children.map(function(id){return "@"+mapU(id).name;}).join(", ") : "—";
  }

  function renderPostCard(p, parent){
    var c=document.createElement("div");
    c.className="post";
    c.innerHTML = (p.type==="video")
      ? '<video muted playsinline src="'+esc(p.url)+'"></video>'
      : '<img src="'+esc(p.url)+'" alt="">';

    var bar=document.createElement("div");
    bar.className="pbar";
    bar.innerHTML =
      '<span class="badge"><span class="mini">'+mkAv(p.owner.avatar)+'</span><b>@'+esc(p.owner.name)+'</b> '+starHtml(p.owner.role)+' • '+fmt(p.ts)+
      (p.swapId?' <span class="chip" style="margin-left:6px">TROCA</span>':"")+
      '</span>'+
      '<div style="display:flex;gap:8px;align-items:center">'+
      (p.swapId?'<button class="sbtn" data-swap="1" style="padding:8px 10px"><i class="fa-solid fa-handshake"></i></button>':"")+
      '<button class="sbtn" data-prof="1" style="padding:8px 10px" title="perfil"><i class="fa-solid fa-user"></i></button>'+
      '<button class="icon" data-hi="1" title="destacar" style="color:#0ea5e9"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>'+
      "</div>";

    c.appendChild(bar);

    var profBtn=bar.querySelector("[data-prof]");
    profBtn.onclick=function(){ openUserModal(p.owner); };

    var hiBtn=bar.querySelector("[data-hi]");
    hiBtn.onclick=function(){ showMedia(p); };

    var swBtn=bar.querySelector("[data-swap]");
    if(swBtn) swBtn.onclick=function(){ openSwapModal(p.swapId); };

    parent.appendChild(c);
  }

  function renderSwaps(){
    $("swapGrid").innerHTML="";
    $("swapCount").textContent = st.swaps.length + " trocas";
    st.swaps.slice(0,60).forEach(function(s){
      var c=document.createElement("div");
      c.className="post";
      c.innerHTML = (s.media.type==="video")
        ? '<video muted playsinline src="'+esc(s.media.url)+'"></video>'
        : '<img src="'+esc(s.media.url)+'" alt="">';
      var bar=document.createElement("div");
      bar.className="pbar";
      bar.innerHTML =
        '<span class="badge"><span class="mini">'+mkAv(s.owner.avatar)+'</span><b>@'+esc(s.owner.name)+'</b> '+starHtml(s.owner.role)+' • '+fmt(s.ts)+' <span class="chip" style="margin-left:6px">TROCA</span></span>'+
        '<button class="sbtn" style="padding:8px 10px"><i class="fa-solid fa-handshake"></i></button>';
      bar.querySelector("button").onclick=function(){ openSwapModal(s.id); };
      c.appendChild(bar);
      var info=document.createElement("div");
      info.style.padding="10px";
      info.innerHTML =
        '<div style="font-weight:900;margin-bottom:4px">'+esc(s.title)+'</div>'+
        '<div class="muted" style="margin-bottom:6px">'+esc(s.desc)+'</div>'+
        '<div class="muted"><b>Quer:</b> '+esc(s.want)+'</div>';
      c.appendChild(info);
      $("swapGrid").appendChild(c);
    });
  }

  function renderAll(){
    blueRender();
    renderFollowLists();

    // junta feed + meus posts
    var all = st.feed.slice().concat(st.my.slice()).sort(function(a,b){return b.ts-a.ts;});

    // carousel
    $("carousel").innerHTML="";
    all.slice(0,30).forEach(function(p){
      var div=document.createElement("div");
      div.className="item"+(selected&&selected.id===p.id?" active":"");
      div.dataset.id=p.id;
      div.innerHTML = (p.type==="video")
        ? '<video muted playsinline src="'+esc(p.url)+'"></video>'
        : '<img src="'+esc(p.url)+'" alt="">';
      var tag=document.createElement("div");
      tag.className="tag";
      tag.innerHTML = '<span class="mini">'+mkAv(p.owner.avatar)+'</span>@'+esc(p.owner.name)+' '+starHtml(p.owner.role)+(p.swapId?' <span class="chip">TROCA</span>':"");
      div.appendChild(tag);
      div.onclick=function(){
        showMedia(p);
        if(p.swapId && feedMode==="tro") openSwapModal(p.swapId);
      };
      $("carousel").appendChild(div);
    });

    var followSet = {};
    st.follow.forEach(function(x){ followSet[x]=1; });
    var childSet = {};
    st.children.forEach(function(x){ childSet[x]=1; });

    function isTrade(p){ return !!p.swapId; }
    function inFollowLayer(p){
      if(p.owner.id===me.id) return true;
      return !!followSet[p.owner.id] || !!childSet[p.owner.id];
    }

    var onlyTrades = (feedMode==="tro");
    var followLayer = all.filter(function(p){ return (!onlyTrades || isTrade(p)) && inFollowLayer(p); });
    var allLayer    = all.filter(function(p){ return (!onlyTrades || isTrade(p)); });

    if(feedMode==="all") $("feedNote").textContent="Modo Todos: tudo aparece nas duas camadas.";
    else if(feedMode==="tro") $("feedNote").textContent="Modo Só Trocas: só posts marcados como TROCA.";
    else $("feedNote").textContent="Camada 1: Seguindo/Filhos • Camada 2: Todos.";

    $("feedGridFollow").innerHTML="";
    $("feedGridAll").innerHTML="";

    (feedMode==="all"?allLayer:followLayer).slice(0,60).forEach(function(p){ renderPostCard(p,$("feedGridFollow")); });
    allLayer.slice(0,60).forEach(function(p){ renderPostCard(p,$("feedGridAll")); });

    // meus posts no perfil
    $("myPosts").innerHTML = st.my.length ? "" : '<div class="muted">Sem posts ainda.</div>';
    st.my.forEach(function(p){
      var c=document.createElement("div");
      c.className="post";
      c.innerHTML = (p.type==="video")
        ? '<video muted playsinline src="'+esc(p.url)+'"></video>'
        : '<img src="'+esc(p.url)+'" alt="">';
      var bar=document.createElement("div");
      bar.className="pbar";
      bar.innerHTML = '<span class="badge"><span class="mini">'+mkAv(me.avatar)+'</span><b>Seu post</b> • '+fmt(p.ts)+'</span>'+
                      '<button class="icon" title="apagar"><i class="fa-solid fa-trash"></i></button>';
      bar.querySelector("button").onclick=function(){
        st.my = st.my.filter(function(x){ return x.id!==p.id; });
        save(); toast("Post apagado ✅"); renderAll();
      };
      c.appendChild(bar);
      $("myPosts").appendChild(c);
    });

    renderSwaps();

    if(!selected && all[0]) showMedia(all[0]);
  }

  renderAll();
})();
</script>
</body>
</html>`);
};
