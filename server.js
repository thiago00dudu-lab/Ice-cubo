<script>

let posts=[
{img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70",user:"@neo"},
{img:"https://images.unsplash.com/photo-1518770660439-4636190af475",user:"@tech"},
{img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",user:"@future"},
{img:"https://images.unsplash.com/photo-1492724441997-5dc865305da7",user:"@cyber"}
];

const feed=document.getElementById("feed");
const placeholder=document.getElementById("placeholder");
const expand=document.getElementById("expand");
const cam=document.getElementById("cam");
const liveBtn=document.getElementById("liveBtn");
const searchBox=document.getElementById("searchBox");

function render(lista=posts){
feed.innerHTML="";
lista.forEach(p=>{
let d=document.createElement("div");
d.className="card";
d.innerHTML=`<div class="thumb" style="background-image:url('${p.img}')"></div>
<div class="info">${p.user}</div>`;
d.ondblclick=()=>show(p.img);
feed.appendChild(d);
});
}
render();

function show(img){
stop();
placeholder.style.display="none";
expand.style.display="block";
expand.style.backgroundImage=`url('${img}')`;
}

function home(){
stop();
expand.style.display="none";
placeholder.style.display="block";
render();
}

function toggleSearch(){
searchBox.style.display=
searchBox.style.display==="none"?"block":"none";
}

function buscar(valor){
let filtrado=posts.filter(p=>
p.user.toLowerCase().includes(valor.toLowerCase())
);
render(filtrado);
}

function novoPost(){
let input=document.createElement("input");
input.type="file";
input.accept="image/*";
input.onchange=e=>{
let file=e.target.files[0];
if(!file)return;
let reader=new FileReader();
reader.onload=function(ev){
posts.unshift({
img:ev.target.result,
user:"@voce"
});
render();
};
reader.readAsDataURL(file);
};
input.click();
}

function perfil(){
stop();
expand.style.display="block";
placeholder.style.display="none";
expand.innerHTML=`
<div style="padding:20px;text-align:center">
<h2 style="color:#38bdf8">Seu Perfil 🚀</h2>
<p>Usuário: @voce</p>
<p>Total de posts: ${posts.length}</p>
<button onclick="editarPerfil()" style="padding:8px 15px;
border:none;border-radius:10px;background:#38bdf8;color:#000">
Editar Perfil
</button>
</div>`;
}

function editarPerfil(){
alert("Função de edição em desenvolvimento 🔥");
}

let stream=null;
async function live(){
if(!stream){
try{
stream=await navigator.mediaDevices.getUserMedia({
video:true,
audio:true
});
cam.srcObject=stream;
placeholder.style.display="none";
expand.style.display="none";
cam.style.display="block";
liveBtn.innerText="STOP";
}catch{
alert("Permita câmera");
}
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
