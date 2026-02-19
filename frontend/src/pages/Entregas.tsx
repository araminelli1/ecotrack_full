import { useEffect, useState } from "react";

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
  pontosEsperados?: number | null; // ✅ adiciona isso
  itens: ItemEntrega[];
}

/* =======================
   COMPONENTE
======================= */

function Entregas() {
  const [tipos, setTipos] = useState<TipoResiduo[]>([]);
  const [tipoResiduoId, setTipoResiduoId] = useState<number | "">("");
  const [pesoEstimado, setPesoEstimado] = useState<string>("");
  const [mensagem, setMensagem] = useState<string>("");
  const [erro, setErro] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);
  const [entregas, setEntregas] = useState<Entrega[]>([]);

  const API_BASE = "http://localhost:4000/api";

  /* =======================
     HEADERS (TIPADO)
  ======================= */

  function buildHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /* =======================
     CARREGAR DADOS INICIAIS
  ======================= */

  useEffect(() => {
    async function carregarDados() {
      try {
        // Buscar tipos de resíduos
        const resTipos = await fetch(`${API_BASE}/tipos-residuos`, {
          headers: buildHeaders(),
        });

        if (resTipos.ok) {
          const dadosTipos: TipoResiduo[] = await resTipos.json();
          setTipos(dadosTipos);
        } else {
          console.error("Erro ao buscar tipos de resíduos");
        }

        // Buscar entregas do usuário
        const resEntregas = await fetch(`${API_BASE}/entregas`, {
          headers: buildHeaders(),
        });

        if (resEntregas.ok) {
          const dadosEntregas: Entrega[] = await resEntregas.json();
          setEntregas(dadosEntregas);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }

    carregarDados();
  }, []);

  /* =======================
     REGISTRAR ENTREGA
  ======================= */

  async function handleRegistrarEntrega(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!tipoResiduoId || !pesoEstimado) {
      setErro("Selecione um tipo de resíduo e informe o peso estimado.");
      return;
    }

    const pesoNumber = Number(pesoEstimado);
    if (isNaN(pesoNumber) || pesoNumber <= 0) {
      setErro("Informe um peso válido (maior que 0).");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_BASE}/entregas`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({
          itens: [
            {
              tipoResiduoId,
              pesoEstimado: pesoNumber,
            },
          ],
        }),
      });

      if (!resposta.ok) {
        setErro("Erro ao registrar entrega.");
        setCarregando(false);
        return;
      }

      const novaEntrega: Entrega = await resposta.json();

      setMensagem("Entrega registrada com sucesso! Aguarde validação.");
      setPesoEstimado("");
      setTipoResiduoId("");

      // adiciona a nova entrega no topo da lista
      setEntregas((prev) => [novaEntrega, ...prev]);
    } catch (err) {
      console.error(err);
      setErro("Falha na conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Registrar Entrega de Resíduos</h2>

      <form onSubmit={handleRegistrarEntrega} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Tipo de resíduo</label>
          <select
            value={tipoResiduoId}
            onChange={(e) =>
              setTipoResiduoId(e.target.value ? Number(e.target.value) : "")
            }
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">Selecione...</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome} ({tipo.pontos} pts/kg)
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Peso estimado (kg)</label>
          <input
            type="number"
            step="0.01"
            value={pesoEstimado}
            onChange={(e) => setPesoEstimado(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {erro && <p style={{ color: "red" }}>{erro}</p>}
        {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}

        <button
          type="submit"
          disabled={carregando}
          style={{ padding: 10, cursor: "pointer" }}
        >
          {carregando ? "Registrando..." : "Registrar entrega"}
        </button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      <h3>Minhas entregas</h3>

      {entregas.length === 0 ? (
        <p>Nenhuma entrega registrada ainda.</p>
      ) : (
        <ul>
          {entregas.map((entrega) => (
            <li key={entrega.id} style={{ marginBottom: 10 }}>
              <strong>Entrega #{entrega.id}</strong> — status: {entrega.status}{" "}
              — {new Date(entrega.createdAt).toLocaleString()}{" "}
              {entrega.pontosEsperados != null && (
                <strong>
                  — {Math.round(entrega.pontosEsperados)} pts (estimado)
                </strong>
              )}
              <ul>
                {entrega.itens.map((item) => (
                  <li key={item.id}>
                    {item.tipo?.nome ?? `Tipo #${item.tipoResiduoId}`} — Peso
                    estimado: {item.pesoEstimado ?? 0} kg
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Entregas;
