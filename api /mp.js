const { MercadoPagoConfig, Payment } = require('mercadopago');

// O seu Token deve estar nas Environment Variables da Vercel como MP_ACCESS_TOKEN
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

module.exports = async (req, res) => {
  // Permite que o seu site acesse a API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const payment = new Payment(client);

  const paymentData = {
    body: {
      transaction_amount: 10.00, // Valor fixo de teste, mude conforme precisar
      description: 'Pagamento Ice-Cubo',
      payment_method_id: 'pix',
      payer: {
        email: 'cliente@email.com',
        identification: { type: 'CPF', number: '00000000000' }
      }
    }
  };

  try {
    const result = await payment.create(paymentData);
    // Retorna os dados do Pix para o seu site
    return res.status(200).json({
      id: result.id,
      qr_code: result.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
      status: result.status
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao gerar Pix', details: error.message });
  }
};
