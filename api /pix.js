import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ erro: "Use POST" });
    }

    const { valor, email } = req.body || {};

    if (!valor || !email) {
      return res.status(400).json({ erro: "Faltou valor ou email" });
    }

    if (!process.env.ACCESS_TOKEN) {
      return res.status(500).json({ erro: "ACCESS_TOKEN não está na Vercel" });
    }

    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      {
        transaction_amount: Number(valor),
        description: "Depósito Ice Blue",
        payment_method_id: "pix",
        payer: { email }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
        }
      }
    );

    const td = response.data?.point_of_interaction?.transaction_data;

    return res.status(200).json({
      id: response.data.id,
      status: response.data.status,
      qr_code: td?.qr_code || null,
      qr_code_base64: td?.qr_code_base64 || null
    });
  } catch (error) {
    return res.status(500).json({
      erro: error.response?.data || String(error)
    });
  }
}
