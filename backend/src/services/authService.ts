import prisma from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authService = {
  register: async (data: any) => {
    const { nome, email, senha, ra } = data;

    if (!ra) throw new Error("O RA é obrigatório para cadastro de alunos.");

    // NOVA TRAVA DO RA NO BACKEND: Segunda camada de segurança
    const raValido = /^\d{7}$/;
    if (!raValido.test(ra)) {
      throw new Error("O RA deve conter exatamente 7 dígitos numéricos.");
    }

    const userExists = await prisma.usuarios.findFirst({
      where: {
        OR: [{ email: email }, { ra: ra }],
      },
    });

    if (userExists) {
      if (userExists.email === email)
        throw new Error("Este e-mail já está cadastrado.");
      if (userExists.ra === ra)
        throw new Error("Este RA já está cadastrado no sistema.");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await prisma.usuarios.create({
      data: {
        nome,
        email,
        ra,
        senhaHash,
        tipoUsuario: "ALUNO",
      },
      select: {
        id: true,
        nome: true,
        email: true,
        ra: true,
        tipoUsuario: true,
        criadoEm: true,
      },
    });

    return user;
  },

  login: async (email: string, senha: string) => {
    const user = await prisma.usuarios.findUnique({ where: { email } });

    if (!user) throw new Error("Usuário não encontrado.");

    const valid = await bcrypt.compare(senha, user.senhaHash);
    if (!valid) throw new Error("Senha incorreta.");

    const token = jwt.sign(
      { id: user.id, tipoUsuario: user.tipoUsuario },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipoUsuario: user.tipoUsuario,
      },
    };
  },
};
