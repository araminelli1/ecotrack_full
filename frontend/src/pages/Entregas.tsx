import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* =======================
    TIPOS (interfaces)
======================= */
interface TipoResiduo {
  id: number;
  nome: string;
  descricao?: string | null;
  pontos: number;
  cor?: string | null;
}

interface ItemEntrega {
  id: number;
  tipoResiduoId: number;
  pesoEstimado: number | null;
  pesoAtual: number | null;
  tipo?: TipoResiduo;
}

interface Entrega {
  id: number;
  status: string;
  createdAt: string;
  pontosEsperados?: number | null;
  itens: ItemEntrega[];
}

function Entregas() {
  const [tipos, setTipos] = useState<TipoResiduo[]>([]);
  const [tipoResiduoId, setTipoResiduoId] = useState<number | "">("");
  const [pesoEstimado, setPesoEstimado] = useState<string>("");
  const [mensagem, setMensagem] = useState<string>("");
  const [erro, setErro] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);
  const [entregas, setEntregas] = useState<Entrega[]>([]);

  const API_BASE =
    import.meta.env.VITE_API_BASE || "https://ecotrack-full.onrender.com/api";

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
        const resTipos = await fetch(`${API_BASE}/tipos-residuos`, {
          headers: buildHeaders(),
        });
        if (resTipos.ok) setTipos(await resTipos.json());

        const resEntregas = await fetch(`${API_BASE}/entregas`, {
          headers: buildHeaders(),
        });
        if (resEntregas.ok) setEntregas(await resEntregas.json());
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }
    carregarDados();
  }, []);

  // Cálculo de pontos em tempo real para o aluno ver
  const pontosEstimadosAgora = () => {
    const tipo = tipos.find((t) => t.id === tipoResiduoId);
    if (tipo && pesoEstimado) {
      return (tipo.pontos * Number(pesoEstimado)).toFixed(0);
    }
    return 0;
  };

  async function handleRegistrarEntrega(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    const pesoNumber = Number(pesoEstimado);
    if (!tipoResiduoId || isNaN(pesoNumber) || pesoNumber <= 0) {
      setErro("Preencha os dados corretamente.");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch(`${API_BASE}/entregas`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({
          itens: [{ tipoResiduoId, pesoEstimado: pesoNumber }],
        }),
      });

      if (resposta.ok) {
        const novaEntrega: Entrega = await resposta.json();
        setMensagem("Entrega registrada! Leve o resíduo ao posto de coleta.");
        setPesoEstimado("");
        setTipoResiduoId("");
        setEntregas((prev) => [novaEntrega, ...prev]);
      } else {
        setErro("Erro ao registrar no servidor.");
      }
    } catch (err) {
      setErro("Falha na conexão.");
    } finally {
      setCarregando(false);
    }
  }

  // ESTILOS
  const containerStyle: React.CSSProperties = {
    fontFamily: "sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  };
  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
    marginBottom: "30px",
  };
  const statusBadge = (status: string) => ({
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor:
      status === "pendente"
        ? "#fef3c7"
        : status === "validado"
          ? "#d1fae5"
          : "#fee2e2",
    color:
      status === "pendente"
        ? "#92400e"
        : status === "validado"
          ? "#065f46"
          : "#991b1b",
  });

  return (
    <div style={containerStyle}>
      {/* HEADER REUTILIZADO DO DASHBOARD */}
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
        <h1 style={{ fontSize: "20px", margin: 0 }}>EcoTrack</h1>
        <Link
          to="/dashboard-aluno"
          style={{ color: "white", textDecoration: "none", fontSize: "14px" }}
        >
          Voltar ao Resumo
        </Link>
      </header>

      <main style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* FORMULÁRIO EM CARD */}
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: "#111827" }}>
            Registrar Nova Entrega
          </h2>
          <p
            style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}
          >
            Informe o tipo de material e o peso aproximado que você está
            levando.
          </p>

          <form
            onSubmit={handleRegistrarEntrega}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Material
              </label>
              <select
                value={tipoResiduoId}
                onChange={(e) =>
                  setTipoResiduoId(e.target.value ? Number(e.target.value) : "")
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                }}
              >
                <option value="">Selecione o tipo...</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Peso Est. (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={pesoEstimado}
                onChange={(e) => setPesoEstimado(e.target.value)}
                placeholder="Ex: 0.5"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>

            <div style={{ textAlign: "center", paddingBottom: "10px" }}>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Ganho estimado:
              </span>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                + {pontosEstimadosAgora()} pts
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                padding: "14px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              {carregando ? "Enviando..." : "Registrar Entrega"}
            </button>
          </form>

          {erro && (
            <p
              style={{ color: "#dc2626", marginTop: "15px", fontSize: "14px" }}
            >
              ⚠️ {erro}
            </p>
          )}
          {mensagem && (
            <p
              style={{
                color: "#059669",
                marginTop: "15px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              ✅ {mensagem}
            </p>
          )}
        </div>

        {/* LISTA DE ENTREGAS EM TABELA */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Meu Histórico de Atividade</h3>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "2px solid #f3f4f6",
                  }}
                >
                  <th
                    style={{
                      padding: "12px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Data
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Resíduo
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Peso
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Pontos Est.
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {entregas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#9ca3af",
                      }}
                    >
                      Você ainda não realizou entregas.
                    </td>
                  </tr>
                ) : (
                  entregas.map((entrega) => (
                    <tr
                      key={entrega.id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td style={{ padding: "12px", fontSize: "14px" }}>
                        {new Date(entrega.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px", fontSize: "14px" }}>
                        {entrega.itens.map((i) => i.tipo?.nome).join(", ") ||
                          "Indefinido"}
                      </td>
                      <td style={{ padding: "12px", fontSize: "14px" }}>
                        {entrega.itens.reduce(
                          (acc, i) => acc + (i.pesoEstimado || 0),
                          0,
                        )}{" "}
                        kg
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#10b981",
                        }}
                      >
                        {Math.round(entrega.pontosEsperados || 0)} pts
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={
                            statusBadge(entrega.status) as React.CSSProperties
                          }
                        >
                          {entrega.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Entregas;
