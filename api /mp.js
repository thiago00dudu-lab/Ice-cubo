const { MercadoPagoConfig, Payment } = require('mercadopago');
const { v4: uuidv4 } = require('uuid'); // Recomendado instalar: npm install uuid

// Configuração do Cliente
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

module.exports = async (req, res) => {
  // Configuração de Headers para evitar erros de CORS no frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Idempotency-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verifica se o método é POST (Obrigatório para gerar Pix)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const payment = new Payment(client);

  // Dados do Pagamento
  const body = {
    transaction_amount: 10.00, // Você pode receber o valor via req.body se preferir
    description: 'Pagamento Ice-Cubo',
    payment_method_id: 'pix',
    payer: {
      email: 'teste@email.com',
      identification: { type: 'CPF', number: '00000000000' } // CPF real do pagador
    }
  };

  // Header de Idempotência (Obrigatório para evitar erro 400 em contas novas)
  const requestOptions = {
    idempotencyKey: uuidv4() // Gera uma chave única por tentativa
  };

  try {
    const result = await payment.create({ body, requestOptions });
    
    // Retorno de sucesso com os dados do Pix
    return res.status(200).json({
      id: result.id,
      qr_code: result.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
      copy_paste: result.point_of_interaction.transaction_data.qr_code // Pix Copia e Cola
    });
  } catch (error) {
    console.error('Erro na API Mercado Pago:', error);
    return res.status(500).json({ 
      error: 'Falha ao gerar Pix', 
      details: error.message 
    });
  }
};
