import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Entregas from "./pages/Entregas";
import Leaderboard from "./pages/Leaderboard";
import Recompensas from "./pages/Recompensas";
import Validacoes from "./pages/Validacoes";
import Cadastro from "./pages/Cadastro";

// componente simples para proteger rotas
function RotaProtegida({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // se não tiver token, manda para a tela de login
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* rotas protegidas */}
        <Route
          path="/dashboard-aluno"
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          }
        />

        {/* 🚀 O PULO DO GATO: Direciona o funcionário direto pras Validações! */}
        <Route
          path="/dashboard-funcionario"
          element={<Navigate to="/validacoes" replace />}
        />

        <Route
          path="/entregas"
          element={
            <RotaProtegida>
              <Entregas />
            </RotaProtegida>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <RotaProtegida>
              <Leaderboard />
            </RotaProtegida>
          }
        />

        <Route
          path="/recompensas"
          element={
            <RotaProtegida>
              <Recompensas />
            </RotaProtegida>
          }
        />

        {/* 🔓 Destravamos o bloqueio rigoroso para a apresentação rodar lisa */}
        <Route
          path="/validacoes"
          element={
            <RotaProtegida>
              <Validacoes />
            </RotaProtegida>
          }
        />

        {/* rota coringa pra não ficar branco */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
