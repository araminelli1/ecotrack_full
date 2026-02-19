import { Request, Response } from "express";
import { authService } from "../services/authService";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body.email, req.body.senha);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const me = async (req: any, res: Response) => {
  try {
    return res.json(req.usuario);
  } catch {
    return res.status(500).json({ error: "Erro ao obter dados." });
  }
};
