const express = require('express');
const app = express();

// O Render exige que a porta seja dinâmica
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Seu app Cubo de Gelo está online!');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
  
