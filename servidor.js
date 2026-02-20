// Exemplo de rota de cadastro no servidor.js
const bcrypt = require('bcrypt');

app.post('/cadastro', async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    
    try {
        const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        stmt.run(username, hash);
        res.status(201).send("Usuário cadastrado!");
    } catch (e) {
        res.status(400).send("Usuário já existe.");
    }
});
