"use client";

import { useActionState } from "react";
import { BotaoPrimario } from "@/components/ui";
import { SECOES_PLANO, type Pergunta } from "@/content/plano-parto";
import type { RespostasPlano } from "@/lib/plano-parto";
import { salvarPlanoDeParto } from "./actions";

// Opções em "chips": o input fica escondido e o rótulo muda de cor quando marcado.
const CHIP =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border-2 border-linha bg-white px-3.5 py-2.5 text-[15px] leading-snug transition hover:border-rosa-300 has-[:checked]:border-rosa-600 has-[:checked]:bg-rosa-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-rosa-600";

function Campo({ pergunta, resposta }: { pergunta: Pergunta; resposta: string | string[] | undefined }) {
  const ajuda = pergunta.ajuda && (
    <p id={`${pergunta.id}-ajuda`} className="text-[13px] leading-relaxed text-suave">
      {pergunta.ajuda}
    </p>
  );

  if (pergunta.tipo === "texto") {
    const longo = pergunta.max > 200;
    const props = {
      id: pergunta.id,
      name: pergunta.id,
      maxLength: pergunta.max,
      defaultValue: typeof resposta === "string" ? resposta : "",
      "aria-describedby": pergunta.ajuda ? `${pergunta.id}-ajuda` : undefined,
      className: "rounded-xl border-2 border-linha bg-white px-4 text-base outline-none focus:border-rosa-600",
    };
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={pergunta.id} className="text-sm font-semibold">
          {pergunta.titulo}
        </label>
        {ajuda}
        {longo ? <textarea {...props} rows={4} className={`${props.className} py-3`} /> : <input {...props} className={`${props.className} h-12`} />}
      </div>
    );
  }

  const marcadas = new Set(Array.isArray(resposta) ? resposta : resposta ? [resposta] : []);
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={pergunta.ajuda ? `${pergunta.id}-ajuda` : undefined}>
      <legend className="mb-1.5 text-sm font-semibold">
        {pergunta.titulo}
        {pergunta.tipo === "varias" && <span className="font-normal text-suave"> · marque quantas quiser</span>}
      </legend>
      {ajuda}
      {pergunta.opcoes.map((o) => (
        <label key={o.id} className={CHIP}>
          <input
            type={pergunta.tipo === "unica" ? "radio" : "checkbox"}
            name={pergunta.id}
            value={o.id}
            defaultChecked={marcadas.has(o.id)}
            className="size-5 shrink-0 accent-rosa-600"
          />
          {o.rotulo}
        </label>
      ))}
    </fieldset>
  );
}

export function FormPlanoParto({ respostas }: { respostas: RespostasPlano }) {
  const [estado, acao, pendente] = useActionState(salvarPlanoDeParto, undefined);

  return (
    <form action={acao} className="flex flex-col gap-6">
      {SECOES_PLANO.map((secao, i) => (
        <section key={secao.id} aria-labelledby={`secao-${secao.id}`} className="flex flex-col gap-4 rounded-3xl bg-white/60 p-4">
          <h2 id={`secao-${secao.id}`} className="flex items-center gap-2.5 text-lg font-bold">
            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-rosa-600 text-sm text-white">
              {i + 1}
            </span>
            {secao.titulo}
          </h2>
          {secao.perguntas.map((p) => (
            <Campo key={p.id} pergunta={p} resposta={respostas[p.id]} />
          ))}
        </section>
      ))}

      {estado?.erro && (
        <p role="alert" className="text-sm text-alerta">
          {estado.erro}
        </p>
      )}
      <div className="sticky bottom-[84px] z-[5] flex flex-col gap-2">
        <BotaoPrimario type="submit" disabled={pendente} className="shadow-lg">
          {pendente ? "Salvando…" : "Salvar e ver o documento"}
        </BotaoPrimario>
      </div>
    </form>
  );
}
