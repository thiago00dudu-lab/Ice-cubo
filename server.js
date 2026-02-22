const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ================= BLUE ================= */
const BLUE_MAX = 21000000;
let blueSupply = 0;

/* ================= BANCO EM MEMÓRIA ================= */
const users = new Map();
const sessions = new Map();

/* ADMIN MASTER */
users.set("admin", {
  pass: "1533",
  role: "MASTER",
  saldo: 0,
  children: new Set(),
  parent: null,
  banned: false
});

/* ================= FUNÇÕES ================= */
function sid(){ return Math.random().toString(36).slice(2); }

function cookie(req){
  const c=req.headers.cookie||"";
  const o={};
  c.split(";").forEach(p=>{
    const s=p.trim().split("=");
    if(s[0]) o[s[0]]=decodeURIComponent(s[1]||"");
  });
  return o;
}

function auth(req){
  const c=cookie(req);
  const u=c.sid && sessions.get(c.sid);
  if(!u) return null;
  const user=users.get(u);
  if(!user||user.banned) return null;
  return {username:u,...user};
}

function requireAuth(req,res,next){
  const me=auth(req);
  if(!me) return res.redirect("/login");
  req.me=me;
  next();
}

/* ================= LOGIN ================= */
app.get("/login",(req,res)=>{
res.send(`
<html><body style="background:#0f172a;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh">
<form method="POST">
<h2>ICE CUBO</h2>
<input name="user" placeholder="Usuário" required><br><br>
<input name="pass" type="password" placeholder="Senha" required><br><br>
<button>Entrar</button>
<p>Não tem conta? <a href="/register" style="color:#38bdf8">Cadastrar</a></p>
</form>
</body></html>
`);
});

app.post("/login",(req,res)=>{
const u=users.get(req.body.user);
if(!u||u.pass!==req.body.pass) return res.redirect("/login");
const id=sid();
sessions.set(id,req.body.user);
res.setHeader("Set-Cookie",`sid=${id}; Path=/`);
res.redirect("/");
});

/* ================= CADASTRO ================= */
app.get("/register",(req,res)=>{
res.send(`
<html><body style="background:#0f172a;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh">
<form method="POST">
<h2>Criar Conta</h2>
<input name="user" placeholder="Usuário" required><br><br>
<input name="pass" type="password" placeholder="Senha" required><br><br>
<button>Cadastrar</button>
<p><a href="/login" style="color:#38bdf8">Voltar</a></p>
</form>
</body></html>
`);
});

app.post("/register",(req,res)=>{
if(users.has(req.body.user)) return res.redirect("/register");
users.set(req.body.user,{
pass:req.body.pass,
role:"USER",
saldo:0,
children:new Set(),
parent:null,
banned:false
});
res.redirect("/login");
});

/* ================= APP ================= */
app.get("/",requireAuth,(req,res)=>{
const me=req.me;
const star=me.role==="MASTER"?"⭐":"";
res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name=viewport content="width=device-width,initial-scale=1">
<style>
body{margin:0;background:#08122c;color:white;font-family:sans-serif}
.stage{height:50vh;background:black}
video{width:100%;height:100%;object-fit:cover}
.section{display:none;padding:10px}
.active{display:block}
.nav{position:fixed;bottom:0;width:100%;height:60px;background:#1e293b;display:flex;justify-content:space-around;align-items:center}
.nav button{background:none;border:none;color:#38bdf8;font-size:20px}
.panic{animation:panic 1s infinite}
@keyframes panic{0%{background:#08122c}50%{background:#3b0000}100%{background:#08122c}}
.alert{position:fixed;top:0;width:100%;background:red;text-align:center;padding:5px}
</style>
</head>
<body>

<div id="alertBox"></div>

<div class="stage">
<video controls src="https://www.w3schools.com/html/mov_bbb.mp4"></video>
</div>

<div id="timeline" class="section active">
<h3>Timeline Pública</h3>
<p>Aqui ficam vídeos e fotos de todos.</p>
</div>

<div id="profile" class="section">
<h3>@${me.username} ${star}</h3>
<p>BLUE: ${me.saldo}</p>
<p>Filhos: ${me.children.size}</p>
</div>

${me.role==="MASTER"?`
<div id="admin" class="section">
<h3>Painel MASTER</h3>
<p>Supply: ${blueSupply}/${BLUE_MAX}</p>
<input id="mint" placeholder="Emitir BLUE">
<button onclick="mintBlue()">Emitir</button>
</div>
`:``}

<div class="nav">
<button onclick="show('timeline')">🎬</button>
<button onclick="show('profile')">🏠</button>
<button onclick="panic()">⚠️</button>
${me.role==="MASTER"?`<button onclick="show('admin')">🛡️</button>`:``}
</div>

<script>
function show(id){
document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

let panicOn=false;
function panic(){
panicOn=!panicOn;
document.body.classList.toggle("panic",panicOn);
if(panicOn){
alertBox.innerHTML='<div class="alert">🚨 LOCALIZAÇÃO COMPARTILHADA 🚨</div>';
}else alertBox.innerHTML="";
}

${me.role==="MASTER"?`
function mintBlue(){
fetch("/admin/mint",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({val:mint.value})})
.then(()=>location.reload());
}
`:``}
</script>

</body>
</html>
`);
});

/* ================= BLUE ================= */
app.post("/admin/mint",(req,res)=>{
const me=auth(req);
if(!me||me.role!=="MASTER") return res.send("Negado");
const v=Number(req.body.val||0);
if(blueSupply+v>BLUE_MAX) return res.send("Limite atingido");
blueSupply+=v;
res.send("OK");
});

module.exports = app;
