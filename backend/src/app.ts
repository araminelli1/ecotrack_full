import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import entregasRoutes from "./routes/entregas";
import recompensasRoutes from "./routes/recompensas";
import leaderboardRoutes from "./routes/leaderboard";
import tiposResiduosRoutes from "./routes/tiposResiduos";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/entregas", entregasRoutes);
app.use("/api/recompensas", recompensasRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/tipos-residuos", tiposResiduosRoutes);

export default app;
