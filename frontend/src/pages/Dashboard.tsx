import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: string;
}

interface DadosImpacto {
  pontos: number;
  pesoTotal: number;
  proximaRecompensa: string;
  faltamPontos: number;
}

function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [impacto, setImpacto] = useState<DadosImpacto>({
    pontos: 0,
    pesoTotal: 0,
    proximaRecompensa: "Carregando...",
    faltamPontos: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    if (usuarioSalvo && token) {
      try {
        const user = JSON.parse(usuarioSalvo);
        setUsuario(user);
        // Chamar a função de buscar dados reais
        buscarDadosReais(token);
      } catch (error) {
        console.error("Erro ao ler usuário:", error);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // FUNÇÃO QUE BUSCA OS DADOS NO BACKEND
  async function buscarDadosReais(token: string) {
    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE || "https://ecotrack-full.onrender.com";
      const response = await axios.get(`${API_BASE}/api/entregas/resumo/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImpacto(response.data);
    } catch (error) {
      console.error("Erro ao buscar resumo real:", error);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    flex: "1",
    minWidth: "250px",
    border: "1px solid #f0f0f0",
  };

  const navLinkStyle = {
    textDecoration: "none",
    color: "#0f766e",
    fontWeight: "bold",
    fontSize: "14px",
    padding: "8px 12px",
    borderRadius: "6px",
    transition: "background 0.3s",
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 30px",
          backgroundColor: "#065f46",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              backgroundColor: "#10b981",
              width: "35px",
              height: "35px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            E
          </div>
          <h1 style={{ fontSize: "20px", margin: 0 }}>EcoTrack</h1>
        </div>
        {usuario && (
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span>
              Olá, <strong>{usuario.nome}</strong>
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid white",
                backgroundColor: "transparent",
                color: "white",
                cursor: "pointer",
              }}
            >
              Sair
            </button>
          </div>
        )}
      </header>

      {/* NAVBAR */}
      <nav
        style={{
          display: "flex",
          gap: "10px",
          padding: "10px 30px",
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          overflowX: "auto", // Ajuda se a tela for menor
        }}
      >
        <Link
          to="/dashboard-aluno"
          style={{ ...navLinkStyle, backgroundColor: "#ecfdf5" }}
        >
          Resumo
        </Link>
        <Link to="/entregas" style={navLinkStyle}>
          Minhas Entregas
        </Link>
        <Link to="/leaderboard" style={navLinkStyle}>
          Ranking
        </Link>
        {/* 👇 Aqui está o seu link novo da Loja! */}
        <Link to="/recompensas" style={navLinkStyle}>
          Loja de Recompensas 🎁
        </Link>
      </nav>

      {/* CONTEÚDO */}
      <main style={{ padding: "30px" }}>
        {usuario ? (
          <>
            <div style={{ marginBottom: "30px" }}>
              <h2>Bem-vindo ao seu Impacto Ambiental</h2>
              <p style={{ color: "#6b7280" }}>
                Dados reais sincronizados com o banco de dados.
              </p>
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {/* Card 1: Pontos Reais */}
              <div style={cardStyle}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#10b981",
                    fontWeight: "bold",
                  }}
                >
                  SALDO TOTAL
                </span>
                <h3 style={{ fontSize: "32px", margin: "10px 0" }}>
                  {impacto.pontos}{" "}
                  <span style={{ fontSize: "16px", color: "#6b7280" }}>
                    pts
                  </span>
                </h3>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                  Pontos validados pelo funcionário.
                </p>
              </div>

              {/* Card 2: Peso Real */}
              <div style={cardStyle}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#3b82f6",
                    fontWeight: "bold",
                  }}
                >
                  RESÍDUOS ENTREGUES
                </span>
                <h3 style={{ fontSize: "32px", margin: "10px 0" }}>
                  {impacto.pesoTotal.toFixed(1)}{" "}
                  <span style={{ fontSize: "16px", color: "#6b7280" }}>kg</span>
                </h3>
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#e5e7eb",
                    height: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(impacto.pesoTotal * 5, 100)}%`,
                      backgroundColor: "#3b82f6",
                      height: "100%",
                      borderRadius: "10px",
                    }}
                  ></div>
                </div>
              </div>

              {/* Card 3: Recompensa Real */}
              <div style={{ ...cardStyle, position: "relative" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#f59e0b",
                    fontWeight: "bold",
                  }}
                >
                  PRÓXIMA RECOMPENSA
                </span>
                <h3 style={{ fontSize: "20px", margin: "10px 0" }}>
                  {impacto.proximaRecompensa}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "15px",
                  }}
                >
                  Faltam <strong>{impacto.faltamPontos} pontos</strong> para o
                  resgate.
                </p>

                {/* 👇 Botão interativo para o TCC */}
                <Link
                  to="/recompensas"
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    backgroundColor: "#fef3c7",
                    color: "#d97706",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "0.2s",
                  }}
                >
                  Acessar a Loja ➔
                </Link>
              </div>
            </div>
          </>
        ) : (
          <p>Carregando...</p>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
