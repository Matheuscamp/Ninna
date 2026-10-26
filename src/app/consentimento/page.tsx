import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AvisoMedico, Logo, Pagina } from "@/components/ui";
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
    <Pagina>
      <Logo tamanho={56} />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Seus dados, suas regras</h1>
        <p className="leading-relaxed text-suave">
          O Ninna lida com informações de saúde, que a LGPD protege de forma especial. Antes de continuar, precisamos
          da sua autorização.
        </p>
      </div>
      <Suspense fallback={<p className="text-suave">Carregando…</p>}>
        <Conteudo />
      </Suspense>
      <AvisoMedico />
    </Pagina>
  );
}
