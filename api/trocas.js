let STORE = globalThis.__ICE_STORE__;
if (!STORE) STORE = globalThis.__ICE_STORE__ = { trocas: [], ofertas: [] };

function json(res, code, data) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  // Se já veio parseado (às vezes acontece), retorna direto
  if (req.body && typeof req.body === "object") return req.body;

  // Lê o stream e faz parse do JSON
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });

  if (req.method === "GET") {
    // mais novo primeiro
    const list = (STORE.trocas || []).slice().sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
    return json(res, 200, list);
  }

  if (req.method === "POST") {
    const b = await readBody(req);

    // valida mínimo
    if (!b || !b.img) return json(res, 400, { error: "Faltou img (base64/dataURL)." });

    const item = {
      id: "T" + Date.now() + "-" + Math.random().toString(16).slice(2),
      userId: String(b.userId || ""),
      userName: String(b.userName || "Usuário"),
      userPic: String(b.userPic || ""),
      text: String(b.text || "Troca disponível!"),
      img: String(b.img || ""),
      createdAt: Number(b.createdAt || Date.now()),
    };

    STORE.trocas.unshift(item);
    return json(res, 200, { ok: true, item });
  }

  return json(res, 405, { error: "Method not allowed" });
}
