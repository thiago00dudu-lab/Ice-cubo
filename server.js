const express = require("express");
const app = express();

app.use(express.json({ limit: "50kb" }));

// SOS em memória (simples). Para ficar real/permanente, depois usar banco.
const SOS = []; // {id, user, lat, lng, ts}
const TTL_MS = 10 * 60 * 1000; // 10 min
const RADIUS_KM = 2; // raio "perto" para alertar

function now() { return Date.now(); }
function cleanSOS(){
  const cut = now() - TTL_MS;
  for(let i = SOS.length - 1; i >= 0; i--) if(SOS[i].ts < cut) SOS.splice(i, 1);
}
function haversineKm(lat1,lng1,lat2,lng2){
  const toRad = d => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2-lat1);
  const dLng = toRad(lng2-lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// reporta SOS
app.post("/sos/report", (req, res) => {
  cleanSOS();
  const { user="anon", lat, lng, active=true } = req.body || {};
  if(typeof lat !== "number" || typeof lng !== "number") return res.status(400).json({ ok:false, err:"lat/lng inválido" });

  // remove SOS anterior do mesmo user
  for(let i = SOS.length - 1; i >= 0; i--) if(SOS[i].user === user) SOS.splice(i, 1);

  if(active){
    SOS.push({ id: Math.random().toString(36).slice(2), user, lat, lng, ts: now() });
  }
  res.json({ ok:true });
});

// retorna SOS perto
app.get("/sos/near", (req, res) => {
  cleanSOS();
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if(!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ ok:false, err:"lat/lng inválido" });

  const near = SOS
    .map(s => ({...s, distKm: haversineKm(lat,lng,s.lat,s.lng)}))
    .filter(s => s.distKm <= RADIUS_KM)
    .sort((a,b)=>a.distKm-b.distKm);

  res.json({ ok:true, near, ttlMin: TTL_MS/60000, radiusKm: RADIUS_KM });
});

app.get("/", (req, res) => {
  res.send(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>Ice-Cubo</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
  :root{
    --bg1:#071833; --bg2:#061126; --c:#9fe7ff;
    --glass:rgba(30,160,255,.16); --glass2:rgba(0,120,255,.08);
    --ring:rgba(56,189,248,.55);
    --danger:#ef4444;
  }
  *{box-sizing:border-box}
  body{
    margin:0;height:100vh;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:#fff;
    background: radial-gradient(1200px 600px at 20% 10%, #123b7a 0%, transparent 60%),
                radial-gradient(900px 500px at 80% 30%, #0ea5e9 0%, transparent 55%),
                linear-gradient(180deg,var(--bg1),var(--bg2));
    display:flex;flex-direction:column;
  }

  .stage{
    height:56vh; position:relative; overflow:hidden;
    border-radius:0 0 26px 26px; background:rgba(0,0,0,.42);
  }
  .stage::before{
    content:""; position:absolute; inset:-50px;
    background: radial-gradient(220px 220px at 20% 30%, rgba(56,189,248,.25), transparent 60%),
                radial-gradient(260px 260px at 80% 20%, rgba(14,165,233,.20), transparent 60%),
                radial-gradient(200px 200px at 70% 80%, rgba(59,130,246,.15), transparent 65%);
    filter: blur(12px);
    pointer-events:none;
  }
  #main{
    position:absolute; inset:0; width:100%; height:100%;
    object-fit:cover; display:none;
    background:#000;
  }
  .hint{
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    color:rgba(255,255,255,.78); font-weight:900; letter-spacing:.2px;
    text-shadow:0 10px 20px rgba(0,0,0,.45);
    padding:22px; text-align:center;
  }

  .glassBar{
    position:absolute; left:12px; right:12px; bottom:12px;
    display:flex; gap:10px; align-items:center; justify-content:space-between;
    padding:10px 12px;
    border-radius:18px;
    background:linear-gradient(180deg,var(--glass),var(--glass2));
    border:1px solid rgba(159,231,255,.22);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 14px 30px rgba(0,0,0,.35);
  }
  .pill{
    padding:8px 10px; border-radius:999px;
    border:1px solid rgba(159,231,255,.18);
    background:rgba(0,0,0,.18);
    color:rgba(255,255,255,.92);
    font-size:12px; font-weight:900;
    display:flex; align-items:center; gap:8px;
    user-select:none;
  }
  .dot{width:8px;height:8px;border-radius:999px;background:#22c55e; box-shadow:0 0 16px rgba(34,197,94,.55)}
  .small{font-size:11px; opacity:.85; font-weight:800}

  .timelineWrap{
    flex:1; display:flex; flex-direction:column; gap:10px;
    padding:12px 12px 70px; /* espaço pro nav */
  }
  .timelineTitle{
    display:flex; align-items:center; justify-content:space-between;
    padding:0 4px;
    color:rgba(255,255,255,.88);
    font-weight:900;
  }
  .timelineTitle span{color:var(--c)}
  .timeline{
    flex:1; border-radius:22px; padding:12px;
    background:linear-gradient(180deg, rgba(30,160,255,.14), rgba(0,120,255,.07));
    border:1px solid rgba(159,231,255,.18);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    overflow:hidden;
  }

  .rail{
    height:100%;
    display:flex; gap:12px;
    overflow-x:auto;
    scroll-snap-type:x mandatory;
    -webkit-overflow-scrolling:touch;
    padding-bottom:6px;
  }
  .rail::-webkit-scrollbar{height:0}
  .card{
    flex:0 0 78%;
    max-width:78%;
    scroll-snap-align:center;
    border-radius:18px;
    overflow:hidden;
    position:relative;
    background:rgba(15,23,42,.55);
    border:1px solid rgba(159,231,255,.16);
    box-shadow: 0 18px 30px rgba(0,0,0,.35);
    user-select:none;
  }
  .card video{
    width:100%; height:100%;
    object-fit:cover;
    display:block;
    filter:saturate(1.05) contrast(1.05);
  }
  .badge{
    position:absolute; left:10px; top:10px;
    background:rgba(0,0,0,.35);
    border:1px solid rgba(159,231,255,.22);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding:6px 10px;
    border-radius:999px;
    font-size:12px;
    font-weight:900;
    color:rgba(255,255,255,.92);
  }
  .activeRing{ outline:3px solid var(--ring); outline-offset:-3px; }

  /* NAV inferior */
  .nav{
    position:fixed; left:0; right:0; bottom:0;
    height:62px;
    display:flex; justify-content:space-around; align-items:center;
    background:linear-gradient(180deg, rgba(30,160,255,.14), rgba(0,0,0,.35));
    border-top:1px solid rgba(159,231,255,.16);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .nav i{
    font-size:22px; color:#7dd3fc;
    padding:12px 14px; border-radius:16px;
  }
  .nav i:active{transform:scale(.96)}
  .nav .active{background:rgba(0,0,0,.22); border:1px solid rgba(159,231,255,.18)}
  .nav .sos{
    color:#fff;
    background:rgba(239,68,68,.85);
    border:1px solid rgba(255,255,255,.18);
    box-shadow:0 10px 18px rgba(239,68,68,.20);
  }
  .nav .sos.off{background:rgba(239,68,68,.18); color:#fecaca}

  /* overlay simples (quando fullscreen não funcionar) */
  .overlay{
    position:fixed; inset:0; z-index:9999;
    background:#000; display:none;
  }
  .overlay video{width:100%;height:100%;object-fit:contain}
  .profileBadge{
    position:fixed; top:12px; right:12px; z-index:9998;
    padding:8px 10px; border-radius:999px;
    background:rgba(0,0,0,.25);
    border:1px solid rgba(159,231,255,.16);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-weight:900; font-size:12px;
    color:rgba(255,255,255,.9);
  }
  .profileBadge.danger{
    background:rgba(239,68,68,.22);
    border-color:rgba(239,68,68,.45);
    color:#fecaca;
  }
</style>
</head><body>

<div class="profileBadge" id="profileBadge">Perfil: OK</div>

<div class="stage" id="stage">
  <div class="hint" id="hint">Arraste a timeline embaixo 👇<br/><span class="small">2 toques em um card = sobe</span><br/><span class="small">2 toques na tela grande = tela cheia</span></div>
  <video id="main" playsinline controls></video>

  <div class="glassBar">
    <div class="pill"><span class="dot"></span> ONLINE <span class="small" id="statusTxt">Timeline</span></div>
    <div class="pill"><i class="fa-solid fa-location-dot"></i><span class="small" id="locTxt">sem local</span></div>
  </div>
</div>

<div class="timelineWrap">
  <div class="timelineTitle">
    <div>Timeline <span>Swipe</span></div>
    <div class="small" id="countTxt">0/0</div>
  </div>
  <div class="timeline">
    <div class="rail" id="rail"></div>
  </div>
</div>

<div class="nav">
  <i class="fa-solid fa-house active" id="navHome" title="Casa"></i>
  <i class="fa-solid fa-magnifying-glass" id="navSearch" title="Buscar"></i>
  <i class="fa-solid fa-camera" id="navCam" title="Câmera"></i>
  <i class="fa-solid fa-triangle-exclamation sos off" id="navSOS" title="SOS"></i>
  <i class="fa-solid fa-user" id="navProfile" title="Perfil"></i>
</div>

<div class="overlay" id="overlay"><video id="overlayVid" playsinline controls></video></div>

<script>
  // Usuário simples (depois você liga no login)
  const USER = "thiago";

  const posts = [
    { user:"@neo",    src:"https://www.w3schools.com/html/mov_bbb.mp4" },
    { user:"@tech",   src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
    { user:"@future", src:"https://media.w3.org/2010/05/sintel/trailer.mp4" }
  ];

  const rail = document.getElementById("rail");
  const main = document.getElementById("main");
  const hint = document.getElementById("hint");
  const stage = document.getElementById("stage");
  const countTxt = document.getElementById("countTxt");
  const statusTxt = document.getElementById("statusTxt");
  const locTxt = document.getElementById("locTxt");

  const overlay = document.getElementById("overlay");
  const overlayVid = document.getElementById("overlayVid");

  const profileBadge = document.getElementById("profileBadge");
  const navHome = document.getElementById("navHome");
  const navSearch = document.getElementById("navSearch");
  const navCam = document.getElementById("navCam");
  const navSOS = document.getElementById("navSOS");
  const navProfile = document.getElementById("navProfile");

  let active = 0;
  let stream = null;
  let lastLatLng = null;
  let sosActive = false;

  function setNavActive(el){
    [navHome,navSearch,navCam,navSOS,navProfile].forEach(i=>i.classList.remove("active"));
    if(el) el.classList.add("active");
  }

  // Double tap helper (mobile)
  function onDoubleTap(el, cb){
    let last = 0;
    el.addEventListener("touchend", (e)=>{
      const t = Date.now();
      if(t - last < 280){ cb(e); last = 0; }
      else last = t;
    }, {passive:true});
    el.addEventListener("dblclick", cb);
  }

  function render(){
    rail.innerHTML = "";
    posts.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "card" + (i===active ? " activeRing" : "");
      card.innerHTML = \`
        <div class="badge">\${p.user}</div>
        <video src="\${p.src}" muted playsinline preload="metadata"></video>
      \`;

      // 2 toques no card = sobe pro palco
      onDoubleTap(card, ()=>{
        setActive(i);
        openInStage(i);
      });

      // toque simples = seleciona
      card.addEventListener("click", ()=>setActive(i));

      rail.appendChild(card);
    });
    countTxt.textContent = (active+1) + "/" + posts.length;
  }

  function setActive(i){
    active = i;
    [...rail.children].forEach((c, idx) => c.classList.toggle("activeRing", idx===active));
    countTxt.textContent = (active+1) + "/" + posts.length;
  }

  function openInStage(i){
    stopLive();
    hint.style.display = "none";
    main.style.display = "block";
    main.controls = true;
    main.srcObject = null;
    main.src = posts[i].src;
    main.play().catch(()=>{});
    statusTxt.textContent = "Vídeo: " + posts[i].user;
  }

  // scroll swipe: muda ativo e ao parar, abre no palco
  function syncActiveFromScroll(){
    const cards = [...rail.children];
    if(!cards.length) return;
    const center = rail.scrollLeft + rail.clientWidth/2;
    let bestIdx = 0, bestDist = Infinity;
    cards.forEach((c, idx) => {
      const cCenter = c.offsetLeft + c.clientWidth/2;
      const d = Math.abs(cCenter - center);
      if(d < bestDist){ bestDist = d; bestIdx = idx; }
    });
    if(bestIdx !== active) setActive(bestIdx);
  }

  let scrollTimer=null;
  rail.addEventListener("scroll", () => {
    syncActiveFromScroll();
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => openInStage(active), 180);
  }, {passive:true});

  // 2 toques na tela grande = fullscreen / sair
  onDoubleTap(stage, async ()=>{
    if(main.style.display === "none") return;
    // se overlay ativo, fecha
    if(overlay.style.display === "block"){ closeOverlay(); return; }

    // tenta Fullscreen real (se suportado)
    try{
      if(document.fullscreenElement){
        await document.exitFullscreen();
      }else{
        await stage.requestFullscreen();
      }
      return;
    }catch(e){
      // fallback: overlay
      openOverlay();
    }
  });

  function openOverlay(){
    if(main.srcObject){
      // câmera: clona via srcObject (não dá pra "clonar", então só mostra o mesmo element: fallback simples)
      overlayVid.srcObject = main.srcObject;
      overlayVid.controls = false;
      overlayVid.muted = true;
    }else{
      overlayVid.srcObject = null;
      overlayVid.src = main.currentSrc || main.src;
      overlayVid.controls = true;
      overlayVid.muted = false;
    }
    overlay.style.display = "block";
    overlayVid.play().catch(()=>{});
  }
  function closeOverlay(){
    overlay.style.display = "none";
    overlayVid.pause();
    overlayVid.src = "";
    overlayVid.srcObject = null;
  }
  onDoubleTap(overlay, closeOverlay);

  // Câmera
  async function toggleLive(){
    setNavActive(navCam);
    if(stream) return stopLive();
    try{
      hint.style.display = "none";
      main.style.display = "block";
      main.src = "";
      main.controls = false;
      stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      main.srcObject = stream;
      main.muted = true;
      await main.play();
      statusTxt.textContent = "LIVE (câmera)";
    }catch{
      alert("Permita a câmera.");
      stream = null;
    }
  }
  function stopLive(){
    if(stream){
      stream.getTracks().forEach(t=>t.stop());
      stream = null;
    }
  }

  // Localização + SOS
  function getLocation(){
    return new Promise((resolve, reject)=>{
      if(!navigator.geolocation) return reject("Sem geolocalização");
      navigator.geolocation.getCurrentPosition(
        pos => resolve({lat: pos.coords.latitude, lng: pos.coords.longitude}),
        err => reject(err && err.message ? err.message : "Erro ao pegar localização"),
        { enableHighAccuracy:true, timeout:10000, maximumAge:15000 }
      );
    });
  }

  async function toggleSOS(){
    setNavActive(navSOS);
    try{
      const {lat, lng} = await getLocation();
      lastLatLng = {lat, lng};
      locTxt.textContent = lat.toFixed(5)+", "+lng.toFixed(5);

      sosActive = !sosActive;

      // UI
      navSOS.classList.toggle("off", !sosActive);
      profileBadge.classList.toggle("danger", sosActive);
      profileBadge.textContent = sosActive ? "Perfil: ÁREA DE RISCO" : "Perfil: OK";

      // envia ao servidor
      await fetch("/sos/report", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ user: USER, lat, lng, active: sosActive })
      });

      if(sosActive){
        alert("SOS ATIVADO ✅\\nSeu perfil ficou vermelho e sua área foi marcada como risco.");
      }else{
        alert("SOS DESATIVADO ✅");
      }
    }catch(e){
      alert("Não consegui pegar sua localização.\\n" + e);
    }
  }

  // Checagem de SOS perto (para quem está navegando)
  async function checkNearSOS(){
    if(!lastLatLng) return;
    try{
      const q = new URLSearchParams({ lat:lastLatLng.lat, lng:lastLatLng.lng }).toString();
      const r = await fetch("/sos/near?"+q);
      const j = await r.json();
      if(!j.ok) return;

      // se tiver SOS perto de outra pessoa
      const near = (j.near || []).filter(x => x.user !== USER);
      if(near.length){
        const s = near[0];
        alert("⚠️ ALERTA: pessoa próxima em ÁREA DE RISCO\\nUsuário: "+s.user+"\\nDistância: ~"+s.distKm.toFixed(2)+" km");
      }
    }catch{}
  }

  // Perfil / Home / Buscar
  function goHome(){
    setNavActive(navHome);
    closeOverlay();
    hint.style.display = "flex";
    main.pause();
    main.style.display = "none";
    statusTxt.textContent = "Timeline";
  }
  function openSearch(){
    setNavActive(navSearch);
    const u = prompt("Buscar por usuário (ex: neo, tech):");
    if(u===null) return;
    const idx = posts.findIndex(p => p.user.toLowerCase().includes(u.toLowerCase()));
    if(idx >= 0){
      setActive(idx);
      // centraliza card
      const c = rail.children[idx];
      if(c) rail.scrollLeft = c.offsetLeft - (rail.clientWidth - c.clientWidth)/2;
      openInStage(idx);
    }else{
      alert("Nada encontrado.");
    }
  }
  function openProfile(){
    setNavActive(navProfile);
    const msg =
      "Perfil: "+USER+
      (sosActive ? "\\n⚠️ ÁREA DE RISCO (SOS ativo)" : "\\nOK") +
      (lastLatLng ? ("\\nLocal: "+lastLatLng.lat.toFixed(5)+", "+lastLatLng.lng.toFixed(5)) : "\\nLocal: (não capturado)");
    alert(msg);
  }

  // hooks nav
  navHome.onclick = goHome;
  navSearch.onclick = openSearch;
  navCam.onclick = toggleLive;
  navSOS.onclick = toggleSOS;
  navProfile.onclick = openProfile;

  // inicia
  render();
  requestAnimationFrame(()=>{
    const c = rail.children[active];
    if(c) rail.scrollLeft = c.offsetLeft - (rail.clientWidth - c.clientWidth)/2;
  });

  // pega localização uma vez (pra poder alertar "perto")
  (async ()=>{
    try{
      const ll = await getLocation();
      lastLatLng = ll;
      locTxt.textContent = ll.lat.toFixed(5)+", "+ll.lng.toFixed(5);
      setInterval(checkNearSOS, 20000); // a cada 20s
    }catch{
      locTxt.textContent = "sem local";
    }
  })();
</script>

</body></html>`);
});

// Vercel (Express) - não usar app.listen
module.exports = app;
