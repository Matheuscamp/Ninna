import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { exigirUsuariaPronta, obterConsulta } from "@/lib/dal";
import { isoParaLocal } from "@/lib/datas";
import { editarConsulta } from "../../actions";
import { FormConsulta } from "../../form";
import { RemoverConsulta } from "../../remover";

export const metadata: Metadata = { title: "Editar consulta" };

async function Formulario({ params }: { params: PageProps<"/app/agenda/[id]/editar">["params"] }) {
  const { usuaria } = await exigirUsuariaPronta();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const consulta = await obterConsulta(usuaria.id, id);
  if (!consulta) notFound();

  return (
    <>
      <FormConsulta
        acao={editarConsulta.bind(null, consulta.id)}
        iniciais={{
          titulo: consulta.titulo,
          ...isoParaLocal(consulta.data_hora),
          local: consulta.local ?? undefined,
          observacoes: consulta.observacoes ?? undefined,
        }}
        rotuloBotao="Salvar alterações"
      />
      <div className="flex justify-center border-t border-linha pt-4">
        <RemoverConsulta id={consulta.id} titulo={consulta.titulo} />
      </div>
    </>
  );
}

export default function EditarConsultaPage({ params }: PageProps<"/app/agenda/[id]/editar">) {
  return (
    <Pagina>
      <Voltar href="/app/agenda" rotulo="Agenda" />
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">Editar consulta</h1>
      <Suspense fallback={<Carregando />}>
        <Formulario params={params} />
      </Suspense>
    </Pagina>
  );
}
