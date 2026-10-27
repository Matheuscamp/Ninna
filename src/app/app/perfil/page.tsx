import type { Metadata } from "next";
import { Suspense } from "react";
import { AvisoMedico, Carregando, Pagina } from "@/components/ui";
import { exigirUsuariaPronta, getFicha, getPlano, linkDaFoto } from "@/lib/dal";
import { PerfilVisual } from "./visual";

export const metadata: Metadata = { title: "Perfil" };

const MENSAGENS: Record<string, string> = { ficha: "Dados salvos." };

async function Conteudo({ searchParams }: { searchParams: PageProps<"/app/perfil">["searchParams"] }) {
  const { usuaria, perfil, semanas, hoje } = await exigirUsuariaPronta();
  const [plano, ficha, { ok }] = await Promise.all([getPlano(usuaria.id), getFicha(usuaria.id), searchParams]);
  const fotoUrl = await linkDaFoto(ficha?.foto_caminho ?? null);
  return (
    <PerfilVisual
      email={usuaria.email}
      plano={plano}
      semanas={semanas}
      perfil={perfil}
      ficha={ficha}
      fotoUrl={fotoUrl}
      hoje={hoje}
      mensagem={typeof ok === "string" ? MENSAGENS[ok] : undefined}
    />
  );
}

export default function PerfilPage({ searchParams }: PageProps<"/app/perfil">) {
  return (
    <Pagina larga>
      <h1 className="text-[26px] font-bold">Perfil</h1>
      <Suspense fallback={<Carregando />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
      <AvisoMedico />
    </Pagina>
  );
}
