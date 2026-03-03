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
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });

  if (req.method === "GET") {
    const list = (STORE.ofertas || []).slice().sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
    return json(res, 200, list);
  }

  if (req.method === "POST") {
    const b = await readBody(req);

    if (!b || !b.targetImg || !b.offerImg) {
      return json(res, 400, { error: "Faltou targetImg ou offerImg." });
    }

    const item = {
      id: "O" + Date.now() + "-" + Math.random().toString(16).slice(2),
      fromUserId: String(b.fromUserId || ""),
      targetImg: String(b.targetImg || ""),
      targetText: String(b.targetText || ""),
      offerImg: String(b.offerImg || ""),
      offerText: String(b.offerText || ""),
      createdAt: Number(b.createdAt || Date.now()),
    };

    STORE.ofertas.unshift(item);
    return json(res, 200, { ok: true, item });
  }

  return json(res, 405, { error: "Method not allowed" });
}
