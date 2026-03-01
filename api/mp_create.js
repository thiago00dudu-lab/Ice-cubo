const mercadopago = require('mercadopago');

mercadopago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Pegando os dados que o seu formulário envia
    const { email, valor } = req.body;

    // Se o email não chegar, o código para aqui com um aviso
    if (!email) {
      return res.status(400).json({ error: "E-mail não enviado pelo formulário" });
    }

    const preference = {
      items: [{
        title: 'Depósito Ice-Cubo',
        unit_price: Number(valor) || 10, // Valor padrão de 10 se não vier nada
        quantity: 1,
      }],
      payer: { email: email },
      back_urls: {
        success: "https://ice-cubo.vercel.app",
        failure: "https://ice-cubo.vercel.app",
      },
      auto_return: "approved",
    };

    try {
      const response = await mercadopago.preferences.create(preference);
      res.status(200).json({ id: response.body.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
