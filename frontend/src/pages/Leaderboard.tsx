import { useEffect, useState } from "react";

interface Usuario {
  id: number;
  nome: string;
  email?: string | null;
  tipoUsuario?: string | null;
}

interface RankItem {
  usuarioId: number;
  pontosAcumulados: number;
  usuario: Usuario;
}

function Leaderboard() {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const API_BASE = "http://localhost:4000/api";

  useEffect(() => {
    async function carregarRanking() {
      try {
        setCarregando(true);
        setErro("");

        const res = await fetch(`${API_BASE}/leaderboard`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          setErro("Erro ao carregar ranking.");
          return;
        }

        const dados: RankItem[] = await res.json();
        setRanking(dados);
      } catch (e) {
        console.error(e);
        setErro("Falha na conexão com o servidor.");
      } finally {
        setCarregando(false);
      }
    }

    carregarRanking();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>🏆 Leaderboard</h2>

      {carregando && <p>Carregando ranking...</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {!carregando && !erro && ranking.length === 0 && (
        <p>Ainda não há pontuações.</p>
      )}

      {!carregando && !erro && ranking.length > 0 && (
        <table
          style={{
            width: "100%",
            maxWidth: 650,
            borderCollapse: "collapse",
            marginTop: 12,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ccc",
                  padding: 8,
                }}
              >
                Posição
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ccc",
                  padding: 8,
                }}
              >
                Usuário
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ccc",
                  padding: 8,
                }}
              >
                Pontos
              </th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((item, idx) => (
              <tr key={item.usuarioId}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  #{idx + 1}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {item.usuario?.nome ?? `Usuário #${item.usuarioId}`}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {Math.round(item.pontosAcumulados)} pts
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
