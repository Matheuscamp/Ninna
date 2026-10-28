import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Carregando, Pagina, TituloPagina, Voltar } from "@/components/ui";
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
      <TituloPagina titulo="O que fazer nesta fase" ilustracao="prancheta" fundo="bg-azul-100" />
      <Suspense fallback={<Carregando />}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}
