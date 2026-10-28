import Link from "next/link";
import type { ReactNode } from "react";
import { VERSAO_TEXTOS_JURIDICOS } from "@/content/juridico";
import { CabecalhoPublico, FundoSuave } from "./acolhida";

// Moldura dos textos jurídicos (Termos de Uso, Política de Privacidade): páginas
// públicas, legíveis sem login, com sumário de seções.
export function DocumentoLegal({ titulo, resumo, children }: { titulo: string; resumo: ReactNode; children: ReactNode }) {
  return (
    <FundoSuave>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 pb-8 pt-5">
        <CabecalhoPublico />
        <header className="flex flex-col gap-2">
          <h1 className="text-[32px] font-bold leading-tight tracking-tight">{titulo}</h1>
          <p className="text-sm text-suave">Versão de {VERSAO_TEXTOS_JURIDICOS}</p>
        </header>
        <div className="rounded-3xl bg-white/90 shadow-suave p-5 text-[15px] leading-relaxed">{resumo}</div>
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
    </FundoSuave>
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
