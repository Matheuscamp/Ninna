"use client";

import { useState } from "react";
import { PARTOS } from "@/content/guias";

export function AbasParto() {
  const [id, setId] = useState<(typeof PARTOS)[number]["id"]>("normal");
  const parto = PARTOS.find((p) => p.id === id) ?? PARTOS[0];

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Tipos de parto" className="grid grid-cols-3 gap-1 rounded-2xl bg-white/90 shadow-suave p-1">
        {PARTOS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`aba-${p.id}`}
            aria-selected={p.id === id}
            aria-controls="painel-parto"
            onClick={() => setId(p.id)}
            className={`min-h-11 rounded-xl px-1.5 text-[13px] font-bold ${p.id === id ? "bg-rosa-600 text-white" : "text-tinta"}`}
          >
            {p.aba}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="painel-parto" aria-labelledby={`aba-${parto.id}`} className="flex flex-col gap-4">
        <section className="flex flex-col gap-1.5 rounded-3xl bg-azul-100 p-5 text-azul-900">
          <h2 className="text-[22px] font-bold">{parto.nome}</h2>
          <p className="text-[15px] leading-relaxed">{parto.desc}</p>
        </section>
        <section className="flex flex-col gap-3 rounded-3xl bg-white/90 shadow-suave p-5">
          <h3 className="font-bold text-azul-700">Pontos positivos</h3>
          <ul className="flex flex-col gap-2.5">
            {parto.pros.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] leading-snug">
                <span aria-hidden="true" className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-azul-100 text-sm font-bold text-azul-900">
                  +
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-3 rounded-3xl bg-white/90 shadow-suave p-5">
          <h3 className="font-bold text-rosa-600">Pontos de atenção</h3>
          <ul className="flex flex-col gap-2.5">
            {parto.contras.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] leading-snug">
                <span aria-hidden="true" className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-rosa-50 text-sm font-bold text-rosa-600">
                  !
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-1 rounded-3xl bg-white/90 shadow-suave px-5 py-4">
          <h3 className="text-sm font-bold">Recuperação</h3>
          <p className="text-[15px] leading-relaxed text-suave">{parto.recuperacao}</p>
        </section>
      </div>
    </div>
  );
}
