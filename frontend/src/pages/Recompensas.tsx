import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Recompensa {
  id: number;
  nome: string;
  pontosNecessarios: number;
  descricao?: string;
}

export default function Recompensas() {
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [meusPontos, setMeusPontos] = useState<number>(0);
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
    async function carregarDados() {
      try {
        setCarregando(true);

        // 1. Pega os pontos atuais do aluno
        const resResumo = await fetch(`${API_BASE}/entregas/resumo/me`, {
          headers: buildHeaders(),
        });
        if (resResumo.ok) {
          const dadosResumo = await resResumo.json();
          setMeusPontos(dadosResumo.pontos || 0);
        }

        // 2. Pega a lista de recompensas do banco
        const resRecompensas = await fetch(`${API_BASE}/recompensas`, {
          headers: buildHeaders(),
        });

        if (resRecompensas.ok) {
          const dadosRec = await resRecompensas.json();
          // Se o banco tiver dados, usa eles. Se estiver vazio, usa o Plano B!
          if (dadosRec.length > 0) {
            setRecompensas(dadosRec);
          } else {
            usarRecompensasDeTeste();
          }
        } else {
          usarRecompensasDeTeste();
        }
      } catch (err) {
        console.error(err);
        setErro("Falha de conexão. Mostrando prêmios de demonstração.");
        usarRecompensasDeTeste();
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // PLANO B: Dados falsos caso a tabela no banco esteja vazia para não quebrar a apresentação
  function usarRecompensasDeTeste() {
    setRecompensas([
      {
        id: 1,
        nome: "Voucher R$ 10 na Cantina",
        pontosNecessarios: 200,
        descricao:
          "Abata R$ 10,00 na sua próxima compra na cantina da faculdade.",
      },
      {
        id: 2,
        nome: "Voucher R$ 20 na Cantina",
        pontosNecessarios: 370,
        descricao:
          "Abata R$ 20,00 na sua próxima compra na cantina da faculdade.",
      },
      {
        id: 3,
        nome: "10 Horas Complementares",
        pontosNecessarios: 600,
        descricao:
          "Certificado de 10h válidas como atividades de extensão e sustentabilidade.",
      },
      {
        id: 4,
        nome: "20 Horas Complementares",
        pontosNecessarios: 1000,
        descricao:
          "Certificado de 20h válidas como atividades de extensão e sustentabilidade.",
      },
      {
        id: 5,
        nome: "Desconto de 3% na Mensalidade",
        pontosNecessarios: 3000,
        descricao:
          "Desconto exclusivo de 3% aplicado diretamente no boleto da sua próxima mensalidade.",
      },
    ]);
  }

  // ESTILOS
  const containerStyle: React.CSSProperties = {
    fontFamily: "sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  };
  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

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
        <h1 style={{ fontSize: "20px", margin: 0 }}>EcoTrack | Loja</h1>
        <Link
          to="/dashboard-aluno"
          style={{ color: "white", textDecoration: "none", fontSize: "14px" }}
        >
          Voltar ao Resumo
        </Link>
      </header>

      <main style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* CABEÇALHO DO SALDO */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            backgroundColor: "#10b981",
            color: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "24px" }}>Resgate de Prêmios</h2>
            <p style={{ margin: "5px 0 0 0", opacity: 0.9 }}>
              Troque seu impacto ambiental por recompensas reais.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                opacity: 0.9,
              }}
            >
              Seu Saldo Atual
            </span>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>
              {meusPontos} <span style={{ fontSize: "20px" }}>pts</span>
            </div>
          </div>
        </div>

        {erro && (
          <p
            style={{
              color: "#d97706",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            ⚠️ {erro}
          </p>
        )}

        {carregando ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            Carregando prêmios disponíveis...
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {recompensas.map((r) => {
              const podeResgatar = meusPontos >= r.pontosNecessarios;
              const porcentagem = podeResgatar
                ? 100
                : Math.min(100, (meusPontos / r.pontosNecessarios) * 100);

              return (
                <div
                  key={r.id}
                  style={{
                    ...cardStyle,
                    borderColor: podeResgatar ? "#10b981" : "#e5e7eb",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        marginTop: 0,
                        fontSize: "18px",
                        color: "#111827",
                      }}
                    >
                      {r.nome}
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        minHeight: "40px",
                      }}
                    >
                      {r.descricao || "Recompensa exclusiva EcoTrack."}
                    </p>

                    <div
                      style={{
                        margin: "15px 0",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: podeResgatar ? "#10b981" : "#374151",
                      }}
                    >
                      💰 {r.pontosNecessarios} pts
                    </div>

                    {/* BARRA DE PROGRESSO */}
                    {!podeResgatar && (
                      <div style={{ marginBottom: "15px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "5px",
                          }}
                        >
                          <span>Progresso</span>
                          <span>{Math.floor(porcentagem)}%</span>
                        </div>
                        <div
                          style={{
                            height: "8px",
                            backgroundColor: "#e5e7eb",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${porcentagem}%`,
                              backgroundColor: "#10b981",
                              transition: "width 0.5s",
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    disabled={!podeResgatar}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: podeResgatar ? "pointer" : "not-allowed",
                      border: "none",
                      transition: "0.3s",
                      backgroundColor: podeResgatar ? "#10b981" : "#f3f4f6",
                      color: podeResgatar ? "white" : "#9ca3af",
                      marginTop: podeResgatar ? "15px" : "0",
                    }}
                  >
                    {podeResgatar
                      ? "✨ Resgatar Prêmio"
                      : `Faltam ${r.pontosNecessarios - meusPontos} pts`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
