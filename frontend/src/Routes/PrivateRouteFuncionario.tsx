import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import React from "react";

interface TokenPayload {
  tipoUsuario: string;
}

export default function PrivateRouteFuncionario({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);

    if (decoded.tipoUsuario !== "funcionario") {
      return <Navigate to="/dashboard-aluno" replace />;
    }

    return <>{children}</>;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
