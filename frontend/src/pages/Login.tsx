import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      if (!resposta.ok) {
        setErro("Email ou senha inválidos.");
        setCarregando(false);
        return;
      }

      const dados = await resposta.json();

      // salvar token e usuário no localStorage
      localStorage.setItem("token", dados.token);
      localStorage.setItem("usuario", JSON.stringify(dados.user));

      // redirecionar conforme o tipo de usuário
      if (dados.user.tipoUsuario === "ALUNO") {
        navigate("/dashboard-aluno");
      } else if (dados.user.tipoUsuario === "FUNCIONARIO") {
        navigate("/dashboard-funcionario");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}
    >
      <h2>Login EcoTrack</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        {erro && <p style={{ color: "red", marginBottom: 12 }}>{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          style={{ width: "100%", padding: 10, cursor: "pointer" }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default Login;
