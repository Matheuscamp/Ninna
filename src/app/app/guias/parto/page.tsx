import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina, TituloPagina, Voltar } from "@/components/ui";
import { exigirUsuariaPronta } from "@/lib/dal";
import { AbasParto } from "./abas-parto";

export const metadata: Metadata = { title: "Tipos de parto" };

async function AvisoCesareaAnterior() {
  const { perfil } = await exigirUsuariaPronta();
  if (!perfil.cesarea_anterior) return null;
  return (
    <section className="flex flex-col gap-1 rounded-3xl bg-rosa-50 px-5 py-4">
      <h2 className="font-bold text-rosa-700">Você já teve uma cesárea</h2>
      <p className="text-[15px] leading-relaxed">
        Isso não impede sempre um parto normal. Pergunte ao seu médico se é uma opção para você.
      </p>
    </section>
  );
}

export default function GuiaPartoPage() {
  return (
    <Pagina>
      <Voltar href="/app" />
      <TituloPagina titulo="Tipos de parto" ilustracao="bebe" fundo="bg-rosa-100" />
      <p className="-mt-2 text-[15px] leading-relaxed text-suave">
        Conheça as opções para conversar com seu médico. A via de parto é decidida com a equipe, pensando na sua
        saúde e na do bebê.
      </p>
      <AbasParto />
      <Suspense fallback={<Carregando />}>
        <AvisoCesareaAnterior />
      </Suspense>
      <Link href="/app/guias/plano-parto" className="flex items-center gap-3 rounded-3xl bg-white/90 shadow-suave p-4">
        <span className="flex flex-1 flex-col">
          <span className="font-bold">Meu plano de parto</span>
          <span className="text-sm text-suave">Registre suas preferências e leve o PDF para a maternidade</span>
        </span>
        <span aria-hidden="true" className="text-xl text-suave">
          ›
        </span>
      </Link>
      <Link href="/app/guias/contracoes" className="flex items-center gap-3 rounded-3xl bg-white/90 shadow-suave p-4">
        <span className="flex flex-1 flex-col">
          <span className="font-bold">Contador de contrações</span>
          <span className="text-sm text-suave">Na hora do parto, saiba quando ligar para a maternidade</span>
        </span>
        <span aria-hidden="true" className="text-xl text-suave">
          ›
        </span>
      </Link>
      <p className="text-center text-[12px] leading-relaxed text-suave">
        Informação geral, em revisão por profissional de saúde. Não substitui a conversa com sua equipe.
      </p>
    </Pagina>
  );
}
