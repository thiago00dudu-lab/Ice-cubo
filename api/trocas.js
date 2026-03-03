let STORE = globalThis.__ICE_STORE__;
if (!STORE) STORE = globalThis.__ICE_STORE__ = { trocas: [], ofertas: [] };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).json({ ok: true });

  if (req.method === "GET") {
    const list = (STORE.trocas || []).slice().sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
    return res.status(200).json(list);
  }

  if (req.method === "POST") {
    const b = req.body || {};
    if (!b.img) return res.status(400).json({ error: "Faltou img" });

    const item = {
      id: "T" + Date.now(),
      userId: String(b.userId || ""),
      userName: String(b.userName || "Usuário"),
      userPic: String(b.userPic || ""),
      text: String(b.text || "Troca disponível!"),
      img: String(b.img || ""),
      createdAt: Number(b.createdAt || Date.now()),
    };

    STORE.trocas.unshift(item);
    return res.status(200).json({ ok: true, item });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
