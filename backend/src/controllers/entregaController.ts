import { Request, Response } from "express";
import prisma from "../prisma/client";

// POST /api/entregas
export const criarEntrega = async (req: Request, res: Response) => {
  try {
    // usuário autenticado vem do authMiddleware (req.user)
    const usuarioAutenticado = (req as any).user;

    if (!usuarioAutenticado) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const { tipoResiduoId, pesoEstimado } = req.body;

    if (!tipoResiduoId || !pesoEstimado) {
      return res
        .status(400)
        .json({ error: "tipoResiduoId e pesoEstimado são obrigatórios." });
    }

    // buscar info do tipo de resíduo para calcular pontos
    const tipoResiduo = await prisma.tiposResiduos.findUnique({
      where: { id: tipoResiduoId },
    });

    if (!tipoResiduo) {
      return res.status(404).json({ error: "Tipo de resíduo não encontrado." });
    }

    // regra simples: pontos = pesoEstimado * pontos do tipo de resíduo
    const pontosEsperados = (pesoEstimado as number) * tipoResiduo.pontos;

    const entrega = await prisma.entrega.create({
      data: {
        usuarioId: usuarioAutenticado.id,
        status: "pendente",
        pontosEsperados,
        itens: {
          create: [
            {
              tipoResiduoId,
              pesoEstimado,
            },
          ],
        },
      },
      include: {
        itens: true,
      },
    });

    return res.status(201).json(entrega);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao registrar entrega." });
  }
};
