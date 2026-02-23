import axios from "axios";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { valor, email } = req.body;

  try {
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

    return res.status(200).json({
      id: response.data.id,
      qr_code: response.data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64:
        response.data.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (error) {
    return res.status(500).json({
      erro: error.response?.data || "Erro ao gerar PIX"
    });
  }
}
