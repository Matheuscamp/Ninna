import type { Metadata } from "next";
import { Suspense } from "react";
import { AvisoMedico, Carregando, Pagina, Voltar } from "@/components/ui";
import { exigirUsuariaPronta, getAssinatura } from "@/lib/dal";
import { PremiumVisual } from "./visual";

export const metadata: Metadata = { title: "Premium" };

async function Conteudo({ searchParams }: { searchParams: PageProps<"/app/premium">["searchParams"] }) {
  const { usuaria } = await exigirUsuariaPronta();
  const [{ plano, validoAte }, { pagamento }] = await Promise.all([getAssinatura(usuaria.id), searchParams]);
  return <PremiumVisual plano={plano} validoAte={validoAte} pagamento={typeof pagamento === "string" ? pagamento : undefined} />;
}

export default function PremiumPage({ searchParams }: PageProps<"/app/premium">) {
  return (
    <Pagina>
      <Voltar href="/app/perfil" rotulo="Perfil" />
      <h1 className="text-[26px] font-bold leading-tight">Ninna Premium</h1>
      <Suspense fallback={<Carregando />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
      <AvisoMedico />
    </Pagina>
  );
}
