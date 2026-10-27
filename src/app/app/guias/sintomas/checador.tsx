"use client";

import { useState } from "react";
import { resultadoSintomas, SINTOMAS } from "@/content/guias";

// Os sintomas marcados ficam só na tela: são dados sensíveis e não precisam ser salvos.
export function ChecadorSintomas() {
  const [marcados, setMarcados] = useState<ReadonlySet<string>>(new Set());
  const resultado = resultadoSintomas(marcados);

  function alternar(id: string) {
    setMarcados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {SINTOMAS.map((s) => {
          const ativo = marcados.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => alternar(s.id)}
              className={`min-h-11 rounded-full border-2 px-3.5 py-2 text-sm font-semibold ${ativo ? "border-rosa-600 bg-rosa-50 text-rosa-700" : "border-linha bg-white"}`}
            >
              {s.texto}
            </button>
          );
        })}
      </div>
      <section aria-live="polite" className="flex flex-col gap-1.5 rounded-3xl bg-azul-100 p-5 text-azul-900">
        <span className="text-[13px] font-bold text-azul-700">
          {marcados.size} {marcados.size === 1 ? "sinal marcado" : "sinais marcados"}
        </span>
        <h2 className="text-xl font-bold">{resultado.titulo}</h2>
        <p className="text-[15px] leading-relaxed">{resultado.texto}</p>
      </section>
    </div>
  );
}
