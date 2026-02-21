const express = require("express");
const app = express();

app.get("/", (req, res) => {
res.send(`<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ice Cubo</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
body{margin:0;font-family:sans-serif;background:#0f172a;color:#fff;display:flex;flex-direction:column;height:100vh}
.stage{height:45vh;background:#000;position:relative;display:flex;align-items:center;justify-content:center;border-radius:0 0 25px 25px;overflow:hidden}
#viewer,#cam{position:absolute;width:100%;height:100%;object-fit:cover;display:none}
#placeholder{opacity:.5}
.feed{flex:1;overflow:auto;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.card{background:#1e293b;border-radius:15px;overflow:hidden;cursor:pointer;transition:.3s}
.card:hover{transform:scale(1.05)}
.thumb{height:100px;background-size:cover;background-position:center}
.info{padding:5px;font-size:12px;font-weight:bold;color:#38bdf8}
.nav{height:60px;background:#1e293b;display:flex;justify-content:space-around;align-items:center;border-top:1px solid #334155}
.nav i{font-size:22px;color:#38bdf8;cursor:pointer}
.livebtn{position:absolute;bottom:15px;right:15px;background:#ef4444;color:#fff;border:none;padding:8px 15px;border-radius:20px;cursor:pointer}
</style>
</head>
<body>

<div class="stage">
<div id="placeholder">Duplo clique no vídeo ou LIVE</div>
<img id="viewer">
<video id="cam" autoplay playsinline></video>
<button class="livebtn" onclick="live()" id="liveBtn">LIVE</button>
</div>

<div class="feed" id="feed"></div>

<div class="nav">
<i class="fas fa-home" onclick="reset()"></i>
<i class="fas fa-plus-circle" onclick="novoPost()"></i>
<i class="fas fa-video" onclick="live()"></i>
</div>

<script>

let posts=[
{img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70"},
{img:"https://images.unsplash.com/photo-1518770660439-4636190af475"},
{img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"},
{img:"https://images.unsplash.com/photo-1492724441997-5dc865305da7"}
];

const feed=document.getElementById("feed");
const viewer=document.getElementById("viewer");
const cam=document.getElementById("cam");
const placeholder=document.getElementById("placeholder");
const liveBtn=document.getElementById("liveBtn");

function render(){
feed.innerHTML="";
posts.forEach(p=>{
let d=document.createElement("div");
d.className="card";
d.innerHTML=\`<div class="thumb" style="background-image:url('\${p.img}')"></div>\`;
d.ondblclick=()=>show(p.img);
feed.appendChild(d);
});
}
render();

function show(img){
stop();
viewer.src=img;
viewer.style.display="block";
placeholder.style.display="none";
}

function novoPost(){
posts.unshift({img:"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61"});
render();
}

let stream=null;

async function live(){
if(!stream){
try{
stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
cam.srcObject=stream;
viewer.style.display="none";
placeholder.style.display="none";
cam.style.display="block";
liveBtn.innerText="STOP";
}catch{alert("Permita câmera");}
}else{stop();}
}

function stop(){
if(stream){
stream.getTracks().forEach(t=>t.stop());
stream=null;
}
cam.style.display="none";
viewer.style.display="none";
placeholder.style.display="block";
liveBtn.innerText="LIVE";
}

function reset(){
stop();
}

</script>

</body></html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Ice rodando na porta " + PORT));
