"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { sair } from "@/app/(auth)/actions";

// Item de lista das configurações: ícone, título, descrição curta e seta.
const ITEM =
  "group flex min-h-16 w-full items-center gap-3.5 px-4 py-3 text-left transition-colors duration-200 hover:bg-azul-50 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-rosa-600";

export function ConteudoItem({ icone, titulo, descricao, tom = "neutro", seta = true }: { icone: ReactNode; titulo: string; descricao: string; tom?: "neutro" | "alerta"; seta?: boolean }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tom === "alerta" ? "bg-[#fdecea] text-alerta" : "bg-rosa-50 text-rosa-600"}`}
      >
        {icone}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`font-semibold ${tom === "alerta" ? "text-alerta" : ""}`}>{titulo}</span>
        <span className="text-[13px] leading-snug text-suave">{descricao}</span>
      </span>
      {seta && (
        <span aria-hidden="true" className="text-xl text-suave transition-transform duration-200 group-hover:translate-x-0.5">
          ›
        </span>
      )}
    </>
  );
}

// Refazer a triagem pede confirmação: a nova triagem substitui as respostas atuais.
export function RefazerTriagem() {
  const dialogo = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-[15px] font-semibold text-azul-900 transition hover:bg-white/80 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rosa-600"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" />
        </svg>
        Refazer a triagem
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby="titulo-refazer"
        onClick={(e) => e.target === dialogo.current && dialogo.current?.close()}
        className="m-auto w-[min(92vw,26rem)] rounded-3xl bg-white p-0 text-tinta shadow-xl backdrop:bg-tinta/40"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 id="titulo-refazer" className="text-xl font-bold">
            Refazer a triagem?
          </h2>
          <p className="text-[15px] leading-relaxed text-suave">
            Você vai responder as perguntas de novo. Quando salvar, seu momento e os dados da gestação são atualizados.
            Agenda, documentos e tarefas continuam como estão.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Link
              href="/triagem"
              className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-rosa-600 font-semibold text-white transition hover:bg-rosa-700"
            >
              Refazer agora
            </Link>
            <button
              type="button"
              autoFocus
              onClick={() => dialogo.current?.close()}
              className="h-12 flex-1 rounded-2xl font-semibold text-suave transition hover:bg-azul-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

// Exportar baixa um arquivo; o aviso confirma que o download começou.
export function ItemExportar({ icone }: { icone: ReactNode }) {
  const [iniciado, setIniciado] = useState(false);
  return (
    <>
      {/* Link comum (não <Link>): a rota devolve um arquivo para baixar. */}
      <a href="/app/perfil/exportar" onClick={() => setIniciado(true)} className={ITEM}>
        <ConteudoItem icone={icone} titulo="Exportar meus dados" descricao="Baixa um arquivo com tudo o que o Ninna guarda sobre você" />
      </a>
      <p role="status" aria-live="polite" className={iniciado ? "px-4 pb-3 text-[13px] font-semibold text-azul-700" : "sr-only"}>
        {iniciado ? "Download iniciado. Confira a pasta de downloads." : ""}
      </p>
    </>
  );
}

function BotaoSair({ icone }: { icone: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${ITEM} disabled:opacity-60`}>
      <ConteudoItem icone={icone} titulo={pending ? "Saindo…" : "Encerrar sessão"} descricao="Sair da conta neste aparelho" seta={false} />
    </button>
  );
}

export function ItemSair({ icone }: { icone: ReactNode }) {
  return (
    <form action={sair}>
      <BotaoSair icone={icone} />
    </form>
  );
}

export const CLASSE_ITEM = ITEM;
