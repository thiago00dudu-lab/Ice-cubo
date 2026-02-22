const express=require("express"),app=express();
app.get("/favicon.ico",(q,s)=>s.status(204).end());
app.get("/favicon.png",(q,s)=>s.status(204).end());

app.get("/",(req,res)=>res.status(200).set("Content-Type","text/html; charset=utf-8").send(`<!doctype html><html lang=pt-br><head>
<meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ICE-CUBO</title>
<link rel=stylesheet href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg1:#031024;--bg2:#071b33;--glass:rgba(255,255,255,.08);--glass2:rgba(255,255,255,.12);--line:rgba(255,255,255,.16);--txt:#eaf2ff;--mut:#b7c7e6;--acc:#38bdf8;--ok:#22c55e;--bad:#ff6b6b}
*{box-sizing:border-box}html,body{height:100%}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--txt);overflow:hidden;
background:radial-gradient(1200px 600px at 20% -10%,rgba(56,189,248,.18),transparent 60%),radial-gradient(900px 600px at 110% 30%,rgba(99,102,241,.14),transparent 55%),linear-gradient(180deg,var(--bg1),var(--bg2) 60%,#041226)}
a{color:inherit}button{cursor:pointer}
#app{height:100vh;display:flex;flex-direction:column}
.top{height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:#000}
.bgSea{position:absolute;inset:0;opacity:.55;filter:saturate(1.25);
background:radial-gradient(circle at 12% 18%,rgba(56,189,248,.20),transparent 40%),
radial-gradient(circle at 86% 16%,rgba(59,130,246,.18),transparent 42%),
radial-gradient(circle at 30% 85%,rgba(34,211,238,.16),transparent 42%),
linear-gradient(180deg,#021024,#041a35)}
/* ===== Fundo do mar (SVG patterns) ===== */
.seaIcons{position:absolute;inset:-6%;opacity:.45;mix-blend-mode:screen;filter:drop-shadow(0 10px 30px rgba(0,0,0,.25))}
.seaIcons:before,.seaIcons:after{content:"";position:absolute;inset:0;background-repeat:repeat;background-size:320px 320px;animation:drift 32s linear infinite}
.seaIcons:before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cdefs%3E%3CradialGradient id='g' cx='30%25' cy='30%25'%3E%3Cstop offset='0' stop-color='%2338bdf8' stop-opacity='.55'/%3E%3Cstop offset='1' stop-color='%23000000' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='none'/%3E%3Cg fill='none' stroke='%23bfe9ff' stroke-opacity='.38' stroke-width='2'%3E%3Cpath d='M70 250c25-30 25-70 0-100-25 30-25 70 0 100z'/%3E%3Cpath d='M240 95c22 16 44 16 66 0-22-16-44-16-66 0z'/%3E%3Cpath d='M220 240c-10-25-30-40-55-45 10 25 30 40 55 45z'/%3E%3C/g%3E%3Cg%3E%3Ccircle cx='92' cy='92' r='18' fill='url(%23g)'/%3E%3Ccircle cx='260' cy='220' r='22' fill='url(%23g)'/%3E%3C/g%3E%3Cg fill='%23ffffff' fill-opacity='.12'%3E%3Ccircle cx='40' cy='180' r='3'/%3E%3Ccircle cx='280' cy='40' r='2'/%3E%3Ccircle cx='140' cy='30' r='2'/%3E%3Ccircle cx='300' cy='160' r='3'/%3E%3C/g%3E%3Cg fill='%2380d9ff' fill-opacity='.25'%3E%3Cpath d='M155 210c0-18 14-32 32-32 18 0 32 14 32 32 0 18-14 32-32 32-18 0-32-14-32-32z'/%3E%3C/g%3E%3Cg fill='%23a7f3ff' fill-opacity='.22'%3E%3Cpath d='M60 60c18 6 26 18 24 36-18-6-26-18-24-36z'/%3E%3Cpath d='M260 120c-18 6-26 18-24 36 18-6 26-18 24-36z'/%3E%3C/g%3E%3C/svg%3E");filter:blur(.15px)}
.seaIcons:after{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.18' stroke-width='2'%3E%3Cpath d='M85 120c-12-18-10-40 8-52 18-12 40-6 54 14 12 18 10 40-8 52-18 12-40 6-54-14z'/%3E%3Cpath d='M230 250c10-22 34-32 56-22-10 22-34 32-56 22z'/%3E%3C/g%3E%3Cg fill='%2338bdf8' fill-opacity='.18'%3E%3Cpath d='M220 70c10-18 30-26 50-18-10 18-30 26-50 18z'/%3E%3C/g%3E%3Cg fill='%23ffffff' fill-opacity='.10'%3E%3Ccircle cx='70' cy='260' r='3'/%3E%3Ccircle cx='140' cy='180' r='2'/%3E%3Ccircle cx='260' cy='120' r='3'/%3E%3Ccircle cx='300' cy='260' r='2'/%3E%3C/g%3E%3C/svg%3E");
animation-duration:46s;opacity:.6;transform:scale(1.1)}
@keyframes drift{to{transform:translate3d(-180px,-120px,0)}}
/* bolhas */
.bubbles:before,.bubbles:after{content:"";position:absolute;inset:-20%;background:
radial-gradient(circle,rgba(255,255,255,.22) 0 2px,transparent 3px) 0 0/120px 120px,
radial-gradient(circle,rgba(255,255,255,.16) 0 1px,transparent 2px) 40px 20px/160px 160px;
animation:float 14s linear infinite;opacity:.55}
.bubbles:after{animation-duration:20s;opacity:.35;transform:scale(1.15)}
@keyframes float{to{transform:translateY(-120px)}}

.brand{position:absolute;top:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:6}
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(10px);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.logo b{letter-spacing:1px}
.mascot{width:34px;height:34px;border-radius:14px;display:grid;place-items:center;position:relative;overflow:hidden;
background:linear-gradient(135deg,#38bdf8,#1d4ed8);border:1px solid rgba(255,255,255,.22)}
.mascot img{width:100%;height:100%;object-fit:cover;display:none}
.mascot .ice{font-weight:1000;letter-spacing:.5px}
.mascot:after{content:"";position:absolute;inset:-30%;background:
radial-gradient(circle at 30% 30%,rgba(255,255,255,.55),transparent 35%),
radial-gradient(circle at 70% 70%,rgba(56,189,248,.35),transparent 45%);
animation:shine 2.8s ease-in-out infinite}
@keyframes shine{0%,100%{transform:rotate(0) scale(1)}50%{transform:rotate(20deg) scale(1.15)}}
/* animação tipo “urso tentando pegar a moeda” (sem depender da imagem) */
.mascotWiggle{animation:wig 1.15s ease-in-out infinite;transform-origin:60% 70%}
@keyframes wig{0%,100%{transform:rotate(-2deg) translateY(0)}45%{transform:rotate(3deg) translateY(-1px)}75%{transform:rotate(-1deg) translateY(1px)}}

.pill{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(10px);border-radius:18px}
.pill .coin{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#0ea5e9,#0b2a6a);
border:1px solid rgba(255,215,0,.55);box-shadow:0 0 0 2px rgba(255,215,0,.18) inset;position:relative;overflow:hidden}
.pill .coin span{color:#ffd700;font-weight:900}
.pill .coin:after{content:"";position:absolute;inset:-60%;background:radial-gradient(circle,rgba(255,215,0,.55),transparent 45%);animation:coin 1.8s linear infinite}
@keyframes coin{to{transform:rotate(360deg)}}

.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:4}
#mainMedia{width:100%;height:100%;object-fit:cover;display:none}
#hint{position:absolute;inset:auto 12px 72px 12px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);border-radius:18px;color:var(--mut);text-align:center;z-index:6}
.stageBar{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:7}
.ownerCard{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);border-radius:18px;min-width:0}
.avatar{width:36px;height:36px;border-radius:14px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);display:grid;place-items:center;font-weight:900;position:relative;overflow:hidden}
.avatar img{width:100%;height:100%;object-fit:cover;display:none}
.star{position:absolute;right:-6px;top:-6px;width:20px;height:20px;border-radius:10px;display:grid;place-items:center;font-size:11px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.2)}
.star.blue{color:#76c7ff;box-shadow:0 0 10px rgba(56,189,248,.35)}
.star.gold{color:#ffd700;box-shadow:0 0 10px rgba(255,215,0,.35)}
.ownerCard .meta{min-width:0}
.ownerCard .meta .name{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px}
.ownerCard .meta .sub{font-size:12px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.smallBtn{padding:10px 12px;border-radius:18px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);color:var(--txt)}
.smallBtn:active{transform:scale(.98)}

.bottom{flex:1;display:flex;flex-direction:column;gap:10px;padding:10px 10px 74px;overflow:hidden}
.carousel{display:flex;gap:10px;overflow:auto;scroll-snap-type:x mandatory;padding-bottom:4px}
.item{min-width:190px;max-width:190px;height:120px;border-radius:18px;overflow:hidden;border:1px solid var(--line);background:rgba(255,255,255,.06);scroll-snap-align:center;position:relative}
.item video,.item img{width:100%;height:100%;object-fit:cover;display:block}
.item .tag{position:absolute;left:8px;bottom:8px;padding:6px 10px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.35);backdrop-filter:blur(8px);border-radius:14px;font-size:12px}
.item.active{outline:2px solid rgba(56,189,248,.8)}
.panel{flex:1;overflow:auto;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);border-radius:22px;padding:12px}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.hrow h3{margin:0;font-size:16px}
.muted{color:var(--mut);font-size:12px}
.gridPosts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.post{border:1px solid var(--line);background:rgba(255,255,255,.06);border-radius:18px;overflow:hidden}
.post video,.post img{width:100%;height:140px;object-fit:cover;display:block}
.post .pbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px}
.badge{font-size:12px;color:var(--mut)}
.iconBtn{border:0;background:transparent;color:var(--bad);padding:6px 8px;border-radius:12px}
.iconBtn:active{transform:scale(.96)}
.okBtn{border:1px solid rgba(34,197,94,.35);background:rgba(34,197,94,.16);color:#eafff0;padding:8px 10px;border-radius:14px}
.okBtn:active{transform:scale(.98)}
.secBtn{border:1px solid rgba(56,189,248,.35);background:rgba(56,189,248,.16);color:var(--txt);padding:8px 10px;border-radius:14px}
.secBtn:active{transform:scale(.98)}

.nav{position:fixed;left:10px;right:10px;bottom:10px;display:flex;gap:10px;z-index:20}
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--line);background:rgba(255,255,255,.08);backdrop-filter:blur(14px);color:var(--txt);display:flex;align-items:center;justify-content:center;gap:8px}
.nav button.active{outline:2px solid rgba(56,189,248,.8)}
.nav i{opacity:.95}

.modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:flex-end;justify-content:center;z-index:40}
.sheet{width:min(720px,100%);max-height:86vh;border-radius:26px 26px 0 0;overflow:hidden;border:1px solid var(--line);background:rgba(7,20,38,.92);backdrop-filter:blur(18px)}
.sheetTop{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.12)}
.sheetTop b{font-size:14px}
.sheetBody{padding:12px 12px 14px;overflow:auto;max-height:calc(86vh - 52px)}
.chat{display:flex;flex-direction:column;gap:10px}
.bubble{max-width:86%;padding:10px 12px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}
.me{align-self:flex-end;background:rgba(56,189,248,.18);border-color:rgba(56,189,248,.25)}
.them{align-self:flex-start}
.chatBar{display:flex;gap:8px;margin-top:10px}
.chatBar input{flex:1;padding:12px 12px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--txt);outline:none}
.chatBar button{padding:12px 14px;border-radius:18px;border:1px solid rgba(56,189,248,.35);background:rgba(56,189,248,.2);color:var(--txt)}
/* Trocas layout */
.tradeWrap{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:740px){.tradeWrap{grid-template-columns:1fr 1fr}}
.card{border:1px solid var(--line);background:rgba(255,255,255,.06);border-radius:18px;padding:10px}
.row{display:flex;gap:8px;flex-wrap:wrap}
.inp{flex:1;min-width:140px;padding:11px 12px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--txt);outline:none}
.list{display:flex;flex-direction:column;gap:10px}
.offer{border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);border-radius:16px;padding:10px}
.offerTop{display:flex;align-items:center;justify-content:space-between;gap:10px}
.offerTop b{font-size:14px}
.offer small{color:var(--mut)}
.offerBtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
</style></head><body>
<div id=app>
  <div class=top>
    <div class="bgSea bubbles"></div>
    <div class="seaIcons"></div>

    <div class=brand>
      <div class=logo>
        <div class="mascot mascotWiggle" id=mascot>
          <span class=ice>ICE</span>
          <img id=mascotImg alt="mascote">
        </div>
        <i class="fa-solid fa-snowflake"></i><b>ICE-CUBO</b><span class=muted>online</span>
      </div>
      <div class=pill title="Moeda BLUE (simulação)">
        <div class=coin><span>B</span></div>
        <div style="display:flex;flex-direction:column;line-height:1.05">
          <span style="font-weight:800">BLUE</span><span class=muted id=blueBal>0</span>
        </div>
      </div>
    </div>

    <div class=viewer>
      <div id=hint>Toque em um card abaixo para destacar. (Swipe na timeline)</div>
      <video id=mainMedia playsinline controls></video>
      <img id=mainImg style="width:100%;height:100%;object-fit:cover;display:none">
    </div>

    <div class=stageBar>
      <div class=ownerCard id=ownerCard>
        <div class=avatar id=ownerAv>V<div class="star blue" id=ownerStar style="display:none"><i class="fa-solid fa-star"></i></div></div>
        <div class=meta>
          <div class=name id=ownerName>ICE IA</div>
          <div class=sub id=ownerSub>Toque no chat para conversar</div>
        </div>
      </div>
      <button class=smallBtn id=chatBtn><i class="fa-solid fa-comments"></i></button>
    </div>
  </div>

  <div class=bottom>
    <div class=carousel id=carousel></div>

    <div class=panel id=panelHome style="display:none">
      <div class=hrow><h3><i class="fa-solid fa-user"></i> Seu perfil</h3><span class=muted>poste foto/vídeo da galeria</span></div>
      <div class=row style="margin-bottom:10px">
        <label class=smallBtn style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id=filePick type=file accept="image/*,video/*" style="display:none">
        </label>
        <button class=smallBtn id=postBtn><i class="fa-solid fa-upload"></i> Postar</button>
        <span class=muted id=pickInfo style="align-self:center">Nenhum arquivo selecionado</span>
      </div>
      <div class=muted style="margin-bottom:8px">Seus posts (aparecem aqui e também na timeline):</div>
      <div class=gridPosts id=myPosts></div>
    </div>

    <div class=panel id=panelFeed>
      <div class=hrow><h3><i class="fa-solid fa-film"></i> Timeline</h3><span class=muted>swipe → para trocar</span></div>
      <div class=muted>Escolha um post na timeline horizontal acima para destacar na tela grande.</div>
      <div style="height:10px"></div>
      <div class=gridPosts id=feedGrid></div>
    </div>

    <div class=panel id=panelSwap style="display:none">
      <div class=hrow><h3><i class="fa-solid fa-repeat"></i> Trocas</h3><span class=muted>crie oferta e combine</span></div>
      <div class=tradeWrap>
        <div class=card>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
            <b>Minha oferta</b><small class=muted>fica salva</small>
          </div>
          <div class=row style="margin-top:10px">
            <input class=inp id=trItem placeholder="O que você tem? ex: BLUE, skin, serviço">
            <input class=inp id=trWant placeholder="O que você quer? ex: vídeo, troca, item">
          </div>
          <div class=row style="margin-top:10px">
            <input class=inp id=trDesc placeholder="Detalhes (opcional)..." style="flex:1">
            <button class=secBtn id=trAdd><i class="fa-solid fa-plus"></i> Publicar</button>
          </div>
          <div style="height:10px"></div>
          <div class=muted>Minhas ofertas:</div>
          <div class=list id=myOffers style="margin-top:8px"></div>
        </div>

        <div class=card>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
            <b>Ofertas da galera</b><small class=muted>simulação (sem backend)</small>
          </div>
          <div style="height:10px"></div>
          <div class=list id=allOffers></div>
        </div>
      </div>
    </div>

    <div class=panel id=panelHelp style="display:none">
      <div class=hrow><h3><i class="fa-solid fa-triangle-exclamation"></i> Perigo</h3><span class=muted>(próximo passo)</span></div>
      <div class=muted>Posso ligar botão ON/OFF de geolocalização e alertas aqui sem quebrar o projeto.</div>
    </div>
  </div>
</div>

<div class=nav>
  <button id=navFeed class=active><i class="fa-solid fa-film"></i><span>Feed</span></button>
  <button id=navHome><i class="fa-solid fa-user"></i><span>Perfil</span></button>
  <button id=navSwap><i class="fa-solid fa-repeat"></i><span>Trocas</span></button>
  <button id=navHelp><i class="fa-solid fa-triangle-exclamation"></i><span>Perigo</span></button>
</div>

<div class=modal id=modal>
  <div class=sheet>
    <div class=sheetTop><b id=chatTitle>Chat</b><button class=smallBtn id=closeModal><i class="fa-solid fa-xmark"></i></button></div>
    <div class=sheetBody>
      <div class=chat id=chatBox></div>
      <div class=chatBar>
        <input id=chatInput placeholder="Digite sua mensagem...">
        <button id=sendChat><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  </div>
</div>

<script>
/* ===== Mascote (troque aqui se quiser usar seu urso/moeda) =====
   Dica: suba a imagem no GitHub e use o link RAW.
   Ex: https://raw.githubusercontent.com/USER/REPO/main/urso.png
*/
const MASCOT_URL=""; // <- coloque aqui a URL do urso/moeda se quiser
(function(){
  const m=document.getElementById("mascot"),img=document.getElementById("mascotImg");
  if(MASCOT_URL){ img.src=MASCOT_URL; img.style.display="block"; m.querySelector(".ice").style.display="none"; }
})();

/* ===== IndexedDB p/ arquivos do perfil ===== */
const DBN="icecubo_db",STORE="files";
function idb(){return new Promise((ok,err)=>{const r=indexedDB.open(DBN,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:"id"});r.onsuccess=()=>ok(r.result);r.onerror=()=>err(r.error);});}
async function putFile(id,blob,type){const db=await idb();return new Promise((ok,err)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put({id,blob,type,ts:Date.now()});tx.oncomplete=()=>ok(1);tx.onerror=()=>err(tx.error);});}
async function getFile(id){const db=await idb();return new Promise((ok,err)=>{const tx=db.transaction(STORE,"readonly"),rq=tx.objectStore(STORE).get(id);rq.onsuccess=()=>ok(rq.result||null);rq.onerror=()=>err(rq.error);});}
async function delFile(id){const db=await idb();return new Promise((ok,err)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);tx.oncomplete=()=>ok(1);tx.onerror=()=>err(tx.error);});}

/* ===== State ===== */
const LS="icecubo_state_v2";
const me={id:"me",name:"Você",avatar:"V",role:"owner",photo:""};
const ai={id:"iceai",name:"ICE IA",avatar:"I",role:"mod",photo:""};
const fakeUsers=[
  {id:"maya",name:"Maya",avatar:"M",role:"user"},
  {id:"kadu",name:"Kadu",avatar:"K",role:"user"},
  {id:"bbb",name:"Beto",avatar:"B",role:"mod"}
];
const state=JSON.parse(localStorage.getItem(LS)||"null")||{blue:0,my:[],feed:[],offersMy:[],offersAll:[]};
const save=()=>localStorage.setItem(LS,JSON.stringify(state));
function seedAI(){
  if(state.feed.length) return;
  const samples=[
    {src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",type:"video"},
    {src:"https://www.w3schools.com/html/mov_bbb.mp4",type:"video"},
    {src:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60",type:"image"}
  ];
  state.feed=samples.map((s,i)=>({id:"ai_"+i,type:s.type,url:s.src,owner:ai,ts:Date.now()-((i+1)*60000)}));
  if(!state.offersAll.length){
    const mk=(u,item,want,desc)=>({id:"o_"+Date.now()+"_"+Math.random().toString(16).slice(2),owner:u,item,want,desc,ts:Date.now()-Math.floor(Math.random()*3600000),status:"open"});
    state.offersAll=[
      mk(fakeUsers[0],"Edição de vídeo","BLUE","Faço edição rápida (1min)"),
      mk(fakeUsers[1],"BLUE (50)","Vídeo/Foto","Troco por conteúdo"),
      mk(fakeUsers[2],"Moderação","BLUE","Ajudo no chat/controle"),
      mk(ai,"Conteúdo IA","Troca/ideia","Posso gerar ideias pra posts")
    ];
  }
  save();
}
seedAI();

/* ===== Refs ===== */
const carousel=document.getElementById("carousel"),mainMedia=document.getElementById("mainMedia"),mainImg=document.getElementById("mainImg"),hint=document.getElementById("hint");
const ownerAv=document.getElementById("ownerAv"),ownerName=document.getElementById("ownerName"),ownerSub=document.getElementById("ownerSub"),ownerStar=document.getElementById("ownerStar");
const blueBal=document.getElementById("blueBal");
const panelFeed=document.getElementById("panelFeed"),panelHome=document.getElementById("panelHome"),panelSwap=document.getElementById("panelSwap"),panelHelp=document.getElementById("panelHelp");
const feedGrid=document.getElementById("feedGrid"),myPosts=document.getElementById("myPosts");
const navFeed=document.getElementById("navFeed"),navHome=document.getElementById("navHome"),navSwap=document.getElementById("navSwap"),navHelp=document.getElementById("navHelp");
const modal=document.getElementById("modal"),chatBtn=document.getElementById("chatBtn"),closeModal=document.getElementById("closeModal");
const chatBox=document.getElementById("chatBox"),chatTitle=document.getElementById("chatTitle"),chatInput=document.getElementById("chatInput"),sendChat=document.getElementById("sendChat");
const filePick=document.getElementById("filePick"),pickInfo=document.getElementById("pickInfo"),postBtn=document.getElementById("postBtn");
const trItem=document.getElementById("trItem"),trWant=document.getElementById("trWant"),trDesc=document.getElementById("trDesc"),trAdd=document.getElementById("trAdd");
const myOffers=document.getElementById("myOffers"),allOffers=document.getElementById("allOffers");

let selected=null,pickedFile=null;

/* ===== Helpers ===== */
const fmt=ts=>new Date(ts).toLocaleString().slice(0,16);
function toast(msg){hint.textContent=msg;hint.style.display="block";setTimeout(()=>{if(!selected)hint.style.display="block";},900);}
function roleStar(role){
  if(role==="owner") return {show:true,cls:"gold",title:"Dono"};
  if(role==="mod") return {show:true,cls:"blue",title:"Moderador"};
  return {show:false};
}
function setOwner(o){
  ownerAv.textContent=(o.avatar||"U");
  ownerName.textContent=(o.name||"Usuário");
  const rs=roleStar(o.role);
  ownerStar.style.display=rs.show?"grid":"none";
  ownerStar.className="star "+(rs.cls||"");
  ownerStar.title=rs.title||"";
  ownerSub.textContent=(o.id===ai.id)?"Agente IA disponível no chat":"Toque no chat para conversar";
}
function showMedia(p){
  selected=p;hint.style.display="none";setOwner(p.owner||ai);
  mainMedia.pause();mainMedia.removeAttribute("src");mainMedia.load();mainMedia.style.display="none";mainImg.style.display="none";
  if(p.type==="video"){mainMedia.src=p.url;mainMedia.style.display="block";mainMedia.play().catch(()=>{});}
  else{mainImg.src=p.url;mainImg.style.display="block";}
  [...carousel.children].forEach(el=>el.classList.toggle("active",el.dataset.id===p.id));
}
async function mapMyPosts(){
  const out=[];
  for(const p of state.my){
    const rec=await getFile(p.fileId); if(!rec) continue;
    out.push({id:p.id,type:p.type,url:URL.createObjectURL(rec.blob),owner:me,ts:p.ts,fileId:p.fileId});
  }
  return out.sort((a,b)=>b.ts-a.ts);
}

/* ===== Render ===== */
async function renderAll(){
  blueBal.textContent=(state.blue||0)+" BLUE";
  const mine=await mapMyPosts();
  const all=[...state.feed,...mine].sort((a,b)=>b.ts-a.ts);

  carousel.innerHTML="";
  all.slice(0,30).forEach(p=>{
    const d=document.createElement("div");
    d.className="item"+(selected&&selected.id===p.id?" active":""); d.dataset.id=p.id;
    d.innerHTML=(p.type==="video")
      ? \`<video muted playsinline src="\${p.url}"></video><div class=tag>@\${p.owner.name}</div>\`
      : \`<img src="\${p.url}"><div class=tag>@\${p.owner.name}</div>\`;
    d.onclick=()=>showMedia(p); carousel.appendChild(d);
  });

  feedGrid.innerHTML="";
  all.forEach(p=>{
    const c=document.createElement("div"); c.className="post";
    c.innerHTML=(p.type==="video")?\`<video muted playsinline src="\${p.url}"></video>\`:\`<img src="\${p.url}">\`;
    const bar=document.createElement("div"); bar.className="pbar";
    bar.innerHTML=\`<span class=badge>@\${p.owner.name} • \${fmt(p.ts)}</span><button class=secBtn title=destacar><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>\`;
    bar.querySelector("button").onclick=()=>showMedia(p);
    c.appendChild(bar); feedGrid.appendChild(c);
  });

  myPosts.innerHTML=mine.length?"":"<div class=muted>Sem posts ainda.</div>";
  mine.forEach(p=>{
    const c=document.createElement("div"); c.className="post";
    c.innerHTML=(p.type==="video")?\`<video muted playsinline src="\${p.url}"></video>\`:\`<img src="\${p.url}">\`;
    const bar=document.createElement("div"); bar.className="pbar";
    bar.innerHTML=\`<span class=badge>Seu post • \${fmt(p.ts)}</span><button class=iconBtn title=apagar><i class="fa-solid fa-trash"></i></button>\`;
    bar.querySelector("button").onclick=()=>removeMyPost(p.id);
    c.appendChild(bar); myPosts.appendChild(c);
  });

  renderTrades();

  if(!selected&&all[0]) showMedia(all[0]);
}
async function removeMyPost(id){
  const i=state.my.findIndex(x=>x.id===id); if(i<0) return;
  const fid=state.my[i].fileId; state.my.splice(i,1); save();
  await delFile(fid).catch(()=>{});
  selected=null; toast("Post apagado ✅"); renderAll();
}

/* ===== Tabs ===== */
function setTab(t){
  navFeed.classList.toggle("active",t==="feed");
  navHome.classList.toggle("active",t==="home");
  navSwap.classList.toggle("active",t==="swap");
  navHelp.classList.toggle("active",t==="help");
  panelFeed.style.display=(t==="feed")?"block":"none";
  panelHome.style.display=(t==="home")?"block":"none";
  panelSwap.style.display=(t==="swap")?"block":"none";
  panelHelp.style.display=(t==="help")?"block":"none";
}
navFeed.onclick=()=>setTab("feed");
navHome.onclick=()=>setTab("home");
navSwap.onclick=()=>setTab("swap");
navHelp.onclick=()=>setTab("help");

/* ===== Upload perfil ===== */
filePick.onchange=e=>{pickedFile=e.target.files&&e.target.files[0]?e.target.files[0]:null;
pickInfo.textContent=pickedFile?(pickedFile.name+" • "+Math.round(pickedFile.size/1024)+" KB"):"Nenhum arquivo selecionado";};
postBtn.onclick=async()=>{
  if(!pickedFile){toast("Selecione um arquivo na galeria primeiro.");return;}
  const type=pickedFile.type.startsWith("video")?"video":"image";
  const fileId="f_"+Date.now()+"_"+Math.random().toString(16).slice(2);
  const postId="p_"+Date.now()+"_"+Math.random().toString(16).slice(2);
  await putFile(fileId,pickedFile,pickedFile.type).catch(()=>null);
  state.my.unshift({id:postId,fileId,type,ts:Date.now()}); save();
  pickedFile=null; filePick.value=""; pickInfo.textContent="Postado ✅";
  toast("Post publicado ✅ (perfil + timeline)"); renderAll();
};

/* ===== Trocas (funcional local) ===== */
function renderTrades(){
  // minhas
  myOffers.innerHTML = state.offersMy.length ? "" : "<div class=muted style='margin-top:8px'>Você ainda não publicou oferta.</div>";
  state.offersMy.sort((a,b)=>b.ts-a.ts).forEach(o=>{
    const el=document.createElement("div"); el.className="offer";
    el.innerHTML=\`<div class=offerTop><b>\${o.item}</b><small>quer: \${o.want}</small></div><small>\${o.desc||""}</small>
      <div class=offerBtns>
        <button class=iconBtn title=remover><i class="fa-solid fa-trash"></i></button>
      </div>\`;
    el.querySelector("button").onclick=()=>{state.offersMy=state.offersMy.filter(x=>x.id!==o.id);save();toast("Oferta removida ✅");renderTrades();};
    myOffers.appendChild(el);
  });

  // galera (simulada)
  const open=state.offersAll.filter(o=>o.status==="open").sort((a,b)=>b.ts-a.ts);
  allOffers.innerHTML = open.length ? "" : "<div class=muted>Nenhuma oferta agora.</div>";
  open.forEach(o=>{
    const el=document.createElement("div"); el.className="offer";
    el.innerHTML=\`<div class=offerTop><b>\${o.item}</b><small>@\${o.owner.name} • quer: \${o.want}</small></div>
      <small>\${o.desc||""}</small>
      <div class=offerBtns>
        <button class=secBtn><i class="fa-solid fa-comments"></i> Propor</button>
        <button class=okBtn><i class="fa-solid fa-check"></i> Aceitar</button>
      </div>\`;
    const btns=el.querySelectorAll("button");
    btns[0].onclick=()=>openChat(o.owner, \`Quero propor troca: você tem "\${o.item}" e quer "\${o.want}".\`);
    btns[1].onclick=()=>{o.status="matched";save();toast("Troca marcada ✅ (simulado)");renderTrades();};
    allOffers.appendChild(el);
  });
}
trAdd.onclick=()=>{
  const item=(trItem.value||"").trim(), want=(trWant.value||"").trim(), desc=(trDesc.value||"").trim();
  if(!item||!want){toast("Preencha: O que tem + O que quer.");return;}
  state.offersMy.unshift({id:"m_"+Date.now()+"_"+Math.random().toString(16).slice(2),owner:me,item,want,desc,ts:Date.now(),status:"open"});
  // também aparece na galera (pra simular “outros vendo”)
  state.offersAll.unshift({id:"g_"+Date.now()+"_"+Math.random().toString(16).slice(2),owner:me,item,want,desc,ts:Date.now(),status:"open"});
  save(); trItem.value=""; trWant.value=""; trDesc.value="";
  toast("Oferta publicada ✅"); renderTrades();
};

/* ===== Chat (IA + simulado) ===== */
const CHATLS="icecubo_chats_v1";
const chats=JSON.parse(localStorage.getItem(CHATLS)||"{}");
const saveChats=()=>localStorage.setItem(CHATLS,JSON.stringify(chats));
function bubble(by,txt){const d=document.createElement("div");d.className="bubble "+(by==="me"?"me":"them");d.textContent=txt;return d;}
function aiReply(userMsg){
  const m=(userMsg||"").toLowerCase();
  if(m.includes("troca")) return "Beleza 🙂 descreve o que você tem e o que você quer. Posso sugerir uma oferta forte.";
  if(m.includes("blue")) return "BLUE é top. Quer usar como moeda de troca, recompensa ou acesso a lives?";
  if(m.includes("post")||m.includes("vídeo")||m.includes("video")) return "Quer que eu te ajude a escolher títulos/hashtags e ideias de posts?";
  if(m.includes("oi")||m.includes("olá")||m.includes("ola")) return "Oi! 😄 Quer mexer em Feed, Perfil ou Trocas agora?";
  return "Entendi. Me dá um detalhe a mais e eu te respondo certinho 🙂";
}
let chatWith=ai;
function openChat(withUser,prefill){
  chatWith=withUser;
  const uid=withUser.id;
  if(!chats[uid]) chats[uid]=[{by:"them",txt:(uid===ai.id?"Oi 🙂 Eu sou a ICE IA. Quer conversar?":"Oi! tudo bem?"),ts:Date.now()}];
  if(prefill) chats[uid].push({by:"me",txt:prefill,ts:Date.now()});
  saveChats();
  chatTitle.textContent="Chat • "+withUser.name;
  modal.style.display="flex";
  renderChat();
  if(prefill && uid===ai.id){
    setTimeout(()=>{chats[uid].push({by:"them",txt:aiReply(prefill),ts:Date.now()});saveChats();renderChat();},500);
  }
}
function renderChat(){
  const uid=chatWith.id; chatBox.innerHTML="";
  (chats[uid]||[]).slice(-50).forEach(m=>chatBox.appendChild(bubble(m.by,m.txt)));
  chatBox.scrollTop=chatBox.scrollHeight;
  chatInput.focus();
}
chatBtn.onclick=()=>openChat(selected&&selected.owner?selected.owner:ai);
closeModal.onclick=()=>modal.style.display="none";
sendChat.onclick=sendMsg;
chatInput.addEventListener("keydown",e=>{if(e.key==="Enter")sendMsg();});
function sendMsg(){
  const t=(chatInput.value||"").trim(); if(!t) return;
  const uid=chatWith.id;
  chats[uid]=chats[uid]||[];
  chats[uid].push({by:"me",txt:t,ts:Date.now()});
  chatInput.value=""; saveChats(); renderChat();
  if(uid===ai.id){
    setTimeout(()=>{chats[uid].push({by:"them",txt:aiReply(t),ts:Date.now()});saveChats();renderChat();},520);
  }else{
    // resposta simulada (pra “parecer usuário”)
    setTimeout(()=>{chats[uid].push({by:"them",txt:"Show! Vou ver aqui 👀",ts:Date.now()});saveChats();renderChat();},650);
  }
}

/* init */
renderAll();
</script></body></html>`));

module.exports=app;
