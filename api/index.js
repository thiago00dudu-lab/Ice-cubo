const https = require("https");
const { URL } = require("url");

// Função para enviar o HTML para o navegador
function enviarHTML(res, html) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}

// Função para enviar respostas em JSON (ex: erros ou status)
function enviarJSON(res, codigo, obj) {
  res.statusCode = codigo;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

// Função principal que a Vercel executa
module.exports = async (req, res) => {
  try {
    // Definindo variáveis de host e URL corretamente
    const host = req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || "https";
    const u = new URL(req.url, `${proto}://${host}`);
    const op = u.searchParams.get("op") || "";

    // Rota de teste de saúde
    if (op === "saude") {
      return enviarJSON(res, 200, { status: "OK", online: true });
    }

    // HTML do seu site (99 Food / ICE CUBO)
    const html = `
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ICE CUBO</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #0b1220; color: #fff; }
    .top { height: 45vh; background: #000; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .wrap { padding: 20px; text-align: center; }
    .bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around; background: #1a2436; padding: 10px 0; }
    .btn { padding: 10px 20px; border-radius: 8px; border: 1px solid #30363d; background: #21262d; color: #fff; cursor: pointer; }
    .btn:hover { background: #30363d; }
  </style>
</head>
<body>
  <div class="top">SITE EM RECUPERAÇÃO</div>
  <div class="wrap">
    <h2>Recuperação do ICE-CUBO</h2>
    <p>Seu site foi restaurado com sucesso.</p>
  </div>
  <div class="bar">
    <button class="btn">Casa</button>
    <button class="btn">Câmera</button>
    <button class="btn">Perigo</button>
  </div>
</body>
</html>`;

    // IMPORTANTE: Envia o HTML para o navegador finalizar o carregamento
    return enviarHTML(res, html);

  } catch (e) {
    // Caso ocorra qualquer erro no código acima
    return enviarJSON(res, 500, { status: "Erro", mensagem: e.message });
  }
};
