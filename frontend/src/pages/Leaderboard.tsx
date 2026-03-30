import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface RankingItem {
  id?: number;
  nome?: string;
  usuario?: { nome: string }; // Caso o backend mande dentro de um objeto 'usuario'
  pontos?: number;
  pontosAcumulados?: number; // Caso o backend use 'pontosAcumulados'
}

function Leaderboard() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const API_BASE = "https://ecotrack-full.onrender.com/api";

  function buildHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  useEffect(() => {
    async function carregarRanking() {
      try {
        setCarregando(true);
        // Tenta buscar da rota de leaderboard (ajuste para /ranking se for o caso no seu backend)
        const res = await fetch(`${API_BASE}/leaderboard`, {
          headers: buildHeaders(),
        });

        if (!res.ok) {
          throw new Error("Erro ao buscar o ranking.");
        }

        const dados = await res.json();

        // Garante que está ordenado do maior para o menor
        const dadosOrdenados = dados.sort((a: any, b: any) => {
          const pontosA = a.pontos || a.pontosAcumulados || 0;
          const pontosB = b.pontos || b.pontosAcumulados || 0;
          return pontosB - pontosA;
        });

        setRanking(dadosOrdenados);
      } catch (err) {
        console.error(err);
        setErro("Não foi possível carregar o ranking no momento.");
      } finally {
        setCarregando(false);
      }
    }
    carregarRanking();
  }, []);

  // ESTILOS
  const containerStyle: React.CSSProperties = {
    fontFamily: "sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    paddingBottom: "40px",
  };
  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
  };

  function getMedalha(posicao: number) {
    if (posicao === 1) return "🥇";
    if (posicao === 2) return "🥈";
    if (posicao === 3) return "🥉";
    return `${posicao}º`;
  }

  function getCorDestaque(posicao: number) {
    if (posicao === 1)
      return { bg: "#fef3c7", border: "#f59e0b", text: "#d97706" }; // Ouro
    if (posicao === 2)
      return { bg: "#f3f4f6", border: "#9ca3af", text: "#4b5563" }; // Prata
    if (posicao === 3)
      return { bg: "#ffedd5", border: "#fdba74", text: "#c2410c" }; // Bronze
    return { bg: "white", border: "#e5e7eb", text: "#374151" }; // Padrão
  }

  return (
    <div style={containerStyle}>
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
        <h1 style={{ fontSize: "20px", margin: 0 }}>
          EcoTrack | Ranking Global
        </h1>
        <Link
          to="/dashboard-aluno"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "14px",
            border: "1px solid white",
            padding: "6px 12px",
            borderRadius: "6px",
          }}
        >
          Voltar ao Resumo
        </Link>
      </header>

      <main style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2
            style={{ fontSize: "32px", color: "#111827", margin: "0 0 10px 0" }}
          >
            Maiores Heróis da Sustentabilidade
          </h2>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            Veja quem está liderando o impacto ambiental positivo no campus.
          </p>
        </div>

        {erro && (
          <p
            style={{
              color: "#dc2626",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ⚠️ {erro}
          </p>
        )}

        {carregando ? (
          <p
            style={{ textAlign: "center", color: "#6b7280", fontSize: "18px" }}
          >
            Calculando as posições...
          </p>
        ) : ranking.length === 0 ? (
          <div
            style={{
              ...cardStyle,
              textAlign: "center",
              padding: "40px",
              color: "#6b7280",
            }}
          >
            Nenhum ponto registrado ainda. Seja o primeiro a pontuar! 🌱
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {ranking.map((item, index) => {
              const posicao = index + 1;
              const cores = getCorDestaque(posicao);
              const nomeUser =
                item.nome || item.usuario?.nome || "Herói Anônimo";
              const pontosTotais = item.pontos || item.pontosAcumulados || 0;
              const isTop3 = posicao <= 3;

              return (
                <div
                  key={index}
                  style={{
                    ...cardStyle,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: cores.bg,
                    borderColor: cores.border,
                    transform: isTop3 ? "scale(1.02)" : "scale(1)",
                    transition: "transform 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: isTop3 ? "32px" : "18px",
                        fontWeight: "bold",
                        color: cores.text,
                        width: "40px",
                        textAlign: "center",
                      }}
                    >
                      {getMedalha(posicao)}
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: isTop3 ? "20px" : "16px",
                          color: "#111827",
                        }}
                      >
                        {nomeUser}
                      </h3>
                      {isTop3 && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: cores.text,
                            textTransform: "uppercase",
                          }}
                        >
                          Top {posicao}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: isTop3 ? "28px" : "20px",
                        fontWeight: "bold",
                        color: cores.text,
                      }}
                    >
                      {pontosTotais}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        fontWeight: "bold",
                      }}
                    >
                      PTS
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Leaderboard;
