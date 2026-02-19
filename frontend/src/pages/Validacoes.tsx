import { useEffect, useState } from "react";

interface TipoResiduo {
  id: number;
  nome: string;
  pontos: number;
  cor?: string | null;
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

  const [status, setStatus] = useState<"validado" | "recusado">("validado");
  const [pontosRecebidos, setPontosRecebidos] = useState<string>("");
  const [avisosValidacao, setAvisosValidacao] = useState<string>("");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const API_BASE = "http://localhost:4000/api";

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

      // se a selecionada sumiu (foi validada), limpa
      if (selecionada) {
        const aindaExiste = dados.find((e) => e.id === selecionada.id);
        if (!aindaExiste) setSelecionada(null);
      }
    } catch (e) {
      console.error(e);
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

    // se validado, pontosRecebidos é obrigatório
    if (status === "validado") {
      const pontos = Number(pontosRecebidos);
      if (isNaN(pontos) || pontos <= 0) {
        setErro("Para validar uma entrega, os pontos devem ser maiores que 0.");
        return;
      }
    }

    setSalvando(true);

    try {
      const body: any = {
        status,
        avisosValidacao: avisosValidacao || null,
      };

      if (status === "validado") {
        body.pontosRecebidos = Number(pontosRecebidos);
      } else {
        body.pontosRecebidos = 0;
      }

      const res = await fetch(
        `${API_BASE}/entregas/${selecionada.id}/validate`,
        {
          method: "POST",
          headers: buildHeaders(),
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        setErro("Erro ao validar/recusar entrega.");
        return;
      }

      setMensagem(
        `Entrega #${selecionada.id} ${
          status === "validado" ? "validada" : "recusada"
        } com sucesso!`
      );

      // remove a entrega da lista local (porque não é mais pendente)
      setPendentes((prev) => prev.filter((e) => e.id !== selecionada.id));
      setSelecionada(null);
      setPontosRecebidos("");
      setAvisosValidacao("");
    } catch (e) {
      console.error(e);
      setErro("Falha na conexão com o servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>✅ Validação de Entregas (Funcionário)</h2>

      <button
        onClick={carregarPendentes}
        style={{ padding: 8, cursor: "pointer" }}
      >
        Recarregar pendentes
      </button>

      {carregando && <p>Carregando...</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}
      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}

      <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
        {/* LISTA */}
        <div style={{ flex: 1, border: "1px solid #ddd", padding: 12 }}>
          <h3>Pendentes ({pendentes.length})</h3>

          {pendentes.length === 0 ? (
            <p>Nenhuma entrega pendente.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {pendentes.map((e) => (
                <li key={e.id} style={{ marginBottom: 10 }}>
                  <button
                    onClick={() => {
                      setSelecionada(e);
                      setStatus("validado");
                      setPontosRecebidos(
                        e.pontosEsperados != null
                          ? String(Math.round(e.pontosEsperados))
                          : ""
                      );
                      setAvisosValidacao("");
                      setErro("");
                      setMensagem("");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Selecionar
                  </button>{" "}
                  <strong>Entrega #{e.id}</strong> — {e.usuario.nome} —{" "}
                  {new Date(e.createdAt).toLocaleString()}{" "}
                  {e.pontosEsperados != null && (
                    <strong>
                      — {Math.round(e.pontosEsperados)} pts (estimado)
                    </strong>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* DETALHES / AÇÃO */}
        <div style={{ flex: 1, border: "1px solid #ddd", padding: 12 }}>
          <h3>Detalhes</h3>

          {!selecionada ? (
            <p>Selecione uma entrega à esquerda.</p>
          ) : (
            <>
              <p>
                <strong>Entrega #{selecionada.id}</strong> — aluno:{" "}
                <strong>{selecionada.usuario.nome}</strong> (
                {selecionada.usuario.email})
              </p>

              <p>Status atual: {selecionada.status}</p>

              <h4>Itens</h4>
              <ul style={{ paddingLeft: 18 }}>
                {selecionada.itens.map((item) => (
                  <li key={item.id}>
                    {item.tipo?.nome ?? `Tipo #${item.tipoResiduoId}`} —{" "}
                    {item.pesoEstimado ?? 0} kg
                  </li>
                ))}
              </ul>

              <hr />

              <div style={{ marginBottom: 10 }}>
                <label>Decisão</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="validado">Validar</option>
                  <option value="recusado">Recusar</option>
                </select>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Pontos recebidos</label>
                <input
                  type="number"
                  value={pontosRecebidos}
                  onChange={(e) => setPontosRecebidos(e.target.value)}
                  disabled={status === "recusado"}
                  style={{ width: "100%", padding: 8 }}
                />
                <small>
                  Dica: se você validar, pode usar os pontos estimados como
                  base.
                </small>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Avisos da validação (opcional)</label>
                <textarea
                  value={avisosValidacao}
                  onChange={(e) => setAvisosValidacao(e.target.value)}
                  style={{ width: "100%", padding: 8, minHeight: 80 }}
                />
              </div>

              <button
                onClick={validarEntrega}
                disabled={salvando}
                style={{ padding: 10, cursor: "pointer" }}
              >
                {salvando
                  ? "Salvando..."
                  : status === "validado"
                  ? "Validar entrega"
                  : "Recusar entrega"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Validacoes;
