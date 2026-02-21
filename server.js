const express = require('express');
const app = express();

app.get('/', (req, res) => {
res.send(`<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ice-Cubo Premium</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
body{margin:0;font-family:sans-serif;background:#f0f9ff;display:flex;flex-direction:column;height:100vh}
.stage{height:45vh;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;position:relative;border-radius:0 0 30px 30px;overflow:hidden}
video,.expand{position:absolute;width:100%;height:100%;object-fit:cover;display:none}
.feed{flex:1;overflow:auto;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.card{background:#fff;border-radius:15px;overflow:hidden;box-shadow:0 3px 8px rgba(0,0,0,.1);cursor:pointer}
.thumb{height:100px;background-size:cover;background-position:center}
.info{padding:5px;font-size:12px;font-weight:bold;color:#1e3a8a}
.nav{height:60px;background:#fff;display:flex;justify-content:space-around;align-items:center;border-top:1px solid #ddd}
.nav i{font-size:22px;color:#1e3a8a}
.livebtn{position:absolute;bottom:15px;right:15px;background:#ef4444;color:#fff;border:none;padding:8px 15px;border-radius:20px;cursor:pointer}
</style>
</head>
<body>

<div class="stage" id="stage">
<div id="placeholder">Clique num post ou inicie live</div>
<div class="expand" id="expand"></div>
<video id="cam" autoplay playsinline></video>
<button class="livebtn" onclick="live()" id="liveBtn">LIVE</button>
</div>

<div class="feed" id="feed"></div>

<div class="nav">
<i class="fas fa-home"></i>
<i class="fas fa-search"></i>
<i class="fas fa-plus-circle"></i>
<i class="fas fa-video"></i>
<i class="fas fa-user"></i>
</div>

<script>
const posts=[
{img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70"},
{img:"https://images.unsplash.com/photo-1518770660439-4636190af475"},
{img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"},
{img:"https://images.unsplash.com/photo-1492724441997-5dc865305da7"}
];

const feed=document.getElementById("feed");
posts.forEach(p=>{
let d=document.createElement("div");
d.className="card";
d.innerHTML=\`<div class="thumb" style="background-image:url('\${p.img}')"></div><div class="info">@user</div>\`;
d.onclick=()=>show(p.img);
feed.appendChild(d);
});

function show(img){
stop();
placeholder.style.display="none";
cam.style.display="none";
expand.style.display="block";
expand.style.backgroundImage=\`url('\${img}')\`;
}

let stream=null;
async function live(){
if(!stream){
try{
stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
cam.srcObject=stream;
placeholder.style.display="none";
expand.style.display="none";
cam.style.display="block";
liveBtn.innerText="STOP";
}catch{alert("Permita câmera");}
}else stop();
}

function stop(){
if(stream){
stream.getTracks().forEach(t=>t.stop());
stream=null;
cam.style.display="none";
placeholder.style.display="block";
liveBtn.innerText="LIVE";
}
}
</script>

</body></html>`);
});

app.listen(3000,()=>console.log("Ice rodando"));
