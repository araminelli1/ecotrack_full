import prisma from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authService = {
  register: async (data: any) => {
    const { nome, email, senha, tipoUsuario } = data;

    const userExists = await prisma.usuarios.findUnique({ where: { email } });
    if (userExists) throw new Error("E-mail já cadastrado.");

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senhaHash,
        tipoUsuario,
      },
      select: {
        id: true,
        nome: true,
        email: true,
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
      }
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
