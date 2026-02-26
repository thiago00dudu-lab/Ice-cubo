const MP = "https://api.mercadopago.com";

module.exports = async (req, res) => {
    try {
        const token = process.env.MP_ACCESS_TOKEN;
        if (!token) return res.status(500).json({ OK: false, error: "MP_ACCESS_TOKEN não configurado" });
        if (req.method !== "POST") return res.status(405).json({ OK: false, error: "Usar POST" });

        let body = req.body;
        if (!body) {
            let cru = "";
            await new Promise((resolve) => {
                req.on("data", (c) => (cru += c));
                req.on("end", resolve);
            });
            body = JSON.parse(cru || "{}");
        }

        const email = String(body.email || "").trim();
        const quantia = Number(body.quantia);

        if (!email || !quantia || isNaN(quantia)) {
            return res.status(400).json({ OK: false, error: "Envie email e valor" });
        }

        const transaction_amount = Math.round(quantia * 100) / 100;

        const r = await fetch(`${MP}/v1/payments`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": Date.now().toString(36) + Math.random().toString(16).slice(2),
            },
            body: JSON.stringify({
                transaction_amount,
                description: "Compre BLUE ICE-CUBO",
                payment_method_id: "pix",
                payer: { email },
            }),
        });

        const dados = await r.json();
        if (!r.ok) return res.status(400).json({ OK: false, error: dados });

        const tx = dados.point_of_interaction?.transaction_data || {};

        return res.status(200).json({
            OK: true,
            id_do_pagamento: dados.id,
            status: dados.status,
            quantia: dados.transaction_amount,
            codigo_qr: tx.qr_code || null,
            codigo_qr_base64: tx.qr_code_base64 || null,
        });

    } catch (e) {
        return res.status(500).json({ OK: false, error: e.message });
    }
};
