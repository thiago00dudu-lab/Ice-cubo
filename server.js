const express=require("express");
const app=express();

app.get("/",(req,res)=>{
res.send(`<!DOCTYPE html><html lang="pt-br"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ICE Premium</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
body{margin:0;font-family:sans-serif;background:#0f172a;color:#fff;display:flex;flex-direction:column;height:100vh}
.stage{height:45vh;background:#000;display:flex;align-items:center;justify-content:center;position:relative;border-radius:0 0 20px 20px;overflow:hidden}
#mainVideo,#cam{position:absolute;width:100%;height:100%;object-fit:cover;display:none}
.feed{flex:1;overflow:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.card{background:#1e293b;border-radius:12px;overflow:hidden}
.card video{width:100%;height:100px;object-fit:cover}
.nav{height:55px;background:#111827;display:flex;justify-content:space-around;align-items:center}
.nav i{color:#38bdf8;font-size:22px;cursor:pointer}
</style></head><body>

<div class="stage">
<div id="placeholder">ICE 🚀</div>
<video id="mainVideo" controls></video>
<video id="cam" autoplay playsinline></video>
</div>

<div class="feed" id="feed"></div>

<div class="nav">
<i class="fas fa-home" onclick="home()"></i>
<i class="fas fa-video" onclick="ativarCam()"></i>
<i class="fas fa-stop" onclick="pararCam()"></i>
</div>

<script>
var videos=[
"https://www.w3schools.com/html/mov_bbb.mp4",
"https://www.w3schools.com/html/movie.mp4"
];

var feed=document.getElementById("feed");
var main=document.getElementById("mainVideo");
var cam=document.getElementById("cam");
var placeholder=document.getElementById("placeholder");
var stream=null;

function render(){
feed.innerHTML="";
videos.forEach(v=>{
var d=document.createElement("div");
d.className="card";
d.innerHTML="<video src='"+v+"'></video>";
d.ondblclick=function(){subir(v)};
feed.appendChild(d);
});
}
render();

function subir(src){
pararCam();
placeholder.style.display="none";
main.style.display="block";
main.src=src;
main.play();
}

function home(){
pararCam();
main.pause();
main.style.display="none";
placeholder.style.display="flex";
}

async function ativarCam(){
if(stream)return;
try{
stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
cam.srcObject=stream;
cam.style.display="block";
main.style.display="none";
placeholder.style.display="none";
}catch{alert("Permita câmera");}
}

function pararCam(){
if(stream){
stream.getTracks().forEach(t=>t.stop());
stream=null;
cam.style.display="none";
}
}
</script></body></html>`);
});

app.listen(process.env.PORT||3000);
