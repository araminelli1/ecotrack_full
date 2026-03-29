import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Cadastro() {
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    if (!email.includes("@")) {
      alert("Email inválido!");
      return;
    }

    const senhaValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!senhaValida.test(senha)) {
      alert(
        "A senha deve ter no mínimo 6 caracteres, incluindo letra maiúscula, minúscula e número.",
      );
      return;
    }

    setCarregando(true);
    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE || "https://ecotrack-full.onrender.com";

      await axios.post(`${API_BASE}/api/auth/register`, {
        nome,
        email,
        senha,
        tipoUsuario: "ALUNO",
      });

      alert("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro no cadastro");
    } finally {
      setCarregando(false);
    }
  };

  // Estilos rápidos para o design
  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0fdf4", // Verde bem clarinho de fundo
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
    backgroundColor: "#10b981", // Verde Esmeralda
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2
          style={{
            textAlign: "center",
            color: "#065f46",
            marginBottom: "30px",
          }}
        >
          Criar Conta EcoTrack
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
              Nome
            </label>
            <input
              placeholder="Ex: João Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
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
            {carregando ? "Cadastrando..." : "Finalizar Cadastro"}
          </button>
        </form>

        <div
          style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}
        >
          <p style={{ color: "#777" }}>Já tem uma conta?</p>
          <Link
            to="/login"
            style={{
              color: "#10b981",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
