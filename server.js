const express=require("express"),app=express();
app.use(express.urlencoded({extended:true}));

app.get("/",(req,res)=>res.send(`
<!DOCTYPE html><html><head>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>ICE Login</title>
<style>
body{font-family:Arial;background:#f0f8ff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
.card{background:#fff;padding:25px;border-radius:10px;box-shadow:0 0 10px #0003;text-align:center}
input,button{padding:10px;margin:8px;width:200px}
button{background:#87CEFA;border:0;cursor:pointer}
</style></head><body>
<div class=card>
<h2>Login ICE</h2>
<form method=POST action=/login>
<input name=email placeholder=Email required>
<input type=password name=senha placeholder=Senha required>
<button>Entrar</button>
</form></div></body></html>
`));

app.post("/login",(req,res)=>{
const{email,senha}=req.body;
if(email==="admin"&&senha==="1234"){
res.send(`
<!DOCTYPE html><html><head>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>ICE Live</title>
<style>
body{background:#cceeff;font-family:Arial;text-align:center;padding:20px}
video{width:100%;max-width:400px;border-radius:10px}
button{background:#0099ff;color:#fff;border:0;padding:10px 20px;margin:10px;cursor:pointer}
</style></head><body>
<h1>Bem-vindo ao ICE Live 💙</h1>
<button onclick=abrir()>Abrir Câmera</button><br><br>
<video id=cam autoplay playsinline></video>
<script>
async function abrir(){
try{
let s=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
cam.srcObject=s;
}catch(e){alert("Permissão negada")}
}
</script></body></html>
`);
}else{
res.send("<script>alert('Erro no login');location='/'</script>");
}
});

app.listen(process.env.PORT||3000);
