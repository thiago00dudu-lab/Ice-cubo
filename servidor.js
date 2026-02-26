const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve os arquivos estáticos (como o index.html)
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
