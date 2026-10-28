"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { marcarTarefa } from "./guias/actions";

// Tarefas da fase no Início: marcar aqui salva na hora, como no guia da semana.
// Depois de salvar, atualiza a página para o contador "x de y feitas" acompanhar.
export function TarefasInicio({ tarefas, feitasIniciais }: { tarefas: { id: string; texto: string }[]; feitasIniciais: string[] }) {
  const [feitas, setFeitas] = useState(() => new Set(feitasIniciais));
  const [erro, setErro] = useState<string | null>(null);
  const [, iniciar] = useTransition();
  const router = useRouter();

  function alternar(id: string) {
    const feita = !feitas.has(id);
    const atualizar = (marcar: boolean) =>
      setFeitas((atual) => {
        const nova = new Set(atual);
        if (marcar) nova.add(id);
        else nova.delete(id);
        return nova;
      });
    atualizar(feita);
    setErro(null);
    iniciar(async () => {
      const { ok } = await marcarTarefa(id, feita);
      if (!ok) {
        atualizar(!feita);
        setErro("Não foi possível salvar agora. Tente de novo.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1 rounded-3xl bg-white p-2">
      {tarefas.map((t) => {
        const feita = feitas.has(t.id);
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={feita}
            onClick={() => alternar(t.id)}
            className="flex min-h-11 items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-azul-50 focus-visible:outline-3 focus-visible:outline-rosa-600"
          >
            <span
              aria-hidden="true"
              className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 text-white ${feita ? "border-rosa-600 bg-rosa-600" : "border-[#b9c7d4]"}`}
            >
              {feita && (
                <svg viewBox="0 0 24 24" className="size-3 fill-none stroke-current" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5 9-10" />
                </svg>
              )}
            </span>
            <span className={`text-[15px] leading-snug ${feita ? "text-suave line-through" : ""}`}>{t.texto}</span>
          </button>
        );
      })}
      {erro && (
        <p role="alert" className="px-2 pb-1 text-sm text-alerta">
          {erro}
        </p>
      )}
    </div>
  );
}
