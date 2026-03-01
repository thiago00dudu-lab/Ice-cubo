import { MercadoPagoConfig, Preference } from 'mercadopago';

// Conecta com as variáveis que você mostrou no print
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

export default async function handler(req, res) {
  // Só aceita requisições do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Pega os dados que o usuário digitou no site
    const { email, amount, description } = req.body;

    // VERIFICAÇÃO CRUCIAL: Se o e-mail não vier, o código para aqui com aviso
    if (!email || email.trim() === "") {
      return res.status(400).json({ 
        error: "E-mail não recebido. Verifique o formulário do site." 
      });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: description || 'Compra no Site',
            unit_price: Number(amount) || 10.0,
            quantity: 1,
            currency_id: 'BRL'
          }
        ],
        payer: {
          email: email // Agora garantimos que o e-mail existe
        },
        back_urls: {
          success: `https://${req.headers.host}/sucesso`,
          failure: `https://${req.headers.host}/erro`,
        },
        auto_return: "approved",
      }
    });

    // Retorna o link ou o ID para o site abrir o pagamento
    return res.status(200).json({ id: result.id, init_point: result.init_point });

  } catch (error) {
    console.error("Erro no Mercado Pago:", error);
    return res.status(500).json({ error: "Erro ao gerar pagamento" });
  }
}
