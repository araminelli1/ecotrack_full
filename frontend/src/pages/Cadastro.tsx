import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ VALIDAÇÕES (fora do try)
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

    try {
      // ✅ Cadastro
      await axios.post("http://localhost:4000/api/auth/register", {
        nome,
        email,
        senha,
        tipoUsuario: "ALUNO",
      });

      // ✅ Mensagem
      alert("Cadastro realizado com sucesso!");

      // ✅ Redireciona depois
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro no cadastro");
    }
  };

  // ✅ RETURN FICA FORA DO TRY (MUITO IMPORTANTE)
  return (
    <div>
      <h2>Cadastro</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
