import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: string;
}

function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");

    if (usuarioSalvo) {
      try {
        const usuarioParseado: Usuario = JSON.parse(usuarioSalvo);
        setUsuario(usuarioParseado);
      } catch (error) {
        console.error("Erro ao ler usuário do localStorage:", error);
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  }

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* topo */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#0f766e",
          color: "white",
        }}
      >
        <h1>EcoTrack - Dashboard do Aluno</h1>

        {usuario && (
          <div>
            <span style={{ marginRight: 16 }}>Olá, {usuario.nome}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                cursor: "pointer",
                borderRadius: 4,
                border: "none",
              }}
            >
              Sair
            </button>
          </div>
        )}
      </header>

      {/* menu */}
      <nav
        style={{
          display: "flex",
          gap: 16,
          padding: "10px 20px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Link to="/dashboard-aluno">Resumo</Link>
        <Link to="/entregas">Entregas</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/recompensas">Recompensas</Link>
      </nav>

      {/* conteúdo principal */}
      <main style={{ padding: 20 }}>
        {usuario ? (
          <>
            <h2>Resumo</h2>
            <p>
              <strong>Email:</strong> {usuario.email}
            </p>
            <p>
              <strong>Tipo de usuário:</strong> {usuario.tipoUsuario}
            </p>

            <p style={{ marginTop: 20 }}>Aqui depois vamos mostrar:</p>
            <ul>
              <li>Pontos acumulados de reciclagem</li>
              <li>Últimas entregas realizadas</li>
              <li>Status de recompensas disponíveis</li>
            </ul>
          </>
        ) : (
          <p>Carregando informações do usuário...</p>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
