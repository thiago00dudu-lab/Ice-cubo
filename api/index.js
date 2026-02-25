const https = require("https");

function send(res, status, contentType, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

module.exports = async (req, res) => {
  const token = process.env.MP_ACCESS_TOKEN;

  // =========================
  // ROTA DE PAGAMENTO (POST)
  // =========================
  if (req.method === "POST") {
    if (!token) {
      return send(res, 500, "application/json",
        JSON.stringify({ ok: false, error: "MP_ACCESS_TOKEN não configurado" })
      );
    }

    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : {};

    const email = body.email;
    const amount = Number(body.amount);

    if (!email || !amount) {
      return send(res, 400, "application/json",
        JSON.stringify({ ok: false, error: "Envie email e amount" })
      );
    }

    const paymentData = JSON.stringify({
      transaction_amount: amount,
      description: "Compra ICE-CUBO",
      payment_method_id: "pix",
      payer: { email },
    });

    const options = {
      hostname: "api.mercadopago.com",
      path: "/v1/payments",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(paymentData),
      },
    };

    const mpReq = https.request(options, (mpRes) => {
      let data = "";
      mpRes.on("data", (chunk) => (data += chunk));
      mpRes.on("end", () => {
        const json = JSON.parse(data);
        const tx = json.point_of_interaction?.transaction_data || {};

        send(res, 200, "application/json", JSON.stringify({
          ok: true,
          qr_code: tx.qr_code || null,
          qr_code_base64: tx.qr_code_base64 || null,
        }));
      });
    });

    mpReq.on("error", (err) => {
      send(res, 500, "application/json",
        JSON.stringify({ ok: false, error: err.message })
      );
    });

    mpReq.write(paymentData);
    mpReq.end();
    return;
  }

  // =========================
  // PÁGINA PRINCIPAL (GET)
  // =========================
  send(res, 200, "text/html; charset=utf-8", `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ICE-CUBO PIX</title>
</head>
<body>
<h2>Pagamento PIX - ICE-CUBO</h2>

<input type="email" id="email" placeholder="Seu email" />
<input type="number" id="valor" placeholder="Valor" />
<button onclick="pagar()">Gerar PIX</button>

<div id="resultado"></div>

<script>
async function pagar() {
  const email = document.getElementById("email").value;
  const amount = document.getElementById("valor").value;

  const r = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount })
  });

  const data = await r.json();

  if (!data.ok) {
    document.getElementById("resultado").innerHTML =
      "<p style='color:red'>" + data.error + "</p>";
    return;
  }

  document.getElementById("resultado").innerHTML = \`
    <img src="data:image/png;base64,\${data.qr_code_base64}" width="250"/>
    <textarea rows="4" cols="40">\${data.qr_code}</textarea>
  \`;
}
</script>

</body>
</html>
  `);
};
