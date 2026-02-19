const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers: any = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Erro na requisição");
  return data;
}
