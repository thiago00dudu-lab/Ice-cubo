const MP = "https://api.mercadopago.com";

module.exports = async (req, res) => {
    try {
        const token = process.env.MP_ACCESS_TOKEN;
        if (!token) {
            return res.status(500).json({ OK: false, error: "MP_ACCESS_TOKEN não configurado" });
        }

        const { payment_id } = req.query;

        if (!payment_id) {
            return res.status(400).json({ OK: false, error: "Passe ?payment_id=" });
        }

        const r = await fetch(`${MP}/v1/payments/${payment_id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const dados = await r.json();

        if (!r.ok) {
            return res.status(400).json({ OK: false, error: dados });
        }

        return res.status(200).json({
            OK: true,
            id: dados.id,
            status: dados.status,
            valor: dados.transaction_amount,
        });

    } catch (e) {
        return res.status(500).json({ OK: false, error: e.message });
    }
};
