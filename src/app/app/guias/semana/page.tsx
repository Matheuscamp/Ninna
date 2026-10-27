import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { SEMANA_MAX, SEMANA_MIN } from "@/content/guias";
import { exigirUsuariaPronta, listarTarefasFeitas } from "@/lib/dal";
import { GuiaSemana } from "./guia-semana";

export const metadata: Metadata = { title: "O que fazer nesta fase" };

async function Conteudo() {
  const { usuaria, perfil, semanas } = await exigirUsuariaPronta();
  if (perfil.perfil !== "gestante") redirect("/app");
  const feitas = await listarTarefasFeitas(usuaria.id);
  const semanaAtual = Math.min(SEMANA_MAX, Math.max(SEMANA_MIN, semanas ?? SEMANA_MIN));
  return <GuiaSemana semanaAtual={semanaAtual} feitasIniciais={feitas} />;
}

export default function GuiaSemanaPage() {
  return (
    <Pagina>
      <Voltar href="/app" />
      <h1 className="text-[26px] font-bold leading-tight">O que fazer nesta fase</h1>
      <Suspense fallback={<Carregando />}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}
