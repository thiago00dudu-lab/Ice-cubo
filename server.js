const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =================== BLUE ===================
const BLUE_MAX_SUPPLY = 21000000;
let blueTotalSupply = 0;

// =================== DADOS ===================
const users = new Map();
const sessions = new Map();

users.set("admin", {
  pass: "1533",
  role: "MASTER",
  saldoBlue: 0,
  children: new Set(),
  parent: null,
  banned: false
});

// =================== FUNÇÕES ===================
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

function requireMaster(req,res,next){
  const me=auth(req);
  if(!me||me.role!=="MASTER") return res.send("Acesso negado");
  req.me=me;
  next();
}

// =================== LOGIN ===================
app.get("/login",(req,res)=>{
  res.send(`
  <html><body style="background:#0f172a;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh">
  <form method="POST">
  <h2>ICE CUBO</h2>
  <input name="user" placeholder="Usuário" required><br><br>
  <input name="pass" type="password" placeholder="Senha" required><br><br>
  <button>Entrar</button>
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

// =================== APP ===================
app.get("/",requireAuth,(req,res)=>{
  const me=req.me;
  const star=me.role==="MASTER"?"⭐":"";
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name=viewport content="width=device-width,initial-scale=1">
<style>
body{margin:0;background:#08122c;color:white;font-family:sans-serif;overflow:hidden}
.stage{height:55vh;background:black;position:relative}
video{width:100%;height:100%;object-fit:cover}
.nav{position:fixed;bottom:0;width:100%;height:60px;background:#1e293b;display:flex;justify-content:space-around;align-items:center}
.nav button{background:none;border:none;color:#38bdf8;font-size:20px}
.panic{animation:panic 1s infinite}
@keyframes panic{
0%{background:#08122c}
50%{background:#3b0000}
100%{background:#08122c}
}
.alert{position:fixed;top:0;width:100%;background:red;text-align:center;padding:5px;font-weight:bold}
.profile{padding:10px}
.trade{padding:10px;display:none}
.admin{padding:10px;display:none}
</style>
</head>
<body>

<div id="alertBox"></div>

<div class="stage">
<video id="main" controls></video>
</div>

<div class="profile" id="profile">
<h3>@${req.me.username} ${star}</h3>
<p>BLUE: ${req.me.saldoBlue}</p>
<p>Filhos: ${req.me.children.size}</p>
<button onclick="share()">Compartilhar</button>
</div>

<div class="trade" id="trade">
<h3>O que tem pra mim 🔄</h3>
<input id="t1" placeholder="O que você tem"><br><br>
<input id="t2" placeholder="O que quer em troca"><br><br>
<button onclick="alert('Troca publicada')">Publicar</button>
</div>

${me.role==="MASTER"?`
<div class="admin" id="admin">
<h3>Painel ADM ⭐</h3>
<p>Total BLUE emitido: ${blueTotalSupply}/${BLUE_MAX_SUPPLY}</p>
<input id="mint" placeholder="Emitir BLUE"><br><br>
<button onclick="mintBlue()">Emitir</button>
<br><br>
<input id="giveUser" placeholder="Usuário"><br>
<input id="giveVal" placeholder="Quantidade"><br><br>
<button onclick="giveBlue()">Dar BLUE</button>
</div>
`:``}

<div class="nav">
<button onclick="showProfile()">🏠</button>
<button onclick="showTrade()">🔄</button>
<button onclick="panic()">⚠️</button>
${me.role==="MASTER"?`<button onclick="showAdmin()">🛡️</button>`:``}
</div>

<script>
let panicOn=false;

function panic(){
panicOn=!panicOn;
document.body.classList.toggle("panic",panicOn);
if(panicOn){
document.getElementById("alertBox").innerHTML='<div class="alert">🚨 LOCALIZAÇÃO SENDO COMPARTILHADA 🚨</div>';
}else{
document.getElementById("alertBox").innerHTML="";
}
}

function showProfile(){
profile.style.display="block";
trade.style.display="none";
${me.role==="MASTER"?"admin.style.display='none';":""}
}

function showTrade(){
profile.style.display="none";
trade.style.display="block";
${me.role==="MASTER"?"admin.style.display='none';":""}
}

function showAdmin(){
profile.style.display="none";
trade.style.display="none";
admin.style.display="block";
}

function share(){
navigator.clipboard.writeText(location.origin+"/register?ref=${req.me.username}");
alert("Link copiado!");
}

${me.role==="MASTER"?`
function mintBlue(){
fetch("/admin/mint",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({val:mint.value})})
.then(()=>location.reload());
}

function giveBlue(){
fetch("/admin/give",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:giveUser.value,val:giveVal.value})})
.then(()=>location.reload());
}
`:``}

</script>
</body>
</html>
`);
});

// =================== BLUE ROTAS ===================
app.post("/admin/mint",requireMaster,(req,res)=>{
const val=Number(req.body.val||0);
if(blueTotalSupply+val>BLUE_MAX_SUPPLY) return res.send("Limite máximo atingido");
blueTotalSupply+=val;
res.send("OK");
});

app.post("/admin/give",requireMaster,(req,res)=>{
const user=users.get(req.body.user);
if(!user) return res.send("Usuário não existe");
user.saldoBlue+=Number(req.body.val||0);
res.send("OK");
});

// ===================
module.exports = app;
