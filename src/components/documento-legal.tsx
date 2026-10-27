import Link from "next/link";
import type { ReactNode } from "react";
import { VERSAO_TEXTOS_JURIDICOS } from "@/content/juridico";
import { Logo } from "./ui";

// Moldura dos textos jurídicos (Termos de Uso, Política de Privacidade): páginas
// públicas, legíveis sem login, com sumário de seções.
export function DocumentoLegal({ titulo, resumo, children }: { titulo: string; resumo: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-8">
      <Link href="/" className="flex items-center gap-2 self-start">
        <Logo tamanho={36} />
        <span className="text-lg font-bold text-rosa-600">Ninna</span>
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="text-[30px] font-bold leading-tight">{titulo}</h1>
        <p className="text-sm text-suave">Versão de {VERSAO_TEXTOS_JURIDICOS}</p>
      </header>
      <div className="rounded-3xl bg-white p-5 text-[15px] leading-relaxed">{resumo}</div>
      <div className="flex flex-col gap-7">{children}</div>
      <nav aria-label="Outros documentos" className="flex flex-wrap gap-x-5 gap-y-2 border-t border-linha pt-5 text-sm font-semibold text-azul-700">
        <Link href="/termos" className="hover:underline">
          Termos de Uso
        </Link>
        <Link href="/privacidade" className="hover:underline">
          Política de Privacidade
        </Link>
        <Link href="/" className="hover:underline">
          Início
        </Link>
      </nav>
    </main>
  );
}

export function Secao({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="flex scroll-mt-6 flex-col gap-2.5 text-[15px] leading-relaxed">
      <h2 id={`${id}-titulo`} className="text-xl font-bold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function Lista({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-rosa-600">{children}</ul>;
}
