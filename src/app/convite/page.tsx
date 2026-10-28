import type { Metadata } from "next";
import { Suspense } from "react";
import { TelaAvulsa } from "@/components/acolhida";
import { destinoSeguro } from "@/lib/convite";
import { FormConvite } from "./form";

export const metadata: Metadata = { title: "Convite" };

async function Formulario({ searchParams }: { searchParams: PageProps<"/convite">["searchParams"] }) {
  const { next } = await searchParams;
  return <FormConvite next={destinoSeguro(next)} />;
}

// Porta de entrada do teste fechado (ativa só com CODIGO_CONVITE definido).
export default function ConvitePage({ searchParams }: PageProps<"/convite">) {
  return (
    <TelaAvulsa ilustracao="coracao" fundo="bg-rosa-100">
      <div className="flex flex-col gap-2">
        <span className="self-start rounded-full bg-rosa-50 px-3 py-1 text-[13px] font-bold text-rosa-700">Versão de testes</span>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">O Ninna está em teste fechado</h1>
        <p className="leading-relaxed text-suave">
          Digite o código que você recebeu de quem te convidou. Obrigada por ajudar a melhorar o app: sua opinião faz diferença.
        </p>
      </div>
      <Suspense>
        <Formulario searchParams={searchParams} />
      </Suspense>
    </TelaAvulsa>
  );
}
