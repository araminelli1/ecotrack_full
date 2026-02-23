import { Router } from "express";
import prisma from "../prisma/client";
import { authenticateToken } from "../middleware/auth";
import { requireFuncionario } from "../middleware/requireFuncionario";

const router = Router();

router.use(authenticateToken);

/* ============================
   CRIAR ENTREGA (ALUNO)
============================ */
router.post("/", async (req, res) => {
  const userId = req.userId!;
  const { itens } = req.body; // itens: [{ tipoResiduoId, pesoEstimado }]

  // validação simples do body
  if (!Array.isArray(itens) || itens.length === 0) {
    return res
      .status(400)
      .json({ message: "Envie 'itens' como array com pelo menos 1 item." });
  }

  try {
    let pontosEsperados = 0;

    for (const item of itens) {
      const tipo = await prisma.tiposResiduos.findUnique({
        where: { id: item.tipoResiduoId },
      });

      if (!tipo) {
        return res.status(400).json({
          message: `Tipo de resíduo ${item.tipoResiduoId} não existe`,
        });
      }

      const peso = Number(item.pesoEstimado ?? 0);
      pontosEsperados += peso * Number(tipo.pontos);
    }

    const entrega = await prisma.entrega.create({
      data: {
        usuarioId: userId,
        status: "pendente",
        pontosEsperados,
        itens: { create: itens },
      },
      include: {
        itens: {
          include: {
            tipo: true,
          },
        },
      },
    });

    return res.json(entrega);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao criar entrega" });
  }
});

/* ============================
   LISTAR ENTREGAS DO USUÁRIO
============================ */
router.get("/", async (req, res) => {
  const userId = req.userId!;

  try {
    const entregas = await prisma.entrega.findMany({
      where: { usuarioId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        usuario: true,
        itens: {
          include: {
            tipo: true,
          },
        },
      },
    });

    return res.json(entregas);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Erro ao listar entregas do usuário" });
  }
});
/* ============================
   LISTAR ENTREGAS PENDENTES
   (FUNCIONÁRIO / VALIDADOR)
============================ */
router.get("/pendentes", requireFuncionario, async (req, res) => {
  try {
    const entregas = await prisma.entrega.findMany({
      where: { status: "pendente" },
      orderBy: { createdAt: "desc" },
      include: {
        usuario: true,
        itens: {
          include: {
            tipo: true,
          },
        },
      },
    });

    return res.json(entregas);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Erro ao listar entregas pendentes" });
  }
});

// validação (apenas admin/validador)
/* ============================
   DETALHES DE UMA ENTREGA
============================ */
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

    return res.json(entrega);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao buscar entrega" });
  }
});

/* ============================
   CANCELAR ENTREGA (ALUNO)
============================ */
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
      return res.status(403).json({
        message: "Você só pode cancelar suas próprias entregas",
      });
    }

    if (entrega.status !== "pendente") {
      return res.status(400).json({
        message: "Apenas entregas pendentes podem ser canceladas",
      });
    }

    const atualizada = await prisma.entrega.update({
      where: { id: entregaId },
      data: { status: "cancelado" },
    });

    return res.json(atualizada);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao cancelar entrega" });
  }
});

router.post("/:id/validate", requireFuncionario, async (req, res) => {
  const validadorId = req.userId!;
  const entregaId = Number(req.params.id);
  const { status, pontosRecebidos, avisosValidacao } = req.body;

  try {
    // ============================
    // BUSCAR ENTREGA
    // ============================
    const entregaAtual = await prisma.entrega.findUnique({
      where: { id: entregaId },
    });

    if (!entregaAtual) {
      return res.status(404).json({ message: "Entrega não encontrada" });
    }

    // 🔒 só pode validar se estiver pendente
    if (entregaAtual.status !== "pendente") {
      return res.status(400).json({
        message: "Apenas entregas pendentes podem ser validadas",
      });
    }

    // ============================
    // VALIDAÇÃO DE PONTOS
    // ============================
    if (status === "validado") {
      const pontos = Number(pontosRecebidos);

      if (isNaN(pontos) || pontos <= 0) {
        return res.status(400).json({
          message:
            "Para validar uma entrega, os pontos recebidos devem ser maiores que 0.",
        });
      }
    }

    // ============================
    // ATUALIZAR ENTREGA
    // ============================
    const entrega = await prisma.entrega.update({
      where: { id: entregaId },
      data: {
        status,
        pontosRecebidos: status === "validado" ? Number(pontosRecebidos) : 0,
        validadoPorId: validadorId,
        validadoEm: new Date(),
        avisosValidacao,
      },
    });

    // ============================
    // ATUALIZAR PONTUAÇÃO DO ALUNO
    // ============================
    if (status === "validado") {
      await prisma.pontuacaoUsuario.upsert({
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

    return res.json(entrega);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro na validação" });
  }
});

export default router;
