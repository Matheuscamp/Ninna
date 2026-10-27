"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { BotaoPrimario, Campo } from "@/components/ui";
import type { EstadoConsulta } from "./actions";

const SUGESTOES = ["Consulta de pré-natal", "Ultrassom", "Exames de sangue", "Vacina"];

type Valores = { titulo?: string; data?: string; hora?: string; local?: string; observacoes?: string };

export function FormConsulta({
  acao,
  iniciais = {},
  rotuloBotao,
}: {
  acao: (estado: EstadoConsulta, formData: FormData) => Promise<EstadoConsulta>;
  iniciais?: Valores;
  rotuloBotao: string;
}) {
  const [estado, acaoForm, pendente] = useActionState(acao, undefined);
  const v: Valores = estado?.valores ?? iniciais;
  // O título é controlado para as sugestões rápidas poderem preenchê-lo.
  const [titulo, setTitulo] = useState(iniciais.titulo ?? "");

  return (
    <form action={acaoForm} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <Campo
          id="titulo"
          rotulo="O que é"
          placeholder="Ex.: Consulta de pré-natal"
          required
          maxLength={80}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          erro={estado?.erros?.titulo?.[0]}
        />
        <div className="flex flex-wrap gap-2" aria-label="Sugestões">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTitulo(s)}
              className={`rounded-full border-2 px-3 py-1.5 text-[13px] font-semibold ${titulo === s ? "border-rosa-600 bg-rosa-50 text-rosa-700" : "border-linha bg-white text-suave"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo id="data" rotulo="Data" type="date" required defaultValue={v.data} erro={estado?.erros?.data?.[0]} />
        <Campo id="hora" rotulo="Horário" type="time" required defaultValue={v.hora} erro={estado?.erros?.hora?.[0]} />
      </div>

      <Campo
        id="local"
        rotulo="Local (opcional)"
        placeholder="Ex.: UBS Centro"
        maxLength={80}
        defaultValue={v.local}
        erro={estado?.erros?.local?.[0]}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="observacoes" className="text-sm font-semibold">
          Observações (opcional)
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          maxLength={300}
          placeholder="Ex.: levar exames anteriores, ir em jejum"
          defaultValue={v.observacoes}
          className="rounded-xl border-2 border-linha bg-white px-4 py-3 text-base outline-none focus:border-rosa-600"
        />
      </div>

      {estado?.erro && (
        <p role="alert" className="rounded-2xl bg-rosa-50 p-4 text-[15px] text-rosa-700">
          {estado.erro}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <BotaoPrimario type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : rotuloBotao}
        </BotaoPrimario>
        <Link href="/app/agenda" className="flex h-12 items-center justify-center rounded-2xl font-semibold text-suave">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
