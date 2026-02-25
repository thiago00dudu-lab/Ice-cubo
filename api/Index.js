👇
// api/index.js (Vercel) — ICE-CUBO "1 arquivo" (UI + API)
// MVP: Login/Registro + Timeline (post foto/vídeo) + Perfil + Carteira (Depósito/Saque) + ADM/MOD + Ban
// OBS: Dados do APP ficam no localStorage do navegador (protótipo). Em produção real use DB (KV/Postgres).
// Mercado Pago: depósito REAL via Checkout (abre link). Saque REAL automático exige backend + compliance.
// ENV opcional: MP_ACCESS_TOKEN (se tiver, habilita "Depósito Real (MP)").
// ENV opcional: MP_WEBHOOK_SECRET (se quiser validar webhook depois).

const https = require("https");
const { URL } = require("url");

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
function httpJSON(method, url, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = bodyObj ? JSON.stringify(bodyObj) : null;
    const opts = {
      method,
      hostname: u.hostname,
      path: u.pathname + (u.search || ""),
      headers: {
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        ...(headers || {}),
      },
    };
    const r = https.request(opts, (resp) => {
      let s = "";
      resp.on("data", (c) => (s += c));
      resp.on("end", () => {
        let json = null;
        try { json = s ? JSON.parse(s) : null; } catch {}
        resolve({ status: resp.statusCode, json, text: s });
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

const ADM_LOGIN = "ADM";
const ADM_SENHA = "1533";

const MP_ACCESS_TOKEN = (process.env.MP_ACCESS_TOKEN || "").trim();
const MP_WEBHOOK_SECRET = (process.env.MP_WEBHOOK_SECRET || "").trim();

function baseURLFromReq(req) {
  // Não quebra se BASE_URL não existir. Usa o host real da request.
  const proto = (req.headers["x-forwarded-proto"] || "https").toString();
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "").toString();
  return `${proto}://${host}`;
}

module.exports = async (req, res) => {
  try {
    const u = new URL(req.url, baseURLFromReq(req));
    const op = u.searchParams.get("op") || "";

    // ---------- API ----------
    if (op === "health") return sendJSON(res, 200, { ok: true, msg: "API ICE-CUBO online" });
