import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { exigirUsuariaPronta, linksDeMiniatura, obterDocumento } from "@/lib/dal";
import { formatarTamanho } from "@/lib/documentos";
import { editarDocumento } from "../../actions";
import { ExcluirDocumento } from "../../excluir";
import { IconePdf } from "../../icones";
import { FormEditarDocumento } from "./form";

export const metadata: Metadata = { title: "Editar documento" };

async function Edicao({ params }: { params: PageProps<"/app/documentos/[id]/editar">["params"] }) {
  const { usuaria } = await exigirUsuariaPronta();
  const { id } = await params;
  const doc = await obterDocumento(usuaria.id, id);
  if (!doc) notFound();
  const ehImagem = doc.tipo_mime.startsWith("image/");
  const miniatura = ehImagem ? (await linksDeMiniatura([doc.caminho]))[doc.caminho] : undefined;

  return (
    <>
      <a href={`/app/documentos/${doc.id}/arquivo`} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-3xl bg-white/90 shadow-suave p-3">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-azul-50 text-rosa-600">
          {miniatura ? (
            // eslint-disable-next-line @next/next/no-img-element -- link assinado temporário do Storage privado
            <img src={miniatura} alt="" className="size-full object-cover" />
          ) : (
            <IconePdf />
          )}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-semibold">{doc.nome_original}</span>
          <span className="text-[13px] text-suave">
            {ehImagem ? "Imagem" : "PDF"} · {formatarTamanho(doc.tamanho)} · toque para abrir
          </span>
        </span>
      </a>
      <FormEditarDocumento
        acao={editarDocumento.bind(null, doc.id)}
        iniciais={{
          nome: doc.nome,
          categoria: doc.categoria,
          dataDocumento: doc.data_documento ?? "",
          profissional: doc.profissional ?? "",
          descricao: doc.descricao ?? "",
        }}
      />
      <div className="flex justify-center border-t border-linha pt-4">
        <ExcluirDocumento id={doc.id} nome={doc.nome} />
      </div>
    </>
  );
}

export default function EditarDocumentoPage({ params }: PageProps<"/app/documentos/[id]/editar">) {
  return (
    <Pagina>
      <Voltar href="/app/documentos" rotulo="Documentos" />
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">Editar documento</h1>
      <Suspense fallback={<Carregando />}>
        <Edicao params={params} />
      </Suspense>
    </Pagina>
  );
}
