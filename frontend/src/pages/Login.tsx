import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    setCarregando(true);
    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE || "https://ecotrack-full.onrender.com";

      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        senha,
      });

      // Salva o token de segurança no navegador
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.user));

      alert("Login realizado com sucesso!");
      // Ajuste "/dashboard" para a rota principal do seu sistema, caso seja diferente
      window.location.href = "/dashboard-aluno";
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
          "Erro no login. Verifique suas credenciais.",
      );
    } finally {
      setCarregando(false);
    }
  };

  // Os mesmos estilos profissionais da tela de Cadastro
  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0fdf4",
    fontFamily: "sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "400px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    fontSize: "16px",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s",
  };

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <h2
          style={{
            textAlign: "center",
            color: "#065f46",
            marginBottom: "30px",
          }}
        >
          Login EcoTrack
        </h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{ ...buttonStyle, opacity: carregando ? 0.7 : 1 }}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div
          style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}
        >
          <Link
            to="/cadastro" // Garanta que esta é a rota correta para a sua tela de cadastro
            style={{
              color: "#059669",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Criar nova conta agora
          </Link>
        </div>
      </div>
    </main>
  );
}
