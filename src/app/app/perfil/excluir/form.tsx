"use client";

import { useActionState } from "react";
import { excluirConta } from "./actions";

export function FormExcluir() {
  const [estado, acao, pendente] = useActionState(excluirConta, undefined);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className="flex gap-3 rounded-2xl bg-white/90 shadow-suave p-4">
        <input type="checkbox" name="confirmo" required className="mt-1 size-5 shrink-0 accent-alerta" />
        <span className="text-[15px] leading-relaxed">Entendo que minha conta e meus dados serão apagados para sempre.</span>
      </label>
      {estado?.erro && (
        <p role="alert" className="text-sm text-alerta">
          {estado.erro}
        </p>
      )}
      <button
        type="submit"
        disabled={pendente}
        className="h-13 w-full rounded-2xl bg-alerta px-5 text-[17px] font-semibold text-white disabled:opacity-60"
      >
        {pendente ? "Excluindo…" : "Excluir minha conta"}
      </button>
    </form>
  );
}
