import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Recompensas() {
  const [recompensas, setRecompensas] = useState<any[]>([]);

  useEffect(()=>{
    async function load(){ 
      try{ const res = await apiFetch("/api/recompensas"); setRecompensas(res); } catch(err){ console.error(err); }
    }
    load();
  },[]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Recompensas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recompensas.map(r => (
          <div key={r.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{r.nome}</h3>
            <div>Necessita: {r.pontosNecessarios} pontos</div>
          </div>
        ))}
      </div>
    </div>
  );
}
