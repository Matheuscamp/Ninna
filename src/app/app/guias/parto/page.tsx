import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
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
      <h1 className="text-[26px] font-bold leading-tight">Tipos de parto</h1>
      <p className="-mt-2 text-[15px] leading-relaxed text-suave">
        Conheça as opções para conversar com seu médico. A via de parto é decidida com a equipe, pensando na sua
        saúde e na do bebê.
      </p>
      <AbasParto />
      <Suspense fallback={<Carregando />}>
        <AvisoCesareaAnterior />
      </Suspense>
      <p className="text-center text-[12px] leading-relaxed text-suave">
        Informação geral, em revisão por profissional de saúde. Não substitui a conversa com sua equipe.
      </p>
    </Pagina>
  );
}
