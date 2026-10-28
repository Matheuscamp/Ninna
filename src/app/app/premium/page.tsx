import type { Metadata } from "next";
import { Suspense } from "react";
import { AvisoMedico, Carregando, Pagina, TituloPagina, Voltar } from "@/components/ui";
import { exigirUsuariaPronta, getAssinatura, listarPagamentos } from "@/lib/dal";
import { PremiumVisual } from "./visual";

export const metadata: Metadata = { title: "Premium" };

async function Conteudo({ searchParams }: { searchParams: PageProps<"/app/premium">["searchParams"] }) {
  const { usuaria } = await exigirUsuariaPronta();
  const [{ plano, validoAte }, pagamentos, { pagamento }] = await Promise.all([
    getAssinatura(usuaria.id),
    listarPagamentos(usuaria.id),
    searchParams,
  ]);
  return (
    <PremiumVisual
      plano={plano}
      validoAte={validoAte}
      pagamentos={pagamentos}
      pagamento={typeof pagamento === "string" ? pagamento : undefined}
    />
  );
}

export default function PremiumPage({ searchParams }: PageProps<"/app/premium">) {
  return (
    <Pagina>
      <Voltar href="/app/perfil" rotulo="Perfil" />
      <TituloPagina titulo="Ninna Premium" ilustracao="coracao" fundo="bg-rosa-100" />
      <Suspense fallback={<Carregando />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
      <AvisoMedico />
    </Pagina>
  );
}
