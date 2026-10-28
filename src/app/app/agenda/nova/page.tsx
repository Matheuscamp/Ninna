import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { exigirUsuariaPronta } from "@/lib/dal";
import { criarConsulta } from "../actions";
import { FormConsulta } from "../form";

export const metadata: Metadata = { title: "Nova consulta" };

// Os guias abrem esta tela já com o título (e às vezes o local) preenchidos.
async function Formulario({ searchParams }: { searchParams: PageProps<"/app/agenda/nova">["searchParams"] }) {
  await exigirUsuariaPronta();
  const { titulo, local } = await searchParams;
  const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v.slice(0, 80) : undefined);
  return <FormConsulta acao={criarConsulta} iniciais={{ titulo: texto(titulo), local: texto(local) }} rotuloBotao="Adicionar à agenda" />;
}

export default function NovaConsultaPage({ searchParams }: PageProps<"/app/agenda/nova">) {
  return (
    <Pagina>
      <Voltar href="/app/agenda" rotulo="Agenda" />
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">Nova consulta</h1>
      <Suspense fallback={<Carregando />}>
        <Formulario searchParams={searchParams} />
      </Suspense>
    </Pagina>
  );
}
