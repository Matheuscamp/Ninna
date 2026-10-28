"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { EXAMES, faseDaSemana, SEMANA_MAX, SEMANA_MIN } from "@/content/guias";
import { trimestre } from "@/lib/triagem";
import { marcarTarefa } from "../actions";

export function GuiaSemana({ semanaAtual, feitasIniciais }: { semanaAtual: number; feitasIniciais: string[] }) {
  const [semana, setSemana] = useState(semanaAtual);
  const [feitas, setFeitas] = useState(() => new Set(feitasIniciais));
  const [erro, setErro] = useState<string | null>(null);
  const [, iniciar] = useTransition();
  const fase = faseDaSemana(semana);
  const totalFeitas = fase.tarefas.filter((t) => feitas.has(t.id)).length;

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
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 rounded-3xl bg-azul-100 p-4 text-azul-900">
        <button
          type="button"
          aria-label="Semana anterior"
          disabled={semana <= SEMANA_MIN}
          onClick={() => setSemana(semana - 1)}
          className="size-12 rounded-full bg-white text-2xl disabled:opacity-40"
        >
          ‹
        </button>
        <div className="flex flex-col items-center gap-1" aria-live="polite">
          <span className="text-sm font-semibold text-azul-700">{trimestre(semana)}º trimestre</span>
          <span className="text-3xl font-bold leading-none">Semana {semana}</span>
          {semana === semanaAtual ? (
            <span className="rounded-full bg-rosa-600 px-2.5 py-1 text-xs font-bold text-white">Sua semana</span>
          ) : (
            <button
              type="button"
              onClick={() => setSemana(semanaAtual)}
              className="min-h-8 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-rosa-600"
            >
              Voltar para a semana {semanaAtual}
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="Próxima semana"
          disabled={semana >= SEMANA_MAX}
          onClick={() => setSemana(semana + 1)}
          className="size-12 rounded-full bg-white text-2xl disabled:opacity-40"
        >
          ›
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-linha" aria-hidden="true">
          <div className="h-full rounded-full bg-rosa-600" style={{ width: `${Math.min(100, (semana / 40) * 100)}%` }} />
        </div>
        <span className="text-[13px] text-suave">{semana} de 40 semanas</span>
      </div>

      <section className="flex flex-col gap-3 rounded-3xl bg-white p-5">
        <h2 className="text-lg font-bold">{fase.titulo}</h2>
        <p className="text-[15px] leading-relaxed text-suave">{fase.resumo}</p>
        <div className="flex flex-col gap-1 rounded-2xl bg-rosa-50 p-3.5">
          <span className="text-[12px] font-bold uppercase tracking-wide text-rosa-700">O bebê nesta fase</span>
          <p className="text-[15px] leading-relaxed">{fase.bebe}</p>
        </div>
        <p className="text-[13px] font-semibold leading-relaxed text-azul-700">{fase.consultas}</p>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Para fazer</h2>
          <span className="text-[13px] text-suave">
            {totalFeitas} de {fase.tarefas.length} feitas
          </span>
        </div>
        {fase.tarefas.map((t) => {
          const feita = feitas.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={feita}
              onClick={() => alternar(t.id)}
              className="flex min-h-13 items-center gap-3 rounded-2xl bg-white p-3.5 text-left"
            >
              <span
                aria-hidden="true"
                className={`flex size-6 shrink-0 items-center justify-center rounded-lg border-2 text-white ${feita ? "border-rosa-600 bg-rosa-600" : "border-[#b9c7d4]"}`}
              >
                {feita && (
                  <svg viewBox="0 0 24 24" className="size-3.5 fill-none stroke-current" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </span>
              <span className={`text-[15px] leading-snug ${feita ? "text-suave line-through" : ""}`}>{t.texto}</span>
            </button>
          );
        })}
        {erro && (
          <p role="alert" className="text-sm text-alerta">
            {erro}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Exames desta fase</h2>
        {fase.exames.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-[15px] leading-relaxed text-suave">
            Nenhum exame novo nesta fase. Mantenha as consultas do pré-natal em dia.
          </p>
        ) : (
          <>
            <p className="-mt-1 text-sm text-suave">Toque em um exame para saber para que serve e como se preparar.</p>
            {fase.exames.map((id) => {
              const e = EXAMES[id];
              return (
                <details key={id} className="group rounded-2xl bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold">{e.nome}</span>
                      <span className="text-[13px] font-semibold text-azul-700">{e.quando}</span>
                    </span>
                    <span aria-hidden="true" className="text-xl text-suave group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="flex flex-col gap-2.5 px-4 pb-4">
                    <p className="text-[15px] leading-relaxed">{e.oque}</p>
                    <p className="text-sm leading-relaxed text-suave">
                      <strong className="text-tinta">Preparo:</strong> {e.preparo}
                    </p>
                    <Link
                      href={`/app/agenda/nova?titulo=${encodeURIComponent(e.nome)}`}
                      className="self-start rounded-xl bg-rosa-50 px-4 py-2.5 text-[15px] font-semibold text-rosa-600"
                    >
                      Adicionar à agenda
                    </Link>
                  </div>
                </details>
              );
            })}
          </>
        )}
      </section>

      <Link href="/app/guias/parto" className="flex h-12 items-center justify-center rounded-2xl border-2 border-linha bg-white font-semibold">
        Conhecer os tipos de parto
      </Link>
      <p className="text-center text-[12px] leading-relaxed text-suave">
        Sugestões baseadas no roteiro do pré-natal. Seu médico pode pedir exames diferentes.
      </p>
    </div>
  );
}
