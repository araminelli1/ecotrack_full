import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* =======================
    TIPOS (interfaces)
======================= */
interface TipoResiduo {
  id: number;
  nome: string;
  pontos: number;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: string;
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
  usuarioId: number;
  status: string;
  createdAt: string;
  pontosEsperados?: number | null;
  pontosRecebidos?: number | null;
  usuario: Usuario;
  itens: ItemEntrega[];
}

function Validacoes() {
  const [pendentes, setPendentes] = useState<Entrega[]>([]);
  const [selecionada, setSelecionada] = useState<Entrega | null>(null);

  // CORRIGIDO: Agora usa "rejeitado" para bater com o backend
  const [status, setStatus] = useState<"validado" | "rejeitado">("validado");
  const [pontosRecebidos, setPontosRecebidos] = useState<string>("");
  const [avisosValidacao, setAvisosValidacao] = useState<string>("");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const navigate = useNavigate();

  // URL blindada
  const API_BASE = "https://ecotrack-full.onrender.com/api";

  function buildHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async function carregarPendentes() {
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");

      const res = await fetch(`${API_BASE}/entregas/pendentes`, {
        headers: buildHeaders(),
      });

      if (!res.ok) {
        setErro("Erro ao carregar entregas pendentes.");
        return;
      }

      const dados: Entrega[] = await res.json();
      setPendentes(dados);

      if (selecionada) {
        const aindaExiste = dados.find((e) => e.id === selecionada.id);
        if (!aindaExiste) setSelecionada(null);
      }
    } catch (e) {
      setErro("Falha na conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPendentes();
  }, []);

  async function validarEntrega() {
    if (!selecionada) return;
    setErro("");
    setMensagem("");

    if (status === "validado") {
      const pontos = Number(pontosRecebidos);
      if (isNaN(pontos) || pontos <= 0) {
        setErro("Para validar uma entrega, os pontos devem ser maiores que 0.");
        return;
      }
    }

    setSalvando(true);
    try {
      const body: any = { status, avisosValidacao: avisosValidacao || null };
      body.pontosRecebidos =
        status === "validado" ? Number(pontosRecebidos) : 0;

      // CORRIGIDO: method alterado para PATCH
      const res = await fetch(
        `${API_BASE}/entregas/${selecionada.id}/validate`,
        {
          method: "PATCH",
          headers: buildHeaders(),
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        setErro("Erro ao processar a validação.");
        return;
      }

      setMensagem(
        `Entrega #${selecionada.id} ${status === "validado" ? "APROVADA" : "REJEITADA"} com sucesso!`,
      );
      setPendentes((prev) => prev.filter((e) => e.id !== selecionada.id));
      setSelecionada(null);
      setPontosRecebidos("");
      setAvisosValidacao("");
    } catch (e) {
      setErro("Falha na conexão com o servidor.");
    } finally {
      setSalvando(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
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
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    marginTop: "5px",
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
        <h1 style={{ fontSize: "20px", margin: 0 }}>
          EcoTrack | Administração
        </h1>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "1px solid white",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </header>

      <main style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>Validação de Resíduos</h2>
          <button
            onClick={carregarPendentes}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              backgroundColor: "#e5e7eb",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🔄 Atualizar Lista
          </button>
        </div>

        {erro && (
          <p style={{ color: "#dc2626", fontWeight: "bold" }}>⚠️ {erro}</p>
        )}
        {mensagem && (
          <p
            style={{
              color: "#059669",
              fontWeight: "bold",
              backgroundColor: "#d1fae5",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            ✅ {mensagem}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          {/* COLUNA ESQUERDA: LISTA DE PENDENTES */}
          <div style={{ ...cardStyle, flex: "1", minWidth: "300px" }}>
            <h3
              style={{
                marginTop: 0,
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
              }}
            >
              Fila de Espera ({pendentes.length})
            </h3>

            {carregando ? (
              <p>Buscando entregas...</p>
            ) : pendentes.length === 0 ? (
              <p
                style={{
                  color: "#6b7280",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                Nenhuma entrega pendente no momento. 🎉
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {pendentes.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      setSelecionada(e);
                      setStatus("validado");
                      setErro("");
                      setMensagem("");
                      setPontosRecebidos(
                        e.pontosEsperados != null
                          ? String(Math.round(e.pontosEsperados))
                          : "",
                      );
                    }}
                    style={{
                      padding: "15px",
                      borderRadius: "8px",
                      border:
                        selecionada?.id === e.id
                          ? "2px solid #10b981"
                          : "1px solid #e5e7eb",
                      cursor: "pointer",
                      backgroundColor:
                        selecionada?.id === e.id ? "#f0fdf4" : "white",
                      transition: "0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                      }}
                    >
                      <strong style={{ fontSize: "16px" }}>
                        {e.usuario.nome}
                      </strong>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>
                        #{e.id}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {new Date(e.createdAt).toLocaleDateString()} às{" "}
                      {new Date(e.createdAt).toLocaleTimeString()}
                    </div>
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#10b981",
                      }}
                    >
                      Est: {Math.round(e.pontosEsperados || 0)} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: AVALIAÇÃO */}
          <div
            style={{
              ...cardStyle,
              flex: "2",
              minWidth: "350px",
              backgroundColor: selecionada ? "white" : "#f9fafb",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
              }}
            >
              Painel de Avaliação
            </h3>

            {!selecionada ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#9ca3af",
                }}
              >
                <p>
                  Selecione uma entrega na fila ao lado para iniciar a
                  avaliação.
                </p>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    marginBottom: "20px",
                    backgroundColor: "#f3f4f6",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Aluno
                    </span>
                    <div style={{ fontWeight: "bold" }}>
                      {selecionada.usuario.nome}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      E-mail
                    </span>
                    <div>{selecionada.usuario.email}</div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Material(is) Declarado(s)
                    </span>
                    <ul
                      style={{
                        margin: "5px 0 0 0",
                        paddingLeft: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      {selecionada.itens.map((item) => (
                        <li key={item.id}>
                          {item.tipo?.nome ?? "Desconhecido"} -{" "}
                          {item.pesoEstimado} kg
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontWeight: "bold", fontSize: "14px" }}>
                    Decisão
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={inputStyle}
                  >
                    <option value="validado">✅ Aprovar Entrega</option>
                    {/* CORRIGIDO: value agora é "rejeitado" */}
                    <option value="rejeitado">
                      ❌ Recusar / Lixo Incorreto
                    </option>
                  </select>
                </div>

                {status === "validado" && (
                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#10b981",
                      }}
                    >
                      Pontos a creditar no saldo do aluno
                    </label>
                    <input
                      type="number"
                      value={pontosRecebidos}
                      onChange={(e) => setPontosRecebidos(e.target.value)}
                      style={{
                        ...inputStyle,
                        borderColor: "#10b981",
                        backgroundColor: "#f0fdf4",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontWeight: "bold", fontSize: "14px" }}>
                    Observações para o Aluno (Opcional)
                  </label>
                  <textarea
                    placeholder="Ex: Material estava um pouco sujo, por favor lavar na próxima..."
                    value={avisosValidacao}
                    onChange={(e) => setAvisosValidacao(e.target.value)}
                    style={{
                      ...inputStyle,
                      minHeight: "80px",
                      resize: "vertical",
                    }}
                  />
                </div>

                <button
                  onClick={validarEntrega}
                  disabled={salvando}
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    cursor: "pointer",
                    border: "none",
                    color: "white",
                    backgroundColor:
                      status === "validado" ? "#10b981" : "#ef4444",
                    transition: "0.3s",
                  }}
                >
                  {salvando
                    ? "Processando..."
                    : status === "validado"
                      ? "Confirmar e Liberar Pontos"
                      : "Confirmar Recusa"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Validacoes;
