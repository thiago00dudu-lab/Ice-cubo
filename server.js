const express = require('express'), app = express(), db = new (require('better-sqlite3'))('db.db');
const PORT = process.env.PORT || 3000; app.use(express.json());

// Banco Simplificado
db.exec("CREATE TABLE IF NOT EXISTS u(id INTEGER PRIMARY KEY, name TEXT, blue REAL, pai_id INTEGER, role TEXT)");

app.get('/', (req, res) => res.send(`
<body style="background:#e0f7fa;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;margin:0">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(15px);padding:30px;border-radius:20px;border:1px solid #fff;text-align:center;width:80%">
        <h2 style="color:#007c91">Cubo de Gelo 🧊</h2>
        <div id="box">
            <button onclick="entrar()" style="background:#00acc1;color:#fff;border:none;padding:15px;border-radius:10px;width:100%;cursor:pointer">LOGIN MASTER ⭐</button>
        </div>
        <video id="v" style="width:100%;display:none;margin-top:15px;border-radius:10px" autoplay playsinline></video>
    </div>
    <script>
        async function entrar(){
            try {
                const s = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
                document.getElementById('v').srcObject = s;
                document.getElementById('v').style.display = 'block';
                document.getElementById('box').innerHTML = "<p style='color:#007c91'><b>ONLINE ✅ (85% Ativado)</b></p>";
                alert("Interface Cubo de Gelo Ativa!");
            } catch(e) { alert("Erro: Ative Câmera/Áudio"); }
        }
    </script>
</body>`));

// Lógica de Vendas (85% Criador, 10% App, 5% Pai)
app.post('/webhook', (req, res) => {
    const { val, uid } = req.body; // val = valor, uid = id usuario
    db.prepare("UPDATE u SET blue = blue + ? WHERE id = ?").run(val * 0.85, uid);
    const user = db.prepare("SELECT pai_id FROM u WHERE id = ?").get(uid);
    if(user?.pai_id) db.prepare("UPDATE u SET blue = blue + ? WHERE id = ?").run(val * 0.05, user.pai_id);
    res.sendStatus(200);
});

app.listen(PORT, () => console.log("Site no Ar"));
