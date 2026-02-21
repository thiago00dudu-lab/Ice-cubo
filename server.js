<script>
let posts=[
{vid:"https://www.w3schools.com/html/mov_bbb.mp4",user:"@neo"},
{vid:"https://www.w3schools.com/html/movie.mp4",user:"@tech"},
{vid:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",user:"@future"},
{vid:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/forest.mp4",user:"@cyber"}
];

const feed=document.getElementById("feed");
const placeholder=document.getElementById("placeholder");
const expand=document.getElementById("expand");
const cam=document.getElementById("cam");
const liveBtn=document.getElementById("liveBtn");
const searchBox=document.getElementById("searchBox");
const status=document.getElementById("status");

function render(){
feed.innerHTML="";
posts.forEach(p=>{
let d=document.createElement("div");
d.className="card";
d.innerHTML='<video src="'+p.vid+'" class="thumb" muted></video><div class="info">'+p.user+'</div>';
d.ondblclick=()=>showVideo(p.vid);
feed.appendChild(d);
});
}
render();

function showVideo(src){
stop();
placeholder.style.display="none";
expand.style.display="none";
cam.style.display="none";

let v=document.createElement("video");
v.src=src;
v.autoplay=true;
v.controls=true;
v.style.width="100%";
v.style.height="100%";
v.style.objectFit="cover";
v.id="mainVideo";

document.querySelector(".stage").appendChild(v);
}

function home(){
stop();
let mv=document.getElementById("mainVideo");
if(mv) mv.remove();
placeholder.style.display="block";
}

function toggleSearch(){
searchBox.style.display=searchBox.style.display==="none"?"block":"none";
}

function buscar(v){
let f=posts.filter(p=>p.user.toLowerCase().includes(v.toLowerCase()));
feed.innerHTML="";
f.forEach(p=>{
let d=document.createElement("div");
d.className="card";
d.innerHTML='<video src="'+p.vid+'" class="thumb" muted></video><div class="info">'+p.user+'</div>';
d.ondblclick=()=>showVideo(p.vid);
feed.appendChild(d);
});
}

function novoPost(){
posts.unshift({vid:"https://www.w3schools.com/html/mov_bbb.mp4",user:"@novo"});
render();
}

function perfil(){alert("Perfil Ice 🚀")}

let stream=null;
async function live(){
let mv=document.getElementById("mainVideo");
if(mv) mv.remove();

if(!stream){
try{
stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
cam.srcObject=stream;
placeholder.style.display="none";
cam.style.display="block";
liveBtn.innerText="STOP";
status.innerText="AO VIVO";
}catch{alert("Permita câmera")}
}else stop();
}

function stop(){
if(stream){
stream.getTracks().forEach(t=>t.stop());
stream=null;
cam.style.display="none";
liveBtn.innerText="LIVE";
status.innerText="OFFLINE";
}
}
</script>
