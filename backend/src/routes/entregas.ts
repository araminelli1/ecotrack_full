import { Router } from "express";
import prisma from "../prisma/client";
import { authenticateToken } from "../middleware/auth";
import { requireFuncionario } from "../middleware/requireFuncionario";

const router = Router();

/* =================================================
   MIDDLEWARE GLOBAL
================================================= */
router.use(authenticateToken);

/* =================================================
   CRIAR ENTREGA (ALUNO)
================================================= */
router.post("/", async (req, res) => {
  const userId = req.userId!;
  const { itens } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      message: "Envie 'itens' com pelo menos 1 item",
    });
  }

  try {
    let pontosEsperados = 0;

    for (const item of itens) {
      const tipo = await prisma.tiposResiduos.findUnique({
        where: { id: item.tipoResiduoId },
      });

      if (!tipo) {
        return res.status(400).json({
          message: `Tipo ${item.tipoResiduoId} não existe`,
        });
      }

      pontosEsperados += Number(item.pesoEstimado ?? 0) * Number(tipo.pontos);
    }

    const entrega = await prisma.entrega.create({
      data: {
        usuarioId: userId,
        status: "pendente",
        pontosEsperados,
        itens: {
          create: itens,
        },
      },
      include: {
        itens: {
          include: { tipo: true },
        },
      },
    });

    res.json(entrega);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar entrega" });
  }
});

/* =================================================
   LISTAR ENTREGAS DO USUÁRIO
================================================= */
router.get("/", async (req, res) => {
  const userId = req.userId!;

  try {
    const entregas = await prisma.entrega.findMany({
      where: { usuarioId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        itens: { include: { tipo: true } },
      },
    });

    res.json(entregas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar entregas" });
  }
});

/* =================================================
   LISTAR PENDENTES (FUNCIONÁRIO)
   ⚠️ IMPORTANTE vir antes de /:id
================================================= */
router.get("/pendentes", requireFuncionario, async (req, res) => {
  try {
    const entregas = await prisma.entrega.findMany({
      where: { status: "pendente" },
      orderBy: { createdAt: "desc" },
      include: {
        usuario: true,
        itens: { include: { tipo: true } },
      },
    });

    res.json(entregas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar pendentes" });
  }
});

/* =================================================
   DETALHES ENTREGA
================================================= */
router.get("/:id", async (req, res) => {
  const userId = req.userId!;
  const entregaId = Number(req.params.id);

  try {
    const entrega = await prisma.entrega.findUnique({
      where: { id: entregaId },
      include: {
        usuario: true,
        itens: { include: { tipo: true } },
      },
    });

    if (!entrega) {
      return res.status(404).json({ message: "Entrega não encontrada" });
    }

    if (entrega.usuarioId !== userId && req.tipoUsuario !== "funcionario") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    res.json(entrega);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar entrega" });
  }
});

/* =================================================
   CANCELAR ENTREGA (ALUNO)
================================================= */
router.patch("/:id/cancelar", async (req, res) => {
  const userId = req.userId!;
  const entregaId = Number(req.params.id);

  try {
    const entrega = await prisma.entrega.findUnique({
      where: { id: entregaId },
    });

    if (!entrega) {
      return res.status(404).json({ message: "Entrega não encontrada" });
    }

    if (entrega.usuarioId !== userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    if (entrega.status !== "pendente") {
      return res.status(400).json({
        message: "Apenas pendentes podem ser canceladas",
      });
    }

    const atualizada = await prisma.entrega.update({
      where: { id: entregaId },
      data: { status: "cancelado" },
    });

    res.json(atualizada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao cancelar" });
  }
});

/* =================================================
   VALIDAR ENTREGA (FUNCIONÁRIO) ⭐ SEGURO
================================================= */
router.patch("/:id/validate", requireFuncionario, async (req, res) => {
  const entregaId = Number(req.params.id);
  const { status, pontosRecebidos, avisosValidacao } = req.body;
  const validadorId = req.userId!;

  const allowed = ["validado", "rejeitado"];

  if (!allowed.includes(status)) {
    return res.status(400).json({
      message: "Status deve ser 'validado' ou 'rejeitado'",
    });
  }

  try {
    const entrega = await prisma.entrega.findUnique({
      where: { id: entregaId },
    });

    if (!entrega) {
      return res.status(404).json({ message: "Entrega não encontrada" });
    }

    if (entrega.status !== "pendente") {
      return res.status(400).json({
        message: "Entrega já foi validada",
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const atualizada = await tx.entrega.update({
        where: { id: entregaId },
        data: {
          status,
          pontosRecebidos: status === "validado" ? Number(pontosRecebidos) : 0,
          validadoPorId: validadorId,
          validadoEm: new Date(),
          avisosValidacao,
        },
      });

      if (status === "validado") {
        await tx.pontuacaoUsuario.upsert({
          where: { usuarioId: entrega.usuarioId },
          update: {
            pontosAcumulados: {
              increment: Number(pontosRecebidos),
            },
          },
          create: {
            usuarioId: entrega.usuarioId,
            pontosAcumulados: Number(pontosRecebidos),
          },
        });
      }

      return atualizada;
    });

    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro na validação" });
  }
});

export default router;
