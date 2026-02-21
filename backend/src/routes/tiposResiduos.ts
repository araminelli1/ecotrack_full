import { Router } from "express";
import prisma from "../prisma/client";
import { authenticateToken } from "../middleware/auth";
import { requireFuncionario } from "../middleware/requireFuncionario";

const router = Router();

// se quiser, pode exigir login:
router.use(authenticateToken);

// GET /api/tipos-residuos
router.get("/", async (req, res) => {
  try {
    const tipos = await prisma.tiposResiduos.findMany();
    res.json(tipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar tipos de resíduos" });
  }
});
/* ============================
   CRIAR TIPO (FUNCIONÁRIO)
============================ */
router.post("/", requireFuncionario, async (req, res) => {
  const { nome, pontos } = req.body;

  if (!nome || pontos === undefined) {
    return res.status(400).json({
      message: "Informe nome e pontos",
    });
  }

  try {
    const tipo = await prisma.tiposResiduos.create({
      data: {
        nome,
        pontos: Number(pontos),
      },
    });

    res.json(tipo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar tipo" });
  }
});
/* ============================
   EDITAR TIPO (FUNCIONÁRIO)
============================ */
router.put("/:id", requireFuncionario, async (req, res) => {
  const id = Number(req.params.id);
  const { nome, pontos } = req.body;

  try {
    const tipo = await prisma.tiposResiduos.update({
      where: { id },
      data: {
        nome,
        pontos: Number(pontos),
      },
    });

    res.json(tipo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar tipo" });
  }
});
/* ============================
   DELETAR TIPO (FUNCIONÁRIO)
============================ */
router.delete("/:id", requireFuncionario, async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.tiposResiduos.delete({
      where: { id },
    });

    res.json({ message: "Tipo removido com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao deletar tipo" });
  }
});
export default router;
