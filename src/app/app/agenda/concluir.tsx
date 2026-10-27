"use client";

import { useFormStatus } from "react-dom";
import { alternarConcluida } from "./actions";

function Botao({ concluida, destaque, titulo }: { concluida: boolean; destaque?: boolean; titulo: string }) {
  const { pending } = useFormStatus();
  const estilo = destaque
    ? "bg-rosa-600 text-white hover:bg-rosa-700"
    : concluida
      ? "text-suave hover:bg-azul-50"
      : "text-azul-700 hover:bg-azul-50";
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={concluida ? `Desmarcar ${titulo} como concluída` : `Marcar ${titulo} como concluída`}
      className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold disabled:opacity-60 ${estilo}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {concluida ? <path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" /> : <path d="M5 12l5 5 9-10" />}
      </svg>
      {pending ? "Salvando…" : concluida ? "Desmarcar" : destaque ? "Marcar como concluída" : "Concluir"}
    </button>
  );
}

export function AlternarConcluida({
  id,
  titulo,
  concluida,
  destaque,
  aba,
}: {
  id: number;
  titulo: string;
  concluida: boolean;
  destaque?: boolean;
  aba?: string;
}) {
  return (
    <form action={alternarConcluida}>
      <input type="hidden" name="id" value={id} />
      {aba && <input type="hidden" name="aba" value={aba} />}
      <input type="hidden" name="concluir" value={concluida ? "nao" : "sim"} />
      <Botao concluida={concluida} destaque={destaque} titulo={titulo} />
    </form>
  );
}
