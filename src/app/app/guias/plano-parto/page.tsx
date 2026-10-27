import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { exigirUsuariaPronta, getPlano, getPlanoDeParto } from "@/lib/dal";
import { FormPlanoParto } from "./form";

export const metadata: Metadata = { title: "Plano de parto" };

async function Conteudo() {
  const { usuaria } = await exigirUsuariaPronta();
  const plano = await getPlano(usuaria.id);

  if (plano !== "premium") {
    return (
      <div className="flex flex-col gap-3 rounded-3xl bg-rosa-50 p-5">
        <p className="font-bold text-rosa-700">Recurso Premium</p>
        <p className="text-[15px] leading-relaxed">
          Monte seu plano de parto com perguntas guiadas sobre acompanhante, alívio da dor, posição, primeira hora com o bebê e cesárea. No fim, o
          Ninna gera um documento pronto para imprimir ou salvar em PDF e levar à maternidade.
        </p>
        <Link href="/app/premium" className="flex h-12 items-center justify-center rounded-2xl bg-rosa-600 px-5 font-semibold text-white hover:bg-rosa-700">
          Conhecer o Premium
        </Link>
      </div>
    );
  }

  const salvo = await getPlanoDeParto(usuaria.id);
  if (salvo === "indisponivel") {
    return <p className="rounded-2xl bg-white p-4 text-[15px] text-suave">O plano de parto ainda não está disponível. Tente de novo mais tarde.</p>;
  }

  return (
    <>
      {salvo && (
        <Link
          href="/app/guias/plano-parto/documento"
          className="flex h-12 items-center justify-center rounded-2xl border-2 border-linha bg-white font-semibold hover:border-rosa-300"
        >
          Ver o documento salvo
        </Link>
      )}
      <FormPlanoParto respostas={salvo?.respostas ?? {}} />
    </>
  );
}

export default function PlanoPartoPage() {
  return (
    <Pagina>
      <Voltar href="/app/guias/parto" rotulo="Tipos de parto" />
      <h1 className="text-[26px] font-bold leading-tight">Plano de parto</h1>
      <p className="-mt-2 text-[15px] leading-relaxed text-suave">
        Registre como você gostaria que fosse o seu parto. Responda só o que quiser e converse sobre o plano com sua equipe antes do grande dia.
      </p>
      <Suspense fallback={<Carregando />}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}
