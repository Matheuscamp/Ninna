"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { removerConsulta } from "./actions";

function BotaoConfirmar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 rounded-xl bg-alerta px-3.5 text-sm font-semibold text-white disabled:opacity-60">
      {pending ? "Removendo…" : "Sim, remover"}
    </button>
  );
}

// Remoção em dois toques: o primeiro pede confirmação, para não apagar sem querer.
export function RemoverConsulta({ id, titulo, aba }: { id: number; titulo: string; aba?: string }) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        aria-label={`Remover ${titulo}`}
        className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-suave hover:bg-azul-50 hover:text-alerta"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-none stroke-current" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" />
        </svg>
        Remover
      </button>
    );
  }

  return (
    <form action={removerConsulta} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      {aba && <input type="hidden" name="aba" value={aba} />}
      <span className="text-sm font-semibold text-alerta">Remover?</span>
      <BotaoConfirmar />
      <button type="button" onClick={() => setConfirmando(false)} className="h-10 rounded-xl px-3 text-sm font-semibold text-suave">
        Não
      </button>
    </form>
  );
}
