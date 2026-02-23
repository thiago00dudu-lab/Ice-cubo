export default async function handler(req, res) {

  if (req.method === "GET") {
    return res.status(200).json({
      status: "API funcionando 🚀"
    });
  }

  if (req.method === "POST") {
    return res.status(200).json({
      mensagem: "Recebido com sucesso"
    });
  }

  return res.status(405).json({ erro: "Método não permitido" });
}
