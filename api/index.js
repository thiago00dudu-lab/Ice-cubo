// api/index.js
const https = require("https");
const { URL } = require("url");

// Funções Auxiliares
function sendHTML(res, html) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}

function sendJSON(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => resolve(d));
  });
}

const ADM_LOGIN = "ADM";
const ADM_SENHA = "1533";

const MP_ACCESS_TOKEN = (process.env.MP_ACCESS_TOKEN || "").trim();

function baseURLFromReq(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  return `${proto}://${host}`;
}

// Exportação principal para Vercel
module.exports = async (req, res) => {
  try {
    const u = new URL(req.url || "/", baseURLFromReq(req));
    const op = u.searchParams.get("op") || "";

    // ---------- ROTAS API ----------
    if (op === "health") {
      return sendJSON(res, 200, { ok: true, msg: "ICE-CUBO API Online ✅" });
    }

    // Rota Inicial (UI)
    sendHTML(res, `
      <!DOCTYPE html>
      <html>
        <head><title>ICE CUBO</title></head>
        <body style="background:#000; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px;">
          <h1>🧊 ICE CUBO ONLINE</h1>
          <p>Status: <span style="color:#0f0">Connected</span></p>
          <p>Modo: MVP Protótipo (LocalStorage)</p>
        </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { error: "Internal Server Error", details: err.message });
  }
};
