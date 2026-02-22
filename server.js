const express=require("express"),app=express();

/* favicons (evita 404/500 em alguns casos) */
app.get("/favicon.ico",(q,s)=>s.status(204).end());
app.get("/favicon.png",(q,s)=>s.status(204).end());

app.get("/",(req,res)=>{
  res.setHeader("Content-Type","text/html; charset=utf-8");
  res.status(200).send(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg:#061428;--g:rgba(255,255,255,.08);--l:rgba(255,255,255,.16);--t:#eaf2ff;--m:#b7c7e6;--a:#38bdf8}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--t);height:100vh;overflow:hidden;background:
radial-gradient(1200px 600px at 20% -10%,rgba(56,189,248,.18),transparent 60%),
radial-gradient(900px 600px at 110% 30%,rgba(99,102,241,.14),transparent 55%),
linear-gradient(180deg,#031024,#071b33 60%,#041226)}
button{cursor:pointer}a{color:inherit}
#app{height:100vh;display:flex;flex-direction:column}
.top{height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:#000}
.sea{position:absolute;inset:0;opacity:.38;background:
radial-gradient(circle at 10% 20%,rgba(56,189,248,.18),transparent 35%),
radial-gradient(circle at 80% 10%,rgba(59,130,246,.16),transparent 35%),
radial-gradient(circle at 30% 80%,rgba(34,211,238,.14),transparent 35%),
linear-gradient(180deg,#021024,#041a35)}
.sea:before,.sea:after{content:"";position:absolute;inset:-20%;background:
radial-gradient(circle,rgba(255,255,255,.22) 0 2px,transparent 3px) 0 0/120px 120px,
radial-gradient(circle,rgba(255,255,255,.16) 0 1px,transparent 2px) 40px 20px/160px 160px;
animation:float 14s linear infinite;opacity:.55}
.sea:after{animation-duration:20s;opacity:.35;transform:scale(1.12)}
@keyframes float{to{transform:translateY(-120px)}}

.brand{position:absolute;top:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:5}
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.logo b{letter-spacing:1px}
.pill{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px}
.coin{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#0ea5e9,#0b2a6a);
border:1px solid rgba(255,215,0,.55);box-shadow:0 0 0 2px rgba(255,215,0,.18) inset}
.coin span{color:#ffd700;font-weight:900}

.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:3}
#mainV{width:100%;height:100%;object-fit:cover;display:none}
#mainI{width:100%;height:100%;object-fit:cover;display:none}
#hint{position:absolute;left:12px;right:12px;bottom:78px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);
border-radius:18px;color:var(--m);text-align:center}

.stageBar{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:6}
.owner{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);
border-radius:18px;min-width:0}
.av{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);position:relative}
.star{position:absolute;right:-6px;top:-6px;font-size:14px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))}
.star.blue{color:#60a5fa}.star.gold{color:#ffd700}
.meta{min-width:0}
.meta .nm{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.meta .sb{font-size:12px;color:var(--m);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sbtn{padding:10px 12px;border-radius:18px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);color:var(--t)}
.sbtn:active{transform:scale(.98)}

.bottom{flex:1;display:flex;flex-direction:column;gap:10px;padding:10px 10px 74px;overflow:hidden}
.carousel{display:flex;gap:10px;overflow:auto;scroll-snap-type:x mandatory;padding-bottom:4px}
.item{min-width:190px;max-width:190px;height:120px;border-radius:18px;overflow:hidden;border:1px solid var(--l);background:rgba(255,255,255,.06);
scroll-snap-align:center;position:relative}
.item video,.item img{width:100%;height:100%;object-fit:cover;display:block}
.tag{position:absolute;left:8px;bottom:8px;padding:6px 10px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.35);
backdrop-filter:blur(8px);border-radius:14px;font-size:12px}
.item.active{outline:2px solid rgba(56,189,248,.85)}

.panel{flex:1;overflow:auto;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:22px;padding:12px}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.hrow h3{margin:0;font-size:16px}
.mut{color:var(--m);font-size:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.post{border:1px solid var(--l);background:rgba(255,255,255,.06);border-radius:18px;overflow:hidden}
.post video,.post img{width:100%;height:140px;object-fit:cover;display:block}
.pbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px}
.badge{font-size:12px;color:var(--m)}
.ib{border:0;background:transparent;color:#ff6b6b;padding:6px 8px;border-radius:12px}
.ib:active{transform:scale(.96)}

.nav{position:fixed;left:10px;right:10px;bottom:10px;display:flex;gap:10px;z-index:20}
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--l);background:rgba(255,255,255,.08);backdrop-filter:blur(14px);
color:var(--t);display:flex;align-items:center;justify-content:center;gap:8px}
.nav button.active{outline:2px solid rgba(56,189,248,.85)}

.modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:flex-end;justify-content:center;z-index:30}
.sheet{width:min(720px,100%);max-height:86vh;border-radius:26px 26px 0 0;overflow:hidden;border:1px solid var(--l);background:rgba(7,20,38,.92);backdrop-filter:blur(18px)}
.st{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.12)}
.sb{padding:12px;overflow:auto;max-height:calc(86vh - 52px)}
.chat{display:flex;flex-direction:column;gap:10px}
.b{max-width:86%;padding:10px 12px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}
.me{align-self:flex-end;background:rgba(56,189,248,.18);border-color:rgba(56,189,248,.25)}
.th{align-self:flex-start}
.cb{display:flex;gap:8px;margin-top:10px}
.cb input{flex:1;padding:12px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--t);outline:none}
.cb button{padding:12px 14px;border-radius:18px;border:1px solid rgba(56,189,248,.35);background:rgba(56,189,248,.2);color:var(--t)}
</style></head><body>
<div id="app">
  <div class="top">
    <div class="sea"></div>

    <div class="brand">
      <div class="logo"><i class="fa-solid fa-snowflake"></i><b>ICE-CUBO</b><span class="mut" style="opacity:.9">online</span></div>
      <div class="pill" title="Moeda BLUE (simulação)"><div class="coin"><span>B</span></div>
        <div style="display:flex;flex-direction:column;line-height:1.05">
          <span style="font-weight:900">BLUE</span><span class="mut" id="blueBal">0</span>
        </div>
      </div>
    </div>

    <div class="viewer">
      <div id="hint">Toque em um card abaixo para destacar na tela grande.</div>
      <video id="mainV" playsinline controls></video>
      <img id="mainI" />
    </div>

    <div class="stageBar">
      <div class="owner" id="ownerCard">
        <div class="av" id="av">I<span class="star blue" id="st" style="display:none"><i class="fa-solid fa-star"></i></span></div>
        <div class="meta">
          <div class="nm" id="nm">ICE IA</div>
          <div class="sb" id="sb">Toque no chat para conversar</div>
        </div>
      </div>
      <button class="sbtn" id="chatBtn"><i class="fa-solid fa-comments"></i></button>
    </div>
  </div>

  <div class="bottom">
    <div class="carousel" id="car"></div>

    <div class="panel" id="pFeed">
      <div class="hrow"><h3><i class="fa-solid fa-film"></i> Timeline</h3><span class="mut">swipe → para trocar</span></div>
      <div class="mut">Escolha um post acima para destacar. Seus posts entram na timeline também.</div><div style="height:10px"></div>
      <div class="grid" id="feed"></div>
    </div>

    <div class="panel" id="pHome" style="display:none">
      <div class="hrow"><h3><i class="fa-solid fa-user"></i> Seu perfil</h3><span class="mut">poste da galeria</span></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <label class="sbtn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id="pick" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="sbtn" id="post"><i class="fa-solid fa-upload"></i> Postar</button>
        <span class="mut" id="info" style="align-self:center">Nenhum arquivo selecionado</span>
      </div>
      <div class="mut" style="margin-bottom:8px">Seus posts:</div>
      <div class="grid" id="mine"></div>
    </div>
  </div>
</div>

<div class="nav">
  <button id="bFeed" class="active"><i class="fa-solid fa-film"></i><span>Feed</span></button>
  <button id="bHome"><i class="fa-solid fa-user"></i><span>Perfil</span></button>
  <button id="bSwap"><i class="fa-solid fa-repeat"></i><span>Trocas</span></button>
  <button id="bHelp"><i class="fa-solid fa-triangle-exclamation"></i><span>Perigo</span></button>
</div>

<div class="modal" id="modal">
  <div class="sheet">
    <div class="st"><b id="ct">Chat</b><button class="sbtn" id="x"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="sb">
      <div class="chat" id="box"></div>
      <div class="cb">
        <input id="msg" placeholder="Digite sua mensagem..." />
        <button id="send"><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  </div>
</div>

<script>
/* ===== IndexedDB ===== */
const DBN="icecubo_db",STORE="files";
const idb=()=>new Promise((ok,er)=>{const r=indexedDB.open(DBN,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:"id"});
r.onsuccess=()=>ok(r.result);r.onerror=()=>er(r.error)});
const putFile=async(id,blob,type)=>new Promise(async(ok,er)=>{const db=await idb(),tx=db.transaction(STORE,"readwrite");
tx.objectStore(STORE).put({id,blob,type,ts:Date.now()});tx.oncomplete=()=>ok(1);tx.onerror=()=>er(tx.error)});
const getFile=async(id)=>new Promise(async(ok,er)=>{const db=await idb(),tx=db.transaction(STORE,"readonly"),rq=tx.objectStore(STORE).get(id);
rq.onsuccess=()=>ok(rq.result||null);rq.onerror=()=>er(rq.error)});
const delFile=async(id)=>new Promise(async(ok,er)=>{const db=await idb(),tx=db.transaction(STORE,"readwrite");
tx.objectStore(STORE).delete(id);tx.oncomplete=()=>ok(1);tx.onerror=()=>er(tx.error)});

/* ===== Estado ===== */
const LS="icecubo_state_v2";
const me={id:"me",name:"Você",avatar:"V",role:"user"};
const ai={id:"iceai",name:"ICE IA",avatar:"I",role:"mod"}; // IA como moderadora (estrela azul)
const stt=JSON.parse(localStorage.getItem(LS)||"null")||{blue:0,my:[],feed:[]};
const save=()=>localStorage.setItem(LS,JSON.stringify(stt));
const chats=JSON.parse(localStorage.getItem("icecubo_chats_v2")||"{}");
const saveChats=()=>localStorage.setItem("icecubo_chats_v2",JSON.stringify(chats));

/* seed IA */
(function(){
  if(stt.feed && stt.feed.length) return;
  const samples=[
    {src:"https://www.w3schools.com/html/mov_bbb.mp4",type:"video"},
    {src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",type:"video"},
    {src:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60",type:"image"}
  ];
  stt.feed=samples.map((s,i)=>({id:"ai_"+i,type:s.type,url:s.src,owner:ai,ts:Date.now()-((i+1)*6e4)}));
  save();
})();

/* ===== UI ===== */
const car=q("car"),mainV=q("mainV"),mainI=q("mainI"),hint=q("hint"),blueBal=q("blueBal");
const av=q("av"),nm=q("nm"),sb=q("sb"),star=q("st");
const pFeed=q("pFeed"),pHome=q("pHome"),feed=q("feed"),mine=q("mine");
const bFeed=q("bFeed"),bHome=q("bHome"),bSwap=q("bSwap"),bHelp=q("bHelp");
const modal=q("modal"),chatBtn=q("chatBtn"),x=q("x"),box=q("box"),ct=q("ct"),msg=q("msg"),send=q("send");
const pick=q("pick"),info=q("info"),post=q("post");
function q(id){return document.getElementById(id)}
let selected=null,picked=null,chatWith=ai;

function fmt(ts){const d=new Date(ts);return d.toLocaleString().slice(0,16)}
function toast(t){hint.textContent=t;hint.style.display="block";setTimeout(()=>{if(!selected)hint.style.display="block"},900)}
function setOwner(o){
  av.firstChild.nodeValue=(o.avatar||"U");
  nm.textContent=o.name||"Usuário";
  sb.textContent=o.id===ai.id?"Agente IA disponível no chat":"Toque no chat para conversar";
  star.style.display=(o.role==="mod"||o.role==="admin")?"block":"none";
  star.className="star "+(o.role==="admin"?"gold":"blue");
}
function clearMain(){
  mainV.pause();mainV.removeAttribute("src");mainV.load();mainV.style.display="none";
  mainI.style.display="none";mainI.removeAttribute("src");
}
function show(post){
  selected=post;hint.style.display="none";setOwner(post.owner||ai);clearMain();
  if(post.type==="video"){mainV.src=post.url;mainV.style.display="block";mainV.play().catch(()=>{})}
  else{mainI.src=post.url;mainI.style.display="block"}
  [...car.children].forEach(e=>e.classList.toggle("active",e.dataset.id===post.id));
}

/* ===== Render ===== */
async function mapMine(){
  const out=[];
  for(const p of stt.my){
    const rec=await getFile(p.fileId); if(!rec) continue;
    out.push({id:p.id,type:p.type,url:URL.createObjectURL(rec.blob),owner:me,ts:p.ts,fileId:p.fileId});
  }
  return out.sort((a,b)=>b.ts-a.ts);
}
async function render(){
  blueBal.textContent=(stt.blue||0)+" BLUE";
  const mineV=await mapMine();
  const all=[...stt.feed,...mineV].sort((a,b)=>b.ts-a.ts);

  car.innerHTML="";
  all.slice(0,30).forEach(p=>{
    const d=document.createElement("div");d.className="item"+(selected&&selected.id===p.id?" active":"");d.dataset.id=p.id;
    d.innerHTML=(p.type==="video")
      ?\`<video muted playsinline src="\${p.url}"></video><div class="tag">@\${p.owner.name}</div>\`
      :\`<img src="\${p.url}"><div class="tag">@\${p.owner.name}</div>\`;
    d.onclick=()=>show(p);car.appendChild(d);
  });

  feed.innerHTML="";
  all.forEach(p=>{
    const c=document.createElement("div");c.className="post";
    c.innerHTML=(p.type==="video")?\`<video muted playsinline src="\${p.url}"></video>\`:\`<img src="\${p.url}">\`;
    const bar=document.createElement("div");bar.className="pbar";
    bar.innerHTML=\`<span class="badge">@\${p.owner.name} • \${fmt(p.ts)}</span><button class="ib" title="destacar"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>\`;
    bar.querySelector("button").onclick=()=>show(p);c.appendChild(bar);feed.appendChild(c);
  });

  mine.innerHTML=mineV.length?"":"<div class='mut'>Sem posts ainda.</div>";
  mineV.forEach(p=>{
    const c=document.createElement("div");c.className="post";
    c.innerHTML=(p.type==="video")?\`<video muted playsinline src="\${p.url}"></video>\`:\`<img src="\${p.url}">\`;
    const bar=document.createElement("div");bar.className="pbar";
    bar.innerHTML=\`<span class="badge">Seu post • \${fmt(p.ts)}</span><button class="ib" title="apagar"><i class="fa-solid fa-trash"></i></button>\`;
    bar.querySelector("button").onclick=()=>rmMy(p.id);c.appendChild(bar);mine.appendChild(c);
  });

  if(!selected && all[0]) show(all[0]);
}
async function rmMy(id){
  const i=stt.my.findIndex(x=>x.id===id); if(i<0) return;
  const fid=stt.my[i].fileId; stt.my.splice(i,1); save();
  await delFile(fid).catch(()=>{});
  selected=null; toast("Post apagado ✅"); render();
}

/* ===== Tabs ===== */
function tab(t){
  [bFeed,bHome,bSwap,bHelp].forEach(b=>b.classList.remove("active"));
  (t==="feed"?bFeed:t==="home"?bHome:t==="swap"?bSwap:bHelp).classList.add("active");
  pFeed.style.display=t==="feed"?"block":"none";
  pHome.style.display=t==="home"?"block":"none";
  if(t==="swap") toast("Trocas: próximo passo (montar sem quebrar).");
  if(t==="help") toast("Perigo: próximo passo (ON/OFF + geolocalização real).");
}
bFeed.onclick=()=>tab("feed"); bHome.onclick=()=>tab("home"); bSwap.onclick=()=>tab("swap"); bHelp.onclick=()=>tab("help");

/* ===== Galeria -> Postar ===== */
pick.onchange=e=>{
  picked=e.target.files&&e.target.files[0]?e.target.files[0]:null;
  info.textContent=picked?(picked.name+" • "+Math.round(picked.size/1024)+" KB"):"Nenhum arquivo selecionado";
};
post.onclick=async()=>{
  if(!picked) return toast("Selecione um arquivo na galeria primeiro.");
  const type=picked.type.startsWith("video")?"video":"image";
  const fid="f_"+Date.now()+"_"+Math.random().toString(16).slice(2);
  const pid="p_"+Date.now()+"_"+Math.random().toString(16).slice(2);
  await putFile(fid,picked,picked.type).catch(()=>null);
  stt.my.unshift({id:pid,fileId:fid,type,ts:Date.now()}); save();
  picked=null; pick.value=""; info.textContent="Postado ✅";
  toast("Post publicado ✅ (perfil + timeline)"); render();
};

/* ===== Chat ===== */
function openChat(u){
  chatWith=u;
  const id=u.id;
  if(!chats[id]) chats[id]=[{by:"them",txt:(id===ai.id?"Oi 🙂 Eu sou a ICE IA. Como você tá hoje?":"Oi! tudo bem?"),ts:Date.now()}];
  saveChats();
  ct.textContent="Chat • "+u.name;
  drawChat();
  modal.style.display="flex";
}
function drawChat(){
  const id=chatWith.id; box.innerHTML="";
  (chats[id]||[]).forEach(m=>{
    const d=document.createElement("div"); d.className="b "+(m.by==="me"?"me":"th"); d.textContent=m.txt; box.appendChild(d);
  });
  box.scrollTop=box.scrollHeight;
}
function push(by,txt){
  const id=chatWith.id; (chats[id]=chats[id]||[]).push({by,txt,ts:Date.now()}); saveChats(); drawChat();
}
function aiReply(text){
  const t=(text||"").toLowerCase().trim();
  if(!t) return "Manda uma mensagem 🙂";
  if(t.includes("oi")||t.includes("olá")) return "Oi! 😄 Quer conversar sobre algo específico ou só trocar ideia?";
  if(t.includes("triste")||t.includes("sozinho")||t.includes("depress")) return "Poxa… sinto isso. Quer me contar o que aconteceu hoje? Eu tô aqui com você.";
  if(t.includes("amor")||t.includes("namor")) return "Tema bom 😄 Você tá vivendo algo ou só curiosidade?";
  if(t.includes("ice")||t.includes("cubo")||t.includes("blue")) return "O ICE tá ficando top. Quer focar mais no Feed, Perfil, Trocas ou Perigo agora?";
  if(t.includes("como")||t.includes("faz")) return "Me diz o que você quer fazer que eu te guio passo a passo, sem quebrar o projeto.";
  const pool=[
    "Entendi… e como isso te fez sentir?",
    "Faz sentido. Quer que eu te ajude a pensar numa solução?",
    "Conta mais um pouco, tô te acompanhando.",
    "Beleza. Qual o próximo passo que você quer no ICE?"
  ];
  return pool[Math.floor(Math.random()*pool.length)];
}
chatBtn.onclick=()=>openChat(selected&&selected.owner?selected.owner:ai);
document.getElementById("ownerCard").onclick=()=>openChat(selected&&selected.owner?selected.owner:ai);
x.onclick=()=>modal.style.display="none";
send.onclick=sendMsg;
msg.addEventListener("keydown",e=>{if(e.key==="Enter")sendMsg()});
function sendMsg(){
  const t=msg.value.trim(); if(!t) return;
  msg.value=""; push("me",t);
  if(chatWith.id===ai.id){
    setTimeout(()=>push("them",aiReply(t)),450);
  }else{
    setTimeout(()=>push("them","(Simulação) Recebi sua mensagem ✅"),400);
  }
}

/* start */
setOwner(ai);
render();
</script>
</body></html>`);
});

/* IMPORTANTÍSSIMO: CommonJS para bater com seu package.json */
module.exports=app;
