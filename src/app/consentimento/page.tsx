import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Bolha, CabecalhoPublico, FundoSuave } from "@/components/acolhida";
import { AvisoMedico } from "@/components/ui";
import { getUsuaria, temConsentimento } from "@/lib/dal";
import { FormConsentimento } from "./form";

export const metadata: Metadata = { title: "Seus dados" };

async function Conteudo() {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/consentimento");
  if (await temConsentimento(usuaria.id)) redirect("/triagem/concluir");
  return <FormConsentimento />;
}

export default function ConsentimentoPage() {
  return (
    <FundoSuave>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pb-8 pt-5">
        <CabecalhoPublico />
        <div className="flex flex-col gap-3">
          <Bolha nome="casa" fundo="bg-lilas" className="size-20" />
          <h1 className="text-[28px] font-bold leading-tight tracking-tight">Seus dados, suas regras</h1>
          <p className="leading-relaxed text-suave">
            O Ninna lida com informações de saúde, que a LGPD protege de forma especial. Antes de continuar, precisamos
            da sua autorização.
          </p>
        </div>
        <Suspense fallback={<p className="text-suave">Carregando…</p>}>
          <Conteudo />
        </Suspense>
        <AvisoMedico />
      </main>
    </FundoSuave>
  );
}
