const express=require("express");
const app=express();

app.get("/",(req,res)=>{
res.send(`<!DOCTYPE html><html lang="pt-br"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Ice-Cubo Premium</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
body{margin:0;font-family:sans-serif;background:#0f172a;color:#fff;display:flex;flex-direction:column;height:100vh}
.stage{height:45vh;background:#000;display:flex;align-items:center;justify-content:center;position:relative;border-radius:0 0 30px 30px;overflow:hidden}
video,.expand{position:absolute;width:100%;height:100%;object-fit:cover;display:none}
.feed{flex:1;overflow:auto;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.card{background:#1e293b;border-radius:15px;overflow:hidden;cursor:pointer}
.thumb{height:100px;width:100%;object-fit:cover}
.info{padding:5px;font-size:12px;font-weight:bold;color:#38bdf8}
.nav{height:60px;background:#1e293b;display:flex;justify-content:space-around;align-items:center;border-top:1px solid #334155}
.nav i{font-size:22px;color:#38bdf8;cursor:pointer}
.livebtn{position:absolute;bottom:15px;right:15px;background:#ef4444;color:#fff;border:none;padding:8px 15px;border-radius:20px;cursor:pointer}
.topbar{position:absolute;top:10px;right:15px;font-size:12px;color:#38bdf8}
</style></head><body>

<div class="stage">
<div id="placeholder">Toque 2x no vídeo ou inicie LIVE</div>
<video id="mainVideo"></video>
<video id="cam" autoplay playsinline></video>
<button class="livebtn" onclick="live()" id="liveBtn">LIVE</button>
<div class="topbar" id="status">OFFLINE</div>
</div>

<div class="feed" id="feed"></div>

<div class="nav">
<i class="fas fa-home" onclick="home()"></i>
<i class="fas fa-plus-circle" onclick="novoPost()"></i>
<i class="fas fa-video" onclick="live()"></i>
<i class="fas fa-user" onclick="perfil()"></i>
</div>

<script>

let posts=[
{vid:"https://www.w3schools.com/html/mov_bbb.mp4",user:"@neo"},
{vid:"https://www.w3schools.com/html/movie.mp4",user:"@tech"},
{vid:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",user:"@future"},
{vid:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/forest.mp4",user:"@cyber"}
];

const feed=document.getElementById("feed");
const mainVideo=document.getElementById("mainVideo");
const cam=document.getElementById("cam");
const placeholder=document.getElementById("placeholder");
const liveBtn=document.getElementById("liveBtn");
const status=document.getElementById("status");

function render(){
feed.innerHTML="";
posts.forEach(p=>{
let d=document.createElement("div");
d.className="card";
d.innerHTML='<video src="'+p.vid+'" class="thumb" muted></video><div class="info">'+p.user+'</div>';
d.ondblclick=()=>abrirVideo(p.vid);
feed.appendChild(d);
});
}
render();

function abrirVideo(src){
pararLive();
cam.style.display="none";
placeholder.style.display="none";
mainVideo.src=src;
mainVideo.style.display="block";
mainVideo.controls=true;
mainVideo.autoplay=true;
}

function home(){
mainVideo.pause();
mainVideo.style.display="none";
mainVideo.src="";
placeholder.style.display="block";
}

function novoPost(){
posts.unshift({vid:"https://www.w3schools.com/html/mov_bbb.mp4",user:"@novo"});
render();
}

function perfil(){alert("Perfil Ice 🚀")}

let stream=null;
async function live(){
mainVideo.pause();
mainVideo.style.display="none";

if(!stream){
try{
stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
cam.srcObject=stream;
cam.style.display="block";
placeholder.style.display="none";
liveBtn.innerText="STOP";
status.innerText="AO VIVO";
}catch{alert("Permita câmera")}
}else pararLive();
}

function pararLive(){
if(stream){
stream.getTracks().forEach(t=>t.stop());
stream=null;
cam.style.display="none";
liveBtn.innerText="LIVE";
status.innerText="OFFLINE";
}
}

</script></body></html>`);
});

app.listen(process.env.PORT||3000);
